"""
backtest_distress.py — Fulcrum v5 Phase 4 (backtest + report), v2
================================================================

Fixes a label-set leak surfaced on the v1 report: 603 of the 1,316
Item 1.03 filings were follow-ups inside an existing case
(confirmations, emergence, etc.) rather than new case starts. Rows
inside a case were getting positive labels — tightening-into-event
AUC inflation.

This version:
  - Collapses the label set to case starts. First Item 1.03 per CIK;
    a later 1.03 becomes a new case only if it starts >=24 months
    after the previous accepted case (Chapter 22 handling).
  - Drops every panel row for a bankrupt CIK from its case start
    through 24 months later ("already in bankruptcy, not a target").
  - Reports base rate per horizon and top-decile lift
    (precision / base rate) for each score.
  - Runs every score on a common subset (rows where ALL five scores
    exist) so they compare apples-to-apples.
  - Reports per-company lead time: for each bankrupt company, the
    first quarter-end in the 24 months before the petition where the
    CIK sat in the panel's riskiest 10% on that score. Reports the
    median lead and the share flagged >=6 months ahead.
  - Reports coverage by COMPANY, not by filing. Separately counts
    coverage among companies whose last pre-petition XBRL total
    liabilities were >=$250m, and lists those misses by name with
    their reasons (SIC excluded / debt below threshold / no XBRL /
    pre-panel-window).
  - Keeps liquidity-runway in the score table but notes its lack of
    skill; tier logic that uses it should wait on quarterly LTM.

No Merton / CHS here — see v1 header.

Output: quant/research/distress_backtest.md
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
import zipfile
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


# =============================================================================
# Config
# =============================================================================

CHAPTER_22_THRESHOLD_MONTHS = 24   # gap required for a new case per CIK
IN_CASE_WINDOW_MONTHS = 24         # drop panel rows for this long post-petition
COMPANY_LOOKBACK_MONTHS = 24       # lead-time search window
LIABILITIES_FLOOR = 250_000_000    # coverage-subset threshold
BASE_RATE_HORIZON_MONTHS = (6, 12)

SCORE_SPEC: list[tuple[str, str, bool]] = [
    # (panel attribute, label, higher_is_riskier)
    ("altman", "Altman Z''", False),
    ("coverage", "Coverage (EBIT / Interest)", False),
    ("net_leverage", "Net leverage (NetDebt / EBITDA)", True),
    ("runway", "Liquidity runway (months)", False),
    ("maturity_pressure", "24m maturity pressure", True),
]
SCORE_KEYS = [k for k, _, _ in SCORE_SPEC]


# =============================================================================
# Data types
# =============================================================================

@dataclass
class PanelRow:
    as_of_date: date
    cik: str
    sic: int | None
    name: str
    coverage: float | None
    net_leverage: float | None
    altman: float | None
    runway: float | None
    maturity_pressure: float | None

    def score(self, key: str) -> float | None:
        return getattr(self, key, None)


@dataclass
class BankruptcyCase:
    cik: str
    name: str
    petition_date: date
    accession: str


@dataclass
class BankruptcyFiling:
    """One raw Item 1.03 filing (before case-start collapse)."""
    cik: str
    name: str
    filing_date: date
    accession: str


# =============================================================================
# Loaders
# =============================================================================

def _parse_date(s: str) -> date | None:
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _as_float(s: str) -> float | None:
    if s in ("", None):
        return None
    try:
        v = float(s)
        if math.isnan(v) or math.isinf(v):
            return None
        return v
    except (TypeError, ValueError):
        return None


def load_panel(path: Path) -> list[PanelRow]:
    rows: list[PanelRow] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            d = _parse_date(r.get("as_of_date", ""))
            cik = (r.get("cik") or "").zfill(10)
            if d is None or not cik:
                continue
            try:
                sic_raw = r.get("sic", "")
                sic = int(sic_raw) if sic_raw not in ("", None) else None
            except ValueError:
                sic = None
            rows.append(PanelRow(
                as_of_date=d,
                cik=cik,
                sic=sic,
                name=r.get("name", ""),
                coverage=_as_float(r.get("coverage", "")),
                net_leverage=_as_float(r.get("net_leverage", "")),
                altman=_as_float(r.get("altman_z_double_prime", "")),
                runway=_as_float(r.get("runway_months", "")),
                maturity_pressure=_as_float(r.get("maturity_pressure_24m", "")),
            ))
    return rows


def load_raw_filings(path: Path) -> list[BankruptcyFiling]:
    rows: list[BankruptcyFiling] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            d = _parse_date(r.get("filing_date", ""))
            cik = (r.get("cik") or "").zfill(10)
            if d is None or not cik:
                continue
            rows.append(BankruptcyFiling(
                cik=cik,
                name=r.get("name", ""),
                filing_date=d,
                accession=r.get("accession", ""),
            ))
    return rows


# =============================================================================
# Case-start collapse
# =============================================================================

def collapse_to_cases(
    filings: list[BankruptcyFiling],
    threshold_months: int = CHAPTER_22_THRESHOLD_MONTHS,
) -> tuple[list[BankruptcyCase], dict[str, int]]:
    """
    Collapse raw Item 1.03 filings per CIK. First filing opens a case.
    A later filing opens a new case iff its date is >= threshold_months
    after the previous accepted case's start.

    Returns (cases, stats). stats keys: raw_filings, follow_ups_dropped,
    chapter_22_cases, distinct_ciks, cases, follow_up_gap_months (median).
    """
    by_cik: dict[str, list[BankruptcyFiling]] = defaultdict(list)
    for f in filings:
        by_cik[f.cik].append(f)
    for v in by_cik.values():
        v.sort(key=lambda x: x.filing_date)

    cases: list[BankruptcyCase] = []
    follow_up_gaps: list[float] = []
    chapter_22_cases = 0

    for cik, fs in by_cik.items():
        accepted_last: date | None = None
        for f in fs:
            if accepted_last is None:
                cases.append(BankruptcyCase(
                    cik=cik, name=f.name, petition_date=f.filing_date,
                    accession=f.accession,
                ))
                accepted_last = f.filing_date
                continue
            gap_months = (f.filing_date - accepted_last).days / 30.44
            if gap_months >= threshold_months:
                cases.append(BankruptcyCase(
                    cik=cik, name=f.name, petition_date=f.filing_date,
                    accession=f.accession,
                ))
                chapter_22_cases += 1
                accepted_last = f.filing_date
            else:
                follow_up_gaps.append(gap_months)

    stats = {
        "raw_filings": len(filings),
        "distinct_ciks": len(by_cik),
        "cases": len(cases),
        "follow_ups_dropped": len(filings) - len(cases),
        "chapter_22_cases": chapter_22_cases,
        "follow_up_gap_median_months": (
            sorted(follow_up_gaps)[len(follow_up_gaps) // 2]
            if follow_up_gaps else None
        ),
    }
    return cases, stats


# =============================================================================
# In-case row drop
# =============================================================================

def drop_in_case_rows(
    panel: list[PanelRow],
    cases: list[BankruptcyCase],
    window_months: int = IN_CASE_WINDOW_MONTHS,
) -> tuple[list[PanelRow], int]:
    """Drop panel rows where case_start <= as_of <= case_start + window_months."""
    windows: dict[str, list[tuple[date, date]]] = defaultdict(list)
    for c in cases:
        end = c.petition_date + timedelta(days=int(30.44 * window_months))
        windows[c.cik].append((c.petition_date, end))

    kept: list[PanelRow] = []
    dropped = 0
    for r in panel:
        hits = windows.get(r.cik, ())
        if any(s <= r.as_of_date <= e for s, e in hits):
            dropped += 1
            continue
        kept.append(r)
    return kept, dropped


# =============================================================================
# Labels
# =============================================================================

def build_cik_case_dates(cases: list[BankruptcyCase]) -> dict[str, list[date]]:
    out: dict[str, list[date]] = defaultdict(list)
    for c in cases:
        out[c.cik].append(c.petition_date)
    for v in out.values():
        v.sort()
    return out


def next_case_after(
    cik_cases: dict[str, list[date]], cik: str, after: date,
) -> date | None:
    dates = cik_cases.get(cik, ())
    for d in dates:
        if d > after:
            return d
    return None


def label_within(
    cik_cases: dict[str, list[date]], cik: str, as_of: date, months: int,
) -> bool:
    nxt = next_case_after(cik_cases, cik, as_of)
    if nxt is None:
        return False
    return (nxt - as_of).days <= int(30.44 * months)


# =============================================================================
# Ranking + AUC
# =============================================================================

def rank_series(
    rows: Iterable[PanelRow], key: str, higher_is_riskier: bool,
) -> dict[tuple[date, str], tuple[int, int]]:
    groups: dict[date, list[tuple[float, str]]] = defaultdict(list)
    for r in rows:
        v = r.score(key)
        if v is None or math.isnan(v) or math.isinf(v):
            continue
        risk_score = v if higher_is_riskier else -v
        groups[r.as_of_date].append((risk_score, r.cik))

    out: dict[tuple[date, str], tuple[int, int]] = {}
    for d, items in groups.items():
        items.sort(key=lambda t: t[0], reverse=True)
        n = len(items)
        for idx, (_, cik) in enumerate(items):
            out[(d, cik)] = (idx + 1, n)
    return out


def roc_auc(pos_scores: list[float], neg_scores: list[float]) -> float | None:
    if not pos_scores or not neg_scores:
        return None
    combined = [(s, 1) for s in pos_scores] + [(s, 0) for s in neg_scores]
    combined.sort(key=lambda t: t[0])
    ranks: dict[int, float] = {}
    i = 0
    while i < len(combined):
        j = i
        while j + 1 < len(combined) and combined[j + 1][0] == combined[i][0]:
            j += 1
        avg_rank = (i + j + 2) / 2
        for k in range(i, j + 1):
            ranks[k] = avg_rank
        i = j + 1
    sum_ranks_pos = sum(ranks[k] for k in range(len(combined)) if combined[k][1] == 1)
    n_pos = len(pos_scores)
    n_neg = len(neg_scores)
    u = sum_ranks_pos - n_pos * (n_pos + 1) / 2
    return u / (n_pos * n_neg)


def median_of(xs: list[float]) -> float | None:
    if not xs:
        return None
    xs = sorted(xs)
    n = len(xs)
    if n % 2 == 1:
        return xs[n // 2]
    return (xs[n // 2 - 1] + xs[n // 2]) / 2


# =============================================================================
# Per-score metrics
# =============================================================================

@dataclass
class ScoreMetrics:
    label: str
    key: str
    n_rows: int
    base_rate_12m: float
    base_rate_6m: float
    auc_12m: float | None
    auc_6m: float | None
    top_decile_precision_12m: float | None
    top_decile_precision_6m: float | None
    lift_12m: float | None
    lift_6m: float | None
    companies_flagged: int
    median_lead_months: float | None
    share_flagged_6m_ahead: float | None


def score_metrics(
    panel: list[PanelRow],
    cases: list[BankruptcyCase],
    label: str,
    key: str,
    higher_is_riskier: bool,
) -> ScoreMetrics:
    cik_cases = build_cik_case_dates(cases)
    ranks = rank_series(panel, key, higher_is_riskier)

    pos12: list[float] = []
    neg12: list[float] = []
    pos6: list[float] = []
    neg6: list[float] = []
    tp_12 = 0
    tp_6 = 0
    top_rows_12 = 0
    top_rows_6 = 0
    n_rows = 0
    labeled_12 = 0
    labeled_6 = 0

    # Per-CIK: earliest date the CIK was in the top decile in the 24m
    # before its next case start.
    first_flag_before_case: dict[str, date] = {}

    for r in panel:
        s = r.score(key)
        if s is None or math.isnan(s) or math.isinf(s):
            continue
        n_rows += 1
        lab12 = label_within(cik_cases, r.cik, r.as_of_date, 12)
        lab6 = label_within(cik_cases, r.cik, r.as_of_date, 6)
        if lab12:
            labeled_12 += 1
        if lab6:
            labeled_6 += 1
        risk_score = s if higher_is_riskier else -s
        (pos12 if lab12 else neg12).append(risk_score)
        (pos6 if lab6 else neg6).append(risk_score)

        rank, n = ranks.get((r.as_of_date, r.cik), (None, None))
        if rank is not None and n is not None and n > 0:
            in_top = rank <= max(1, n // 10)
            if in_top:
                top_rows_12 += 1
                top_rows_6 += 1
                if lab12:
                    tp_12 += 1
                if lab6:
                    tp_6 += 1
                # Lead-time bookkeeping: find the next case for this CIK
                # within 24 months; record the earliest such qe.
                next_case = next_case_after(cik_cases, r.cik, r.as_of_date)
                if next_case is not None:
                    lead_days = (next_case - r.as_of_date).days
                    if lead_days <= int(30.44 * COMPANY_LOOKBACK_MONTHS):
                        prev = first_flag_before_case.get(r.cik)
                        if prev is None or r.as_of_date < prev:
                            first_flag_before_case[r.cik] = r.as_of_date

    def _safe(a: int, b: int) -> float | None:
        return (a / b) if b else None

    base_12 = _safe(labeled_12, n_rows) or 0.0
    base_6 = _safe(labeled_6, n_rows) or 0.0
    prec_12 = _safe(tp_12, top_rows_12)
    prec_6 = _safe(tp_6, top_rows_6)
    lift_12 = (prec_12 / base_12) if (prec_12 is not None and base_12 > 0) else None
    lift_6 = (prec_6 / base_6) if (prec_6 is not None and base_6 > 0) else None

    # Per-company lead-time stats.
    leads_months: list[float] = []
    for cik, qe in first_flag_before_case.items():
        next_case = next_case_after(cik_cases, cik, qe)
        if next_case is None:
            continue
        leads_months.append((next_case - qe).days / 30.44)
    median_lead = median_of(leads_months)
    share_6m = (
        sum(1 for lm in leads_months if lm >= 6) / len(leads_months)
        if leads_months else None
    )

    return ScoreMetrics(
        label=label,
        key=key,
        n_rows=n_rows,
        base_rate_12m=base_12,
        base_rate_6m=base_6,
        auc_12m=roc_auc(pos12, neg12),
        auc_6m=roc_auc(pos6, neg6),
        top_decile_precision_12m=prec_12,
        top_decile_precision_6m=prec_6,
        lift_12m=lift_12,
        lift_6m=lift_6,
        companies_flagged=len(first_flag_before_case),
        median_lead_months=median_lead,
        share_flagged_6m_ahead=share_6m,
    )


def common_subset(panel: list[PanelRow]) -> list[PanelRow]:
    """Rows where every score is finite."""
    out: list[PanelRow] = []
    for r in panel:
        ok = True
        for k in SCORE_KEYS:
            v = r.score(k)
            if v is None or (isinstance(v, float) and (math.isnan(v) or math.isinf(v))):
                ok = False
                break
        if ok:
            out.append(r)
    return out


# =============================================================================
# Coverage (by company) + liabilities-subset check
# =============================================================================

@dataclass
class CoverageRecord:
    cik: str
    name: str
    petition_date: date
    in_panel_pre_petition: bool
    last_liabilities: float | None
    last_liabilities_date: date | None
    sic: int | None
    reason_if_missing: str | None


def _facts_latest_leq(obs: list[dict], as_of: date) -> tuple[float | None, date | None]:
    """Latest observation with end<=as_of and filed<=as_of."""
    best_val: float | None = None
    best_end: date | None = None
    best_filed: date | None = None
    for o in obs:
        end = _parse_date(o.get("end", ""))
        filed = _parse_date(o.get("filed", ""))
        v = o.get("val")
        if end is None or filed is None or v is None:
            continue
        if end > as_of or filed > as_of:
            continue
        try:
            fval = float(v)
        except (TypeError, ValueError):
            continue
        key = (end, filed)
        if best_end is None or key > (best_end, best_filed):
            best_val = fval
            best_end = end
            best_filed = filed
    return best_val, best_end


def _load_cik_companyfacts(zip_path: Path, cik: str) -> dict | None:
    """Read one CIK's companyfacts JSON from the bulk zip."""
    member = f"CIK{cik}.json"
    try:
        with zipfile.ZipFile(zip_path) as zf:
            try:
                with zf.open(member) as f:
                    return json.loads(f.read().decode("utf-8"))
            except KeyError:
                return None
    except zipfile.BadZipFile:
        return None


