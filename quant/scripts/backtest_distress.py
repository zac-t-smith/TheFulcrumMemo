"""
backtest_distress.py — Fulcrum v5 Phase 4 (backtest + report), v4
================================================================

v4 fixes on top of v3:
  - Combined-score bug. v3 reported 0.541 OOS AUC because
    (a) raw features carry heavy outliers (coverage ratios of 1e5+,
        etc.) which z-score standardization doesn't tame,
    (b) training rows used labels merely "closed by the panel's last
        date," pulling in training targets with still-open horizons,
    (c) the sample compared against Altman wasn't the same rows/years.
    The fix: within-quarter percentile-rank transforms for the three
    inputs (so the logistic sees well-conditioned features), training
    rows must have their 12-month window closed by January 1 of the
    prediction year, and the comparison against Altman alone and a
    plain percentile-rank average runs on the identical rows.
  - Tiers. Watch dropped (its 0.72% precision sat below the base
    rate, so it was anti-signal). Stressed re-based as "top 5% by
    Altman percentile rank per quarter, excluding Distressed" —
    floating threshold, auto-targets the intended share. Distressed
    unchanged. Each tier gets precision, lift, recall-by-company,
    median lead time, and average rows per quarter.
  - Framing. AUC changes v2→v3 are partly a universe change (more
    rows with the expanded debt tags) so the text leads with lift.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
import warnings
import zipfile
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# scikit-learn is optional — only needed for the combined-score block.
try:
    import numpy as np
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import roc_auc_score as sk_auc
    warnings.filterwarnings("ignore", category=FutureWarning, module="sklearn")
    SKLEARN_OK = True
except Exception:   # pragma: no cover
    SKLEARN_OK = False


# =============================================================================
# Config
# =============================================================================

CHAPTER_22_THRESHOLD_MONTHS = 24
IN_CASE_WINDOW_MONTHS = 24
COMPANY_LOOKBACK_MONTHS = 24
LIABILITIES_FLOOR = 250_000_000

SCORE_SPEC: list[tuple[str, str, bool]] = [
    # (panel attribute, label, higher_is_riskier)
    ("altman", "Altman Z''", False),
    ("coverage", "Coverage (EBIT / Interest)", False),
    ("net_leverage", "Net leverage (NetDebt / EBITDA)", True),
    ("runway", "Liquidity runway (months)", False),
    ("maturity_pressure", "24m maturity pressure", True),
]
STABLE_SCORE_KEYS = ["altman", "coverage", "net_leverage", "maturity_pressure"]
ALL_SCORE_KEYS = [k for k, _, _ in SCORE_SPEC]


# =============================================================================
# Data types
# =============================================================================

@dataclass
class PanelRow:
    as_of_date: date
    cik: str
    sic: int | None
    name: str
    total_debt: float | None
    total_debt_source: str | None
    liabilities: float | None
    coverage: float | None
    net_leverage: float | None
    altman: float | None
    runway: float | None
    maturity_pressure: float | None
    universe_pass: bool
    sic_excluded_old: bool
    sic_excluded_new: bool

    def score(self, key: str) -> float | None:
        return getattr(self, key, None)


@dataclass
class BankruptcyCase:
    cik: str
    name: str
    petition_date: date
    accession: str
    chapter: str   # chapter_11 / chapter_15 / chapter_7 / receivership / unknown


@dataclass
class BankruptcyFiling:
    cik: str
    name: str
    filing_date: date
    accession: str
    chapter: str
    registrant_is_debtor: bool


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


def _as_bool(s: str | None) -> bool:
    return str(s).strip().lower() == "true"


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
                total_debt=_as_float(r.get("total_debt", "")),
                total_debt_source=r.get("total_debt_source", "") or None,
                liabilities=_as_float(r.get("liabilities", "")),
                coverage=_as_float(r.get("coverage", "")),
                net_leverage=_as_float(r.get("net_leverage", "")),
                altman=_as_float(r.get("altman_z_double_prime", "")),
                runway=_as_float(r.get("runway_months", "")),
                maturity_pressure=_as_float(r.get("maturity_pressure_24m", "")),
                universe_pass=_as_bool(r.get("universe_pass", "")),
                sic_excluded_old=_as_bool(r.get("sic_excluded_old", "")),
                sic_excluded_new=_as_bool(r.get("sic_excluded_new", "")),
            ))
    return rows


def load_classified_filings(path: Path) -> list[BankruptcyFiling]:
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
                chapter=r.get("chapter", "unknown") or "unknown",
                registrant_is_debtor=_as_bool(r.get("registrant_is_debtor", "True")),
            ))
    return rows


# =============================================================================
# Case-start collapse (same algorithm as v2)
# =============================================================================

def collapse_to_cases(
    filings: list[BankruptcyFiling],
    threshold_months: int = CHAPTER_22_THRESHOLD_MONTHS,
) -> tuple[list[BankruptcyCase], dict[str, int]]:
    by_cik: dict[str, list[BankruptcyFiling]] = defaultdict(list)
    for f in filings:
        by_cik[f.cik].append(f)
    for v in by_cik.values():
        v.sort(key=lambda x: x.filing_date)

    cases: list[BankruptcyCase] = []
    chapter_22_cases = 0

    for cik, fs in by_cik.items():
        accepted_last: date | None = None
        for f in fs:
            if accepted_last is None:
                cases.append(BankruptcyCase(
                    cik=cik, name=f.name, petition_date=f.filing_date,
                    accession=f.accession, chapter=f.chapter,
                ))
                accepted_last = f.filing_date
                continue
            gap_months = (f.filing_date - accepted_last).days / 30.44
            if gap_months >= threshold_months:
                cases.append(BankruptcyCase(
                    cik=cik, name=f.name, petition_date=f.filing_date,
                    accession=f.accession, chapter=f.chapter,
                ))
                chapter_22_cases += 1
                accepted_last = f.filing_date

    stats = {
        "raw_filings": len(filings),
        "distinct_ciks": len(by_cik),
        "cases": len(cases),
        "chapter_22_cases": chapter_22_cases,
    }
    return cases, stats


def drop_in_case_rows(
    panel: list[PanelRow],
    cases: list[BankruptcyCase],
    window_months: int = IN_CASE_WINDOW_MONTHS,
) -> tuple[list[PanelRow], int]:
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


def apply_sic_exclusion(panel: list[PanelRow], rule: str) -> list[PanelRow]:
    """Return panel filtered by the given SIC-exclusion rule."""
    field_name = "sic_excluded_new" if rule == "v3" else "sic_excluded_old"
    return [r for r in panel if not getattr(r, field_name)]


# =============================================================================
# Universe filter (at backtest time, we also have access to liabilities so we
# can include companies that pass "debt > $250m OR liabilities > $250m with
# leverage/coverage tests").
# =============================================================================

def universe_pass(row: PanelRow) -> bool:
    """Replicate the universe test from the panel (uses PanelRow fields)."""
    return row.universe_pass


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
    for d in cik_cases.get(cik, ()):
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


def common_subset(panel: list[PanelRow], keys: list[str]) -> list[PanelRow]:
    out: list[PanelRow] = []
    for r in panel:
        ok = True
        for k in keys:
            v = r.score(k)
            if v is None or (isinstance(v, float) and (math.isnan(v) or math.isinf(v))):
                ok = False
                break
        if ok:
            out.append(r)
    return out


# =============================================================================
# Tier rules (filing-only signals the backtest can actually evaluate)
# =============================================================================

@dataclass
class TierResult:
    name: str
    rule: str
    n_flagged_rows: int
    tp_rows_12m: int
    precision_12m: float | None
    tp_rows_6m: int
    precision_6m: float | None
    companies_flagged: int
    companies_covered_total: int    # bankrupt companies in panel (24m pre-petition rows)
    recall_companies: float | None  # companies_flagged / companies_covered_total


def is_distressed(r: PanelRow) -> bool:
    return (
        r.coverage is not None and r.coverage < 1.0
        and r.runway is not None and r.runway < 12.0
    )


def rank_within_quarter_01(
    rows: list[PanelRow], key: str, higher_is_riskier: bool,
) -> dict[tuple[date, str], float]:
    """
    Return {(as_of, cik): percentile_rank in [0, 1]}, within each quarter.
    Rank-average on ties. Percentile semantics: 0 = calmest, 1 = riskiest.
    """
    by_date: dict[date, list[tuple[float, str]]] = defaultdict(list)
    for r in rows:
        v = r.score(key)
        if v is None or (isinstance(v, float) and (math.isnan(v) or math.isinf(v))):
            continue
        rs = v if higher_is_riskier else -v
        by_date[r.as_of_date].append((rs, r.cik))
    out: dict[tuple[date, str], float] = {}
    for d, items in by_date.items():
        items.sort(key=lambda t: t[0])  # ascending by raw risk = calmest first
        n = len(items)
        i = 0
        while i < n:
            j = i
            while j + 1 < n and items[j + 1][0] == items[i][0]:
                j += 1
            avg_rank = (i + j) / 2
            pctl = (avg_rank + 0.5) / n
            for k in range(i, j + 1):
                out[(d, items[k][1])] = pctl
            i = j + 1
    return out


@dataclass
class V4Tier:
    name: str
    rule: str
    rows_fired: int
    avg_rows_per_quarter: float
    tp12: int
    tp6: int
    precision_12m: float | None
    precision_6m: float | None
    lift_12m: float | None
    lift_6m: float | None
    companies_flagged: int
    companies_catchable: int
    recall_companies: float | None
    median_lead_months: float | None
    base_rate_12m: float


def tier_metrics_v4(
    panel: list[PanelRow],
    cases: list[BankruptcyCase],
    stressed_pctl_threshold: float = 0.95,
) -> list[V4Tier]:
    """
    v4 tiers:
      Distressed: coverage < 1.0 AND runway_months < 12  (unchanged).
      Stressed:  top 5% by Altman Z'' percentile rank per quarter,
                 excluding rows already in Distressed. Floating
                 threshold automatically targets ~5% of universe rows.
      Watch:     DROPPED (v3 Watch had 0.72% precision versus ~0.8%
                 base rate — anti-signal).

    Reports precision, lift, recall by company, median lead time, and
    average rows per quarter.
    """
    cik_cases = build_cik_case_dates(cases)

    # Base rate 12m across the panel (denominator for lift).
    total_rows = 0
    labeled_12 = 0
    for r in panel:
        total_rows += 1
        if label_within(cik_cases, r.cik, r.as_of_date, 12):
            labeled_12 += 1
    base_rate_12 = (labeled_12 / total_rows) if total_rows else 0.0
    total_rows_6 = 0
    labeled_6 = 0
    for r in panel:
        total_rows_6 += 1
        if label_within(cik_cases, r.cik, r.as_of_date, 6):
            labeled_6 += 1
    base_rate_6 = (labeled_6 / total_rows_6) if total_rows_6 else 0.0

    # Companies catchable = any bankrupt CIK with a panel row in 24m pre-petition.
    catchable: set[str] = set()
    for c in cases:
        lookback_start = c.petition_date - timedelta(days=int(30.44 * COMPANY_LOOKBACK_MONTHS))
        for r in panel:
            if r.cik == c.cik and lookback_start <= r.as_of_date < c.petition_date:
                catchable.add(c.cik)
                break
    total_catchable = len(catchable)

    # Count distinct quarters in the panel.
    quarters = {r.as_of_date for r in panel}
    n_quarters = max(1, len(quarters))

    altman_pctl = rank_within_quarter_01(panel, "altman", higher_is_riskier=False)

    def _eval(name: str, rule_text: str, is_hit) -> V4Tier:
        rows_fired = 0
        tp12 = 0
        tp6 = 0
        companies_fired: set[str] = set()
        first_hit: dict[str, date] = {}
        for r in panel:
            if not is_hit(r):
                continue
            rows_fired += 1
            lab12 = label_within(cik_cases, r.cik, r.as_of_date, 12)
            lab6 = label_within(cik_cases, r.cik, r.as_of_date, 6)
            if lab12:
                tp12 += 1
                companies_fired.add(r.cik)
                if r.cik not in first_hit or r.as_of_date < first_hit[r.cik]:
                    first_hit[r.cik] = r.as_of_date
            if lab6:
                tp6 += 1
        # Lead time per company
        leads: list[float] = []
        for cik, first_date in first_hit.items():
            nxt = next_case_after(cik_cases, cik, first_date)
            if nxt is None:
                continue
            leads.append((nxt - first_date).days / 30.44)
        prec_12 = (tp12 / rows_fired) if rows_fired else None
        prec_6 = (tp6 / rows_fired) if rows_fired else None
        lift_12 = (prec_12 / base_rate_12) if (prec_12 is not None and base_rate_12 > 0) else None
        lift_6 = (prec_6 / base_rate_6) if (prec_6 is not None and base_rate_6 > 0) else None
        recall = (
            len(companies_fired & catchable) / total_catchable
            if total_catchable else None
        )
        return V4Tier(
            name=name,
            rule=rule_text,
            rows_fired=rows_fired,
            avg_rows_per_quarter=rows_fired / n_quarters,
            tp12=tp12,
            tp6=tp6,
            precision_12m=prec_12,
            precision_6m=prec_6,
            lift_12m=lift_12,
            lift_6m=lift_6,
            companies_flagged=len(companies_fired),
            companies_catchable=total_catchable,
            recall_companies=recall,
            median_lead_months=median_of(leads),
            base_rate_12m=base_rate_12,
        )

    def _is_distressed(r: PanelRow) -> bool:
        return (
            r.coverage is not None and r.coverage < 1.0
            and r.runway is not None and r.runway < 12.0
        )

    def _is_stressed(r: PanelRow) -> bool:
        if _is_distressed(r):
            return False  # keep Stressed and Distressed disjoint in counts
        p = altman_pctl.get((r.as_of_date, r.cik))
        return p is not None and p >= stressed_pctl_threshold

    def _is_any(r: PanelRow) -> bool:
        return _is_distressed(r) or _is_stressed(r)

    return [
        _eval(
            "distressed",
            "coverage < 1.0 AND runway < 12m",
            _is_distressed,
        ),
        _eval(
            f"stressed",
            f"Altman Z'' top {int((1 - stressed_pctl_threshold) * 100)}% within quarter, excluding Distressed",
            _is_stressed,
        ),
        _eval(
            "any_tier",
            "Distressed OR Stressed",
            _is_any,
        ),
    ]


# =============================================================================
# Combined logistic-regression score (year-by-year walk-forward)
# =============================================================================

@dataclass
class ComparisonMetric:
    name: str
    n_rows: int
    base_rate_12m: float
    base_rate_6m: float
    auc_12m: float | None
    auc_6m: float | None
    prec_12m: float | None
    prec_6m: float | None
    lift_12m: float | None
    lift_6m: float | None


@dataclass
class CombinedScoreFairResult:
    n_scored: int
    years_scored: list[int]
    altman_only: ComparisonMetric
    avg_rank: ComparisonMetric
    logistic: ComparisonMetric | None


def combined_score_fair(
    panel: list[PanelRow],
    cases: list[BankruptcyCase],
    start_year: int = 2017,
) -> CombinedScoreFairResult:
    """
    Three models on the SAME rows (all three features present, year >=
    start_year), for an apples-to-apples comparison:

      1. Altman alone (as its within-quarter percentile rank, for a
         fair comparison to the other rank-based models).
      2. Plain average of three percentile ranks (Altman, Coverage,
         Net leverage). No fit — a baseline the logistic has to beat.
      3. Year-by-year L2 logistic regression on the three percentile
         ranks, with a strict training rule: a training row's 12-month
         label window must close by January 1 of the prediction year.

    v3's logistic hit AUC 0.541 because (a) raw features have severe
    outliers, (b) training-closure was relative to the panel's last
    date which pulled in open-horizon rows as implicit negatives, and
    (c) the comparison wasn't on the same rows. v4 fixes all three.
    """
    cik_cases = build_cik_case_dates(cases)

    # Percentile ranks within quarter for all three features. Each
    # dict spans the full panel (per key); rows missing the feature
    # simply aren't in the dict.
    rk_a = rank_within_quarter_01(panel, "altman", higher_is_riskier=False)
    rk_c = rank_within_quarter_01(panel, "coverage", higher_is_riskier=False)
    rk_l = rank_within_quarter_01(panel, "net_leverage", higher_is_riskier=True)

    def _has_all(r: PanelRow) -> bool:
        k = (r.as_of_date, r.cik)
        return k in rk_a and k in rk_c and k in rk_l

    # Scoring set: rows in year >= start_year with all three features.
    scored_rows = [r for r in panel if r.as_of_date.year >= start_year and _has_all(r)]
    if not scored_rows:
        empty = ComparisonMetric(
            name="(no rows)", n_rows=0,
            base_rate_12m=0.0, base_rate_6m=0.0,
            auc_12m=None, auc_6m=None,
            prec_12m=None, prec_6m=None, lift_12m=None, lift_6m=None,
        )
        return CombinedScoreFairResult(
            n_scored=0, years_scored=[],
            altman_only=empty, avg_rank=empty, logistic=None,
        )

    labels_12 = [int(label_within(cik_cases, r.cik, r.as_of_date, 12)) for r in scored_rows]
    labels_6 = [int(label_within(cik_cases, r.cik, r.as_of_date, 6)) for r in scored_rows]

    def _feature_vec(r: PanelRow) -> tuple[float, float, float]:
        k = (r.as_of_date, r.cik)
        return rk_a[k], rk_c[k], rk_l[k]

    altman_scores = [rk_a[(r.as_of_date, r.cik)] for r in scored_rows]
    avg_scores = [
        sum(_feature_vec(r)) / 3.0 for r in scored_rows
    ]

    # Year-by-year logistic. Training rule: a training row at as_of
    # date `d` must have (d + 12 months) <= Jan 1 of the prediction
    # year. Equivalently d <= (Y - 1)-01-01.
    logistic_scores: list[float] | None = None
    years_scored: list[int] = []
    if SKLEARN_OK:
        logistic_scores = [math.nan] * len(scored_rows)
        panel_with_three = [r for r in panel if _has_all(r)]

        for year in sorted({r.as_of_date.year for r in scored_rows}):
            closure_cutoff = date(year, 1, 1) - timedelta(days=365)
            train_rows = [r for r in panel_with_three if r.as_of_date <= closure_cutoff]
            if len(train_rows) < 100:
                continue
            X_tr = np.array([list(_feature_vec(r)) for r in train_rows], dtype=float)
            y_tr = np.array([
                int(label_within(cik_cases, r.cik, r.as_of_date, 12))
                for r in train_rows
            ], dtype=int)
            if len(set(y_tr)) < 2:
                continue
            clf = LogisticRegression(
                penalty="l2", C=1.0, solver="lbfgs", max_iter=2000,
                class_weight="balanced",
            )
            clf.fit(X_tr, y_tr)

            test_indices = [
                i for i, r in enumerate(scored_rows) if r.as_of_date.year == year
            ]
            if not test_indices:
                continue
            X_te = np.array([list(_feature_vec(scored_rows[i])) for i in test_indices])
            p = clf.predict_proba(X_te)[:, 1]
            for i, pi in zip(test_indices, p):
                logistic_scores[i] = float(pi)
            years_scored.append(year)

        # Drop any rows that didn't get a logistic prediction.
        finite_mask = [i for i, s in enumerate(logistic_scores) if math.isfinite(s)]
        logistic_scores = [logistic_scores[i] for i in finite_mask]
        # Align ground truth to the same rows.
        altman_scores_l = [altman_scores[i] for i in finite_mask]
        avg_scores_l = [avg_scores[i] for i in finite_mask]
        labels_12_l = [labels_12[i] for i in finite_mask]
        labels_6_l = [labels_6[i] for i in finite_mask]
    else:
        altman_scores_l = altman_scores
        avg_scores_l = avg_scores
        labels_12_l = labels_12
        labels_6_l = labels_6

    def _comparison_metric(name: str, scores: list[float], l12: list[int], l6: list[int]) -> ComparisonMetric:
        if not scores:
            return ComparisonMetric(
                name=name, n_rows=0, base_rate_12m=0.0, base_rate_6m=0.0,
                auc_12m=None, auc_6m=None,
                prec_12m=None, prec_6m=None, lift_12m=None, lift_6m=None,
            )
        base12 = sum(l12) / len(l12)
        base6 = sum(l6) / len(l6)

        def _auc(s: list[float], l: list[int]) -> float | None:
            pos = [sc for sc, lb in zip(s, l) if lb == 1]
            neg = [sc for sc, lb in zip(s, l) if lb == 0]
            return roc_auc(pos, neg)

        auc12 = _auc(scores, l12)
        auc6 = _auc(scores, l6)
        pairs_12 = sorted(zip(scores, l12), reverse=True)
        pairs_6 = sorted(zip(scores, l6), reverse=True)
        top_n = max(1, len(pairs_12) // 10)
        tp12 = sum(t[1] for t in pairs_12[:top_n])
        tp6 = sum(t[1] for t in pairs_6[:top_n])
        prec12 = tp12 / top_n
        prec6 = tp6 / top_n
        lift12 = prec12 / base12 if base12 > 0 else None
        lift6 = prec6 / base6 if base6 > 0 else None
        return ComparisonMetric(
            name=name, n_rows=len(scores),
            base_rate_12m=base12, base_rate_6m=base6,
            auc_12m=auc12, auc_6m=auc6,
            prec_12m=prec12, prec_6m=prec6,
            lift_12m=lift12, lift_6m=lift6,
        )

    altman_cm = _comparison_metric("Altman Z'' (pctl rank)", altman_scores_l, labels_12_l, labels_6_l)
    avg_cm = _comparison_metric("Avg of 3 pctl ranks (no-fit)", avg_scores_l, labels_12_l, labels_6_l)
    log_cm = (
        _comparison_metric("Logistic (3 pctl ranks)", logistic_scores, labels_12_l, labels_6_l)
        if logistic_scores else None
    )

    return CombinedScoreFairResult(
        n_scored=len(altman_scores_l),
        years_scored=sorted(years_scored),
        altman_only=altman_cm,
        avg_rank=avg_cm,
        logistic=log_cm,
    )


# =============================================================================
# Coverage (by company) + liabilities-subset check
# =============================================================================

@dataclass
class CoverageRecord:
    cik: str
    name: str
    petition_date: date
    chapter: str
    in_panel_pre_petition: bool
    last_liabilities: float | None
    last_debt: float | None
    last_debt_source: str | None
    sic: int | None
    reason_if_missing: str | None


def build_coverage(
    panel_pre_sic: list[PanelRow],
    panel_post_sic: list[PanelRow],
    cases: list[BankruptcyCase],
) -> list[CoverageRecord]:
    """
    panel_pre_sic : panel rows (before SIC filter) so we can detect why a
                     bankrupt CIK dropped out — SIC excluded? no XBRL?
                     liabilities below threshold?
    panel_post_sic: panel rows after the active SIC rule (for the
                     in-panel-pre-petition check we only care about rows
                     the backtest actually used).
    """
    by_cik_pre: dict[str, list[PanelRow]] = defaultdict(list)
    for r in panel_pre_sic:
        by_cik_pre[r.cik].append(r)
    by_cik_post: dict[str, list[PanelRow]] = defaultdict(list)
    for r in panel_post_sic:
        by_cik_post[r.cik].append(r)

    first_case: dict[str, BankruptcyCase] = {}
    for c in cases:
        prev = first_case.get(c.cik)
        if prev is None or c.petition_date < prev.petition_date:
            first_case[c.cik] = c

    records: list[CoverageRecord] = []
    for cik, case in first_case.items():
        lookback_start = case.petition_date - timedelta(days=int(30.44 * COMPANY_LOOKBACK_MONTHS))
        rows_pre = [r for r in by_cik_pre.get(cik, [])
                    if r.as_of_date < case.petition_date]
        rows_pre_window = [r for r in rows_pre if lookback_start <= r.as_of_date]
        rows_post_window = [r for r in by_cik_post.get(cik, [])
                            if lookback_start <= r.as_of_date < case.petition_date]
        in_panel = len(rows_post_window) > 0

        last_liab: float | None = None
        last_debt: float | None = None
        last_debt_src: str | None = None
        sic: int | None = None
        if rows_pre:
            rows_pre.sort(key=lambda r: r.as_of_date)
            # Use the latest pre-petition row for liabilities/debt/sic.
            for r in reversed(rows_pre):
                sic = r.sic if sic is None else sic
                if r.liabilities is not None and last_liab is None:
                    last_liab = r.liabilities
                if r.total_debt is not None and last_debt is None:
                    last_debt = r.total_debt
                    last_debt_src = r.total_debt_source
                if last_liab is not None and last_debt is not None:
                    break

        reason: str | None = None
        if not in_panel:
            if sic is not None and (6000 <= sic <= 6499 or sic == 6798):
                reason = f"excluded SIC {sic}"
            elif rows_pre_window and all(not universe_pass(r) for r in rows_pre_window):
                # In pre-SIC panel but didn't pass universe test.
                if last_debt is not None and last_debt < LIABILITIES_FLOOR:
                    reason = f"debt ${last_debt / 1e6:.0f}m below $250m"
                elif last_debt is None:
                    reason = "no debt tag"
                else:
                    reason = "universe tests failed (cov/lev pass)"
            elif not rows_pre:
                reason = "no pre-petition XBRL facts"
            else:
                reason = "no row in 24m pre-petition window"

        records.append(CoverageRecord(
            cik=cik,
            name=case.name,
            petition_date=case.petition_date,
            chapter=case.chapter,
            in_panel_pre_petition=in_panel,
            last_liabilities=last_liab,
            last_debt=last_debt,
            last_debt_source=last_debt_src,
            sic=sic,
            reason_if_missing=reason,
        ))
    return records


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


def _score_table_rows(metrics: list[ScoreMetrics]) -> list[str]:
    lines = [
        "| Score | n rows | base 12m | AUC 12m | AUC 6m | Top-10% prec 12m | Lift 12m | Top-10% prec 6m | Lift 6m | Co. flagged | Median lead (mo) | ≥6m ahead |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for m in metrics:
        lines.append(
            f"| {m.label} | {m.n_rows:,} | {_fmt_pct(m.base_rate_12m)} | "
            f"{_fmt(m.auc_12m)} | {_fmt(m.auc_6m)} | "
            f"{_fmt_pct(m.top_decile_precision_12m)} | {_fmt(m.lift_12m, 2)}× | "
            f"{_fmt_pct(m.top_decile_precision_6m)} | {_fmt(m.lift_6m, 2)}× | "
            f"{m.companies_flagged:,} | {_fmt(m.median_lead_months, 1)} | "
            f"{_fmt_pct(m.share_flagged_6m_ahead)} |"
        )
    return lines


def render_markdown(
    filings_in: list[BankruptcyFiling],
    cases: list[BankruptcyCase],
    collapse_stats: dict,
    panel_all: list[PanelRow],
    panel_v2: list[PanelRow],
    panel_v3: list[PanelRow],
    panel_v3_after_drop: list[PanelRow],
    rows_dropped_in_case: int,
    common_v3: list[PanelRow],
    full_metrics_v3: list[ScoreMetrics],
    common_metrics_v3: list[ScoreMetrics],
    full_metrics_v2: list[ScoreMetrics],
    coverage_v3: list[CoverageRecord],
    coverage_v2: list[CoverageRecord],
    tier_results: list[V4Tier],
    combined_fair: CombinedScoreFairResult,
    altman_full: ScoreMetrics,
) -> str:
    out: list[str] = []
    gen_at = datetime.now(timezone.utc).isoformat()
    out.append(f"# Fulcrum v5 Phase 4 — Distress Radar backtest (v4)\n")
    out.append(
        f"_Generated {gen_at}. Panel (before SIC filter): {len(panel_all):,} rows; "
        f"v2 SIC rule: {len(panel_v2):,} rows; v3 SIC rule: {len(panel_v3):,} rows "
        f"(after in-case drop: {len(panel_v3_after_drop):,}; "
        f"{rows_dropped_in_case:,} dropped). "
        f"Filings (2012-2026): {len(filings_in):,} raw → after registrant-is-debtor "
        f"filter and case-start collapse: **{len(cases):,} cases** "
        f"({collapse_stats['chapter_22_cases']} Chapter 22)._\n"
    )

    # Label-set composition
    chap_counts: dict[str, int] = defaultdict(int)
    for c in cases:
        chap_counts[c.chapter] += 1
    out.append("## Label-set composition\n")
    out.append(
        "Classifier output (all 1,665 Item 1.03 filings before case collapse):\n"
    )
    out.append(f"- **Chapter 11:** 1,413")
    out.append(f"- **Chapter 15 (foreign proceedings):** 12")
    out.append(f"- **Chapter 7:** 87")
    out.append(f"- **Receivership:** 151")
    out.append(f"- **Registrant NOT debtor (parent about subsidiary):** 73 — dropped\n")
    out.append(
        "After dropping parent-about-subsidiary filings, collapsing to case starts "
        "(first Item 1.03 per CIK, with Chapter 22 refilings opening a new case "
        "at ≥24-month gap), and the chapter-classifier:\n"
    )
    for chap in ["chapter_11", "chapter_15", "chapter_7", "receivership", "unknown"]:
        out.append(f"- {chap}: {chap_counts.get(chap, 0)}")
    out.append("")

    # SIC comparison
    out.append("## Coverage by company — both SIC exclusion rules side-by-side\n")

    def _cov_block(label: str, records: list[CoverageRecord]) -> list[str]:
        covered = [r for r in records if r.in_panel_pre_petition]
        big = [r for r in records if r.last_liabilities is not None
               and r.last_liabilities >= LIABILITIES_FLOOR]
        big_covered = [r for r in big if r.in_panel_pre_petition]
        total = max(1, len(records))
        return [
            f"### {label}\n",
            (
                f"Overall: **{len(covered):,} / {len(records):,} "
                f"({len(covered) / total * 100:.1f}%)** of distinct bankrupt "
                f"companies appear in the panel in the 24 months before their "
                f"first petition."
            ),
            (
                f"Liabilities ≥ $250m subset: "
                f"**{len(big_covered):,} / {len(big):,} "
                f"({len(big_covered) / max(1, len(big)) * 100:.1f}%)** covered.\n"
            ),
        ]

    out.extend(_cov_block("v2 rule — exclude SIC 6000-6799", coverage_v2))
    out.extend(_cov_block("v3 rule — exclude SIC 6000-6499 and 6798 only", coverage_v3))

    # Misses (v3 rule, liabilities ≥ $250m, not in panel)
    v3_big_miss = sorted(
        [r for r in coverage_v3 if (r.last_liabilities or 0) >= LIABILITIES_FLOOR
         and not r.in_panel_pre_petition],
        key=lambda r: r.petition_date,
    )
    if v3_big_miss:
        out.append(
            f"### v3 rule — misses with liabilities ≥ $250m ({len(v3_big_miss)} companies)\n"
        )
        out.append("| Petition | Chapter | Name | CIK | Liabilities | Last debt / source | SIC | Reason |")
        out.append("|---|---|---|---|---:|---|---:|---|")
        for r in v3_big_miss:
            liab = (f"${r.last_liabilities/1e9:.1f}B" if r.last_liabilities and r.last_liabilities >= 1e9
                    else f"${r.last_liabilities/1e6:.0f}M" if r.last_liabilities is not None else "—")
            debt = (f"${r.last_debt/1e9:.1f}B" if r.last_debt and r.last_debt >= 1e9
                    else f"${r.last_debt/1e6:.0f}M" if r.last_debt is not None else "—")
            src = r.last_debt_source or "—"
            out.append(
                f"| {r.petition_date} | {r.chapter} | {r.name} | {r.cik} | "
                f"{liab} | {debt} / {src} | {r.sic if r.sic is not None else '—'} | "
                f"{r.reason_if_missing or '—'} |"
            )
        out.append("")

    # Score metrics
    out.append("## Score metrics — v3 SIC rule, full sample\n")
    out.extend(_score_table_rows(full_metrics_v3))
    out.append("")

    out.append(
        f"## Score metrics — v3 SIC rule, common 4-score subset "
        f"({len(common_v3):,} rows where altman + coverage + net leverage + "
        f"maturity pressure are all finite)\n"
    )
    out.append(
        "Runway excluded from the common subset per spec — it only exists for "
        "cash-burners, so requiring it would bias the subset.\n"
    )
    out.extend(_score_table_rows(common_metrics_v3))
    out.append("")

    out.append("## Score metrics — v2 SIC rule (comparison)\n")
    out.extend(_score_table_rows(full_metrics_v2))
    out.append("")

    # Tiers — v4
    out.append("## Tier rules — v4 (v3 SIC rule, full sample)\n")
    out.append(
        "Watch tier dropped from v3 — its 0.72% precision was below the base "
        "rate, so it was anti-signal. Stressed rebuilt on Altman Z'' percentile "
        "rank per quarter (top 5%, excluding Distressed) — floating threshold "
        "auto-targets the intended share of universe rows. Distressed unchanged.\n"
    )
    out.append(
        "| Tier | Rule | Avg rows/qtr | Prec 12m | Lift 12m | Prec 6m | Lift 6m | Co. flagged | Co. in universe | Recall | Median lead (mo) |"
    )
    out.append(
        "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|"
    )
    for t in tier_results:
        out.append(
            f"| {t.name} | `{t.rule}` | {t.avg_rows_per_quarter:,.0f} | "
            f"{_fmt_pct(t.precision_12m)} | {_fmt(t.lift_12m, 2)}× | "
            f"{_fmt_pct(t.precision_6m)} | {_fmt(t.lift_6m, 2)}× | "
            f"{t.companies_flagged:,} | {t.companies_catchable:,} | "
            f"{_fmt_pct(t.recall_companies)} | {_fmt(t.median_lead_months, 1)} |"
        )
    out.append("")

    # Combined score — v4 fair comparison
    out.append("## Combined score — fair v4 comparison\n")
    out.append(
        "Three models evaluated on the IDENTICAL rows "
        f"({combined_fair.n_scored:,} rows from scoring years "
        f"{combined_fair.years_scored[0] if combined_fair.years_scored else '—'}+ "
        "with Altman + Coverage + Net Leverage all present). Features are "
        "within-quarter percentile ranks, which handles the heavy outliers "
        "in raw coverage/leverage ratios. The logistic's training rule is "
        "strict: a training row's 12-month label window must close by "
        "January 1 of the prediction year.\n"
    )
    out.append(
        "| Model | AUC 12m | Lift 12m | AUC 6m | Lift 6m | Top-10% prec 12m | Base rate 12m |"
    )
    out.append("|---|---:|---:|---:|---:|---:|---:|")

    def _row(c: ComparisonMetric | None) -> str:
        if c is None:
            return "| — | — | — | — | — | — | — |"
        return (
            f"| {c.name} | {_fmt(c.auc_12m)} | {_fmt(c.lift_12m, 2)}× | "
            f"{_fmt(c.auc_6m)} | {_fmt(c.lift_6m, 2)}× | "
            f"{_fmt_pct(c.prec_12m)} | {_fmt_pct(c.base_rate_12m)} |"
        )

    out.append(_row(combined_fair.altman_only))
    out.append(_row(combined_fair.avg_rank))
    out.append(_row(combined_fair.logistic))
    out.append("")

    best_name = None
    best_lift = -math.inf
    for c in (combined_fair.altman_only, combined_fair.avg_rank, combined_fair.logistic):
        if c is not None and c.lift_12m is not None and c.lift_12m > best_lift:
            best_lift = c.lift_12m
            best_name = c.name
    if best_name:
        out.append(f"**Best on 12m lift:** {best_name} ({best_lift:.2f}×).\n")

    out.append("### Read conventions / caveats\n")
    out.append(
        "- Lead with **lift**. AUC changes from v2 → v3 are partly a universe "
        "change: expanded debt-tag coverage pulled many large-debt names into "
        "the panel, including some that were high-signal (Hertz, EFH, Peabody, "
        "Caesars Operating). That shifts the base rate and inflates AUC. Lift "
        "is base-rate-normalized and travels with the same meaning across "
        "panel changes.\n"
        "- Sign on net leverage and maturity-pressure is flipped so \"top decile\" "
        "always means riskiest.\n"
        "- `Base 12m/6m` = share of rows in scope whose CIK files a bankruptcy "
        "within the forward window.\n"
        "- `Lift` = top-decile precision ÷ base rate. 1× is random.\n"
        "- `Recall` (tier table) = fraction of distinct bankrupt companies "
        "present in the panel's 24m pre-petition windows whose rows crossed "
        "the tier rule.\n"
        "- `Avg rows/qtr` divides tier rows fired by the 48 quarters in sample.\n"
        "- Tier rules use only signals the backtest has. Merton PD (>20% → "
        "Distressed, 5-20% → Stressed) and EDGAR event flags (Item 1.03 / "
        "2.04 / going concern / RSA / T-3) go on the live radar, not here.\n"
    )

    return "\n".join(out)


# =============================================================================
# Driver
# =============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(description="Distress Radar backtest v3 + report")
    parser.add_argument("--panel", default="quant/research/distress_panel.csv")
    parser.add_argument("--classified", default="quant/research/ch11_filings_classified.csv")
    parser.add_argument("--out", default="quant/research/distress_backtest.md")
    args = parser.parse_args()

    panel_path = Path(args.panel)
    classified_path = Path(args.classified)
    for p in (panel_path, classified_path):
        if not p.exists():
            print(f"❌ Missing: {p}", file=sys.stderr)
            return 2

    print(f"  Loading panel from {panel_path} …", flush=True)
    panel_all = load_panel(panel_path)
    print(f"  ✓ {len(panel_all):,} panel rows at load (all SIC)", flush=True)

    print(f"  Loading classified Ch11 filings from {classified_path} …", flush=True)
    filings_raw = load_classified_filings(classified_path)
    print(f"  ✓ {len(filings_raw):,} raw filings", flush=True)

    filings_debtor = [f for f in filings_raw if f.registrant_is_debtor]
    print(
        f"  ✓ {len(filings_debtor):,} after dropping parent-about-subsidiary filings",
        flush=True,
    )

    cases, stats = collapse_to_cases(filings_debtor)
    print(
        f"  ✓ {len(cases):,} cases after collapse "
        f"({stats['chapter_22_cases']:,} Chapter 22)",
        flush=True,
    )

    # Apply SIC rules: build the two filtered panels.
    panel_v2 = apply_sic_exclusion(panel_all, "v2")
    panel_v3 = apply_sic_exclusion(panel_all, "v3")
    print(
        f"  ✓ Post-SIC: v2={len(panel_v2):,} rows, v3={len(panel_v3):,} rows",
        flush=True,
    )

    # In-case drop on v3 panel (what we score with).
    panel_v3_after_drop, dropped = drop_in_case_rows(panel_v3, cases)
    print(
        f"  ✓ v3 panel after in-case drop: {len(panel_v3_after_drop):,} "
        f"({dropped:,} dropped)",
        flush=True,
    )
    panel_v2_after_drop, _ = drop_in_case_rows(panel_v2, cases)

    # Metrics — v3 SIC.
    print("  Computing score metrics (v3 SIC, full sample) …", flush=True)
    full_v3 = [
        score_metrics(panel_v3_after_drop, cases, label, key, higher)
        for key, label, higher in SCORE_SPEC
    ]

    common_v3 = common_subset(panel_v3_after_drop, STABLE_SCORE_KEYS)
    print(f"  ✓ Common 4-score subset: {len(common_v3):,} rows", flush=True)
    print("  Computing score metrics on common subset …", flush=True)
    common_v3_metrics = [
        score_metrics(common_v3, cases, label, key, higher)
        for key, label, higher in SCORE_SPEC
    ]

    # Metrics — v2 SIC comparison.
    print("  Computing score metrics (v2 SIC) …", flush=True)
    full_v2 = [
        score_metrics(panel_v2_after_drop, cases, label, key, higher)
        for key, label, higher in SCORE_SPEC
    ]

    # Tier rules — v4 (percentile-rank Stressed; Watch dropped).
    print("  Scoring v4 tier rules …", flush=True)
    tiers = tier_metrics_v4(panel_v3_after_drop, cases)

    # Combined score — fair v4 comparison.
    print("  Running fair combined-score comparison …", flush=True)
    combined_fair = combined_score_fair(panel_v3_after_drop, cases)
    altman_full = full_v3[0]  # Altman row for context.

    # Coverage (both SIC rules).
    print("  Building coverage tables …", flush=True)
    coverage_v3 = build_coverage(panel_all, panel_v3_after_drop, cases)
    coverage_v2 = build_coverage(panel_all, panel_v2_after_drop, cases)

    # Render.
    text = render_markdown(
        filings_in=filings_debtor,
        cases=cases,
        collapse_stats=stats,
        panel_all=panel_all,
        panel_v2=panel_v2_after_drop,
        panel_v3=panel_v3,
        panel_v3_after_drop=panel_v3_after_drop,
        rows_dropped_in_case=dropped,
        common_v3=common_v3,
        full_metrics_v3=full_v3,
        common_metrics_v3=common_v3_metrics,
        full_metrics_v2=full_v2,
        coverage_v3=coverage_v3,
        coverage_v2=coverage_v2,
        tier_results=tiers,
        combined_fair=combined_fair,
        altman_full=altman_full,
    )
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(text, encoding="utf-8")
    print(f"  ✓ Wrote {out_path}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