def _get_liabilities(cf: dict, as_of: date) -> tuple[float | None, date | None]:
    facts = (cf.get("facts") or {}).get("us-gaap", {}) or {}
    for tag in ("Liabilities", "LiabilitiesAndStockholdersEquity"):
        node = facts.get(tag)
        if not node:
            continue
        obs = (node.get("units") or {}).get("USD") or []
        if obs:
            v, end = _facts_latest_leq(obs, as_of)
            if v is not None:
                return v, end
    return None, None


def build_coverage(
    panel: list[PanelRow],
    cases: list[BankruptcyCase],
    sic_map: dict[str, tuple[int | None, str]],
    companyfacts_zip: Path | None,
) -> list[CoverageRecord]:
    """
    For each distinct CIK in `cases`, determine:
      - whether the CIK appears in `panel` any time in the 24 months before
        the petition (coverage = yes/no)
      - last pre-petition XBRL Liabilities (from companyfacts.zip)
      - SIC (from submissions-derived map)
      - reason if missing from panel (SIC excluded / no XBRL / debt below
        threshold with liabilities above / pre-panel-window)
    """
    panel_by_cik: dict[str, list[PanelRow]] = defaultdict(list)
    panel_min_date: date | None = None
    for r in panel:
        panel_by_cik[r.cik].append(r)
        panel_min_date = r.as_of_date if panel_min_date is None else min(panel_min_date, r.as_of_date)

    first_case_per_cik: dict[str, BankruptcyCase] = {}
    for c in cases:
        prev = first_case_per_cik.get(c.cik)
        if prev is None or c.petition_date < prev.petition_date:
            first_case_per_cik[c.cik] = c

    records: list[CoverageRecord] = []
    for cik, case in first_case_per_cik.items():
        lookback_start = case.petition_date - timedelta(days=int(30.44 * COMPANY_LOOKBACK_MONTHS))
        rows_in_window = [
            r for r in panel_by_cik.get(cik, [])
            if lookback_start <= r.as_of_date < case.petition_date
        ]
        in_panel = len(rows_in_window) > 0
        sic, _ = sic_map.get(cik, (None, ""))

        last_liab: float | None = None
        last_liab_date: date | None = None
        if companyfacts_zip is not None:
            cf = _load_cik_companyfacts(companyfacts_zip, cik)
            if cf is not None:
                last_liab, last_liab_date = _get_liabilities(cf, case.petition_date)

        reason: str | None = None
        if not in_panel:
            if sic is not None and 6000 <= sic <= 6799:
                reason = f"excluded SIC {sic}"
            elif last_liab is None:
                reason = "no pre-petition XBRL facts"
            elif last_liab < LIABILITIES_FLOOR:
                reason = f"liabilities ${last_liab/1e6:.0f}m below $250m"
            elif panel_min_date is not None and case.petition_date <= panel_min_date:
                reason = "petition before panel window"
            else:
                reason = "debt < $250m (non-debt liabilities dominant) or missing debt tag"

        records.append(CoverageRecord(
            cik=cik,
            name=case.name,
            petition_date=case.petition_date,
            in_panel_pre_petition=in_panel,
            last_liabilities=last_liab,
            last_liabilities_date=last_liab_date,
            sic=sic,
            reason_if_missing=reason,
        ))
    return records


def load_sic_map(submissions_zip: Path) -> dict[str, tuple[int | None, str]]:
    out: dict[str, tuple[int | None, str]] = {}
    with zipfile.ZipFile(submissions_zip) as zf:
        for member in zf.namelist():
            if not member.startswith("CIK") or not member.endswith(".json"):
                continue
            stem = Path(member).stem
            if "-submissions-" in stem:
                continue
            try:
                with zf.open(member) as f:
                    j = json.loads(f.read().decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError):
                continue
            cik_raw = j.get("cik")
            if cik_raw is None:
                continue
            cik = str(cik_raw).zfill(10)
            sic_raw = j.get("sic")
            sic: int | None = None
            if sic_raw not in (None, ""):
                try:
                    sic = int(sic_raw)
                except (TypeError, ValueError):
                    sic = None
            name = j.get("name") or ""
            out[cik] = (sic, name)
    return out


# =============================================================================
# Markdown rendering
# =============================================================================

def _fmt(x: float | None, digits: int = 3) -> str:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        return "—"
    return f"{x:.{digits}f}"


def _fmt_pct(x: float | None) -> str:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        return "—"
    return f"{x * 100:.2f}%"


def _score_table_header() -> list[str]:
    return [
        "| Score | n rows | base 12m | base 6m | AUC 12m | AUC 6m | Top-10% prec 12m | Lift 12m | Top-10% prec 6m | Lift 6m | Co. flagged | Median lead (mo) | ≥6m ahead |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]


def _score_table_row(m: ScoreMetrics) -> str:
    return (
        f"| {m.label} | {m.n_rows:,} | "
        f"{_fmt_pct(m.base_rate_12m)} | {_fmt_pct(m.base_rate_6m)} | "
        f"{_fmt(m.auc_12m)} | {_fmt(m.auc_6m)} | "
        f"{_fmt_pct(m.top_decile_precision_12m)} | {_fmt(m.lift_12m, 2)}× | "
        f"{_fmt_pct(m.top_decile_precision_6m)} | {_fmt(m.lift_6m, 2)}× | "
        f"{m.companies_flagged:,} | {_fmt(m.median_lead_months, 1)} | "
        f"{_fmt_pct(m.share_flagged_6m_ahead)} |"
    )


def render_markdown(
    stats: dict,
    panel_full_n: int,
    panel_after_drop_n: int,
    rows_dropped_in_case: int,
    cases: list[BankruptcyCase],
    coverage_records: list[CoverageRecord],
    full_metrics: list[ScoreMetrics],
    common_metrics: list[ScoreMetrics],
    common_subset_n: int,
) -> str:
    out: list[str] = []
    gen_at = datetime.now(timezone.utc).isoformat()
    n_cases = len(cases)
    out.append(f"# Fulcrum v5 Phase 4 — Distress Radar backtest (v2)\n")
    out.append(
        f"_Generated {gen_at}. Panel: {panel_full_n:,} rows at load "
        f"(after in-case drop: {panel_after_drop_n:,} rows; "
        f"{rows_dropped_in_case:,} rows dropped). "
        f"Bankruptcy filings loaded: {stats['raw_filings']:,}; "
        f"distinct CIKs: {stats['distinct_ciks']:,}; "
        f"follow-up filings dropped: {stats['follow_ups_dropped']:,}; "
        f"Chapter 22 refilings: {stats['chapter_22_cases']:,}; "
        f"**final cases: {n_cases:,}**._\n"
    )

    out.append("## Label-set scope\n")
    out.append(
        "SEC 8-K Item 1.03 covers \"Bankruptcy or Receivership\" — not Chapter 11 "
        "specifically. This label set therefore represents **bankruptcy filings** "
        "(Chapter 11 + Chapter 7 + receiverships, and occasionally Chapter 15 or "
        "non-US proceedings disclosed on US-listed entities). Classification by "
        "chapter would require pulling each 8-K body and scanning for the chapter "
        "keyword; left as a follow-up. Treating all as \"bankruptcy filing\" is "
        "conservative — if a sizeable fraction is Chapter 7 / liquidation, the "
        "scores' lead time understates what's achievable for Chapter 11 reorg "
        "candidates (which the Distress Radar is built to catch)."
    )
    if stats.get("follow_up_gap_median_months") is not None:
        out.append(
            f"\nMedian gap between a follow-up filing and its parent case: "
            f"**{stats['follow_up_gap_median_months']:.1f} months**. That lines up "
            f"with the plan-confirmation / emergence rhythm (not new petitions).\n"
        )
    else:
        out.append("")

    # ---------------------------------------------------------------------
    # Coverage by company
    # ---------------------------------------------------------------------
    out.append("## Coverage by company (not by filing)\n")
    covered = [r for r in coverage_records if r.in_panel_pre_petition]
    missing = [r for r in coverage_records if not r.in_panel_pre_petition]
    out.append(
        f"Of the **{len(coverage_records):,} distinct bankrupt companies**, "
        f"**{len(covered):,} ({len(covered) / max(1, len(coverage_records)) * 100:.1f}%)** "
        f"appear in the panel at least once in the 24 months before their first "
        f"petition.\n"
    )

    big_pool = [r for r in coverage_records if r.last_liabilities is not None
                and r.last_liabilities >= LIABILITIES_FLOOR]
    big_covered = [r for r in big_pool if r.in_panel_pre_petition]
    big_missing = [r for r in big_pool if not r.in_panel_pre_petition]
    if big_pool:
        out.append(
            f"### Subset: last pre-petition XBRL Liabilities ≥ $250m\n"
            f"**{len(big_covered):,} / {len(big_pool):,} "
            f"({len(big_covered) / len(big_pool) * 100:.1f}%)** of these "
            f"companies are in the panel in the 24 months before petition. "
            f"The misses below are the ones whose economic size says they "
            f"belonged in the universe but weren't captured.\n"
        )
        if big_missing:
            out.append("| Petition | Name | CIK | Liabilities (last) | SIC | Reason |")
            out.append("|---|---|---|---:|---:|---|")
            for r in sorted(big_missing, key=lambda x: x.petition_date):
                liab_str = (f"${r.last_liabilities/1e9:.1f}B" if r.last_liabilities is not None and r.last_liabilities >= 1e9
                            else f"${r.last_liabilities/1e6:.0f}M" if r.last_liabilities is not None else "—")
                sic_str = str(r.sic) if r.sic is not None else "—"
                out.append(
                    f"| {r.petition_date} | {r.name} | {r.cik} | "
                    f"{liab_str} | {sic_str} | {r.reason_if_missing or '—'} |"
                )
            out.append("")
    else:
        out.append(
            "No bankrupt companies have a pre-petition XBRL Liabilities tag "
            "on file. That is itself a finding — companies that stop filing well "
            "before bankruptcy drop out of this check.\n"
        )

    # ---------------------------------------------------------------------
    # Score tables
    # ---------------------------------------------------------------------
    out.append("## Score metrics — full sample\n")
    out.append(
        "Each row is scored on whatever subset the panel has for that key.\n"
    )
    out.extend(_score_table_header())
    for m in full_metrics:
        out.append(_score_table_row(m))
    out.append("")

    out.append(
        f"## Score metrics — common subset ({common_subset_n:,} rows where all "
        f"five scores exist)\n"
    )
    out.append(
        "Apples-to-apples: each score is evaluated on the same rows so AUC and "
        "lift comparisons are not biased by which rows were available.\n"
    )
    out.extend(_score_table_header())
    for m in common_metrics:
        out.append(_score_table_row(m))
    out.append("")

    out.append("### Read conventions\n")
    out.append(
        "- Sign on net leverage and maturity-pressure is flipped so \"top decile\" "
        "always means riskiest.\n"
        "- `Base 12m` and `Base 6m` are the share of panel rows for that score "
        "whose CIK files a bankruptcy within the forward window.\n"
        "- `Lift` = top-decile precision ÷ base rate. 1.0× is random; >3× is an "
        "informative signal given the small base rate.\n"
        "- `Co. flagged` counts distinct CIKs the score entered the top decile at "
        "any quarter-end in the 24 months before their case start.\n"
        "- `Median lead` is median months from the first in-top-decile quarter-end "
        "to the petition date, per bankrupt company (not per row).\n"
        "- `≥6m ahead` is the share of flagged companies first flagged at least "
        "six months before the petition.\n"
    )

    out.append("### Caveats\n")
    out.append(
        "- Flow quantities (OperatingIncomeLoss, InterestExpense, D&A, CFO, "
        "capex) use the most recent FY (10-K) observation — LTM stale up to "
        "~12 months. Quarterly LTM aggregation is a follow-up and should "
        "re-lift runway and maturity-pressure.\n"
        "- Liquidity runway in the current pass shows essentially no skill "
        "(lift close to 1×). Keep it in the table for transparency, but tier "
        "rules that use it should wait on quarterly LTM.\n"
        "- Merton distance-to-default and CHS failure probability aren't scored "
        "here (Yahoo lacks delisted-ticker prices). Live-only add-ons.\n"
        "- Universe excludes the market-cap-below-debt branch for the backtest "
        "(no price panel). That branch stays live in the production radar.\n"
    )

    return "\n".join(out)


# =============================================================================
# Driver
# =============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(description="Distress Radar backtest v2 + report")
    parser.add_argument("--panel", default="quant/research/distress_panel.csv")
    parser.add_argument("--ch11", default="quant/research/ch11_filings.csv")
    parser.add_argument("--submissions", default="quant/.cache/sec/submissions.zip")
    parser.add_argument("--companyfacts", default="quant/.cache/sec/companyfacts.zip")
    parser.add_argument("--out", default="quant/research/distress_backtest.md")
    args = parser.parse_args()

    panel_path = Path(args.panel)
    ch11_path = Path(args.ch11)
    if not panel_path.exists():
        print(f"❌ Panel missing: {panel_path}", file=sys.stderr)
        return 2
    if not ch11_path.exists():
        print(f"❌ Ch11 list missing: {ch11_path}", file=sys.stderr)
        return 2

    print(f"  Loading panel from {panel_path} …", flush=True)
    panel = load_panel(panel_path)
    print(f"  ✓ {len(panel):,} panel rows at load", flush=True)

    print(f"  Loading bankruptcy filings from {ch11_path} …", flush=True)
    raw = load_raw_filings(ch11_path)
    print(f"  ✓ {len(raw):,} raw filings", flush=True)

    cases, stats = collapse_to_cases(raw)
    print(
        f"  ✓ {len(cases):,} cases after case-start collapse "
        f"({stats['follow_ups_dropped']:,} follow-ups dropped; "
        f"{stats['chapter_22_cases']:,} Chapter 22 cases)",
        flush=True,
    )

    panel_full_n = len(panel)
    panel, dropped = drop_in_case_rows(panel, cases)
    print(f"  ✓ {len(panel):,} panel rows after in-case drop ({dropped:,} removed)",
          flush=True)
    panel_after_drop_n = len(panel)

    # Common subset
    common = common_subset(panel)
    print(f"  ✓ {len(common):,} rows in the common-5-scores subset", flush=True)

    print("  Computing score metrics on the full sample …", flush=True)
    full_metrics = [
        score_metrics(panel, cases, label, key, higher)
        for key, label, higher in SCORE_SPEC
    ]
    print("  Computing score metrics on the common subset …", flush=True)
    common_metrics = [
        score_metrics(common, cases, label, key, higher)
        for key, label, higher in SCORE_SPEC
    ]

    # Coverage
    sub_path = Path(args.submissions)
    cf_path = Path(args.companyfacts)
    sic_map: dict[str, tuple[int | None, str]] = {}
    if sub_path.exists():
        print(f"  Loading SIC map from {sub_path} …", flush=True)
        sic_map = load_sic_map(sub_path)
        print(f"  ✓ {len(sic_map):,} CIKs with SIC metadata", flush=True)
    else:
        print(f"  ⚠  submissions.zip not found at {sub_path}; SIC-based "
              "reasons will be absent", flush=True)
    cf_present = cf_path.exists()
    if cf_present:
        print(f"  Resolving per-case pre-petition liabilities from {cf_path} …",
              flush=True)
    else:
        print(f"  ⚠  companyfacts.zip not found at {cf_path}; liabilities "
              "coverage cannot be computed", flush=True)
    coverage = build_coverage(panel, cases, sic_map, cf_path if cf_present else None)

    # Render
    text = render_markdown(
        stats=stats,
        panel_full_n=panel_full_n,
        panel_after_drop_n=panel_after_drop_n,
        rows_dropped_in_case=dropped,
        cases=cases,
        coverage_records=coverage,
        full_metrics=full_metrics,
        common_metrics=common_metrics,
        common_subset_n=len(common),
    )
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(text, encoding="utf-8")
    print(f"  ✓ Wrote {out_path}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
