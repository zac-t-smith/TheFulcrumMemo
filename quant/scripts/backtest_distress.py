"""
backtest_distress.py — Fulcrum v5 Phase 4 (backtest + report)
================================================================

Joins the Distress Radar panel against the Chapter 11 label set and
emits quant/research/distress_backtest.md with the metrics the user
asked for:
  - Coverage sanity: what fraction of Chapter 11 filers show up in the
    universe panel at least once in the 12 months before filing. A low
    rate is a finding, not something to tune away.
  - For each filing-only score (Altman Z double prime, coverage, net
    leverage, runway, 24-month maturity pressure):
      * AUC at 6- and 12-month lead horizons
      * Precision in the top decile (riskiest 10% of panel rows at the
        scoring date)
      * Median lead time from first-ranking-in-top-decile to Ch11
      * Misses: Chapter 11 filers whose score never crossed the top
        decile in the twelve months before filing, with the probable
        reason (not in universe, score never ranked)

Scores assume HIGHER value = LOWER distress for Altman and coverage,
LOWER value = LOWER distress for net leverage and maturity pressure;
runway is HIGHER = LOWER distress. We invert signs as needed inside
`_rank_series` so "top decile" always means "riskiest".

No Merton / CHS here — those need price history, which Yahoo doesn't
have for most delisted bankrupt names. The spec calls out that gap
explicitly; those scores live-only.
"""

from __future__ import annotations

import argparse
import csv
import math
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Callable, Iterable

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


# =============================================================================
# Loaders
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
class Ch11Row:
    cik: str
    name: str
    filing_date: date
    accession: str


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


def load_ch11(path: Path) -> list[Ch11Row]:
    rows: list[Ch11Row] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            d = _parse_date(r.get("filing_date", ""))
            cik = (r.get("cik") or "").zfill(10)
            if d is None or not cik:
                continue
            rows.append(Ch11Row(
                cik=cik,
                name=r.get("name", ""),
                filing_date=d,
                accession=r.get("accession", ""),
            ))
    return rows


# =============================================================================
# Ranking + metrics
# =============================================================================

SCORE_SPEC: list[tuple[str, str, bool]] = [
    # (panel attribute, label, higher_is_riskier)
    ("altman", "Altman Z''", False),
    ("coverage", "Coverage (EBIT / Interest)", False),
    ("net_leverage", "Net leverage (NetDebt / EBITDA)", True),
    ("runway", "Liquidity runway (months)", False),
    ("maturity_pressure", "24m maturity pressure", True),
]


def _rank_series(
    rows: Iterable[PanelRow], score_key: str, higher_is_riskier: bool,
) -> dict[tuple[date, str], tuple[int, int]]:
    """
    Within each as-of date, rank CIKs by distress (riskiest = rank 1).
    Returns {(as_of, cik): (rank, n)}. Rows with None score are skipped.
    """
    groups: dict[date, list[tuple[float, str]]] = defaultdict(list)
    for r in rows:
        v = r.score(score_key)
        if v is None or math.isnan(v) or math.isinf(v):
            continue
        risk_score = v if higher_is_riskier else -v
        groups[r.as_of_date].append((risk_score, r.cik))

    out: dict[tuple[date, str], tuple[int, int]] = {}
    for d, items in groups.items():
        items.sort(key=lambda t: t[0], reverse=True)  # riskiest first
        n = len(items)
        for idx, (_, cik) in enumerate(items):
            out[(d, cik)] = (idx + 1, n)
    return out


def _roc_auc(pos_scores: list[float], neg_scores: list[float]) -> float | None:
    """Mann-Whitney U based AUC; no numpy needed."""
    if not pos_scores or not neg_scores:
        return None
    combined = [(s, 1) for s in pos_scores] + [(s, 0) for s in neg_scores]
    combined.sort(key=lambda t: t[0])
    # Average rank for ties.
    ranks: dict[int, float] = {}
    i = 0
    while i < len(combined):
        j = i
        while j + 1 < len(combined) and combined[j + 1][0] == combined[i][0]:
            j += 1
        avg_rank = (i + j + 2) / 2  # 1-indexed avg
        for k in range(i, j + 1):
            ranks[k] = avg_rank
        i = j + 1
    sum_ranks_pos = sum(ranks[k] for k in range(len(combined)) if combined[k][1] == 1)
    n_pos = len(pos_scores)
    n_neg = len(neg_scores)
    u = sum_ranks_pos - n_pos * (n_pos + 1) / 2
    return u / (n_pos * n_neg)


# =============================================================================
# Backtest
# =============================================================================

@dataclass
class ScoreReport:
    label: str
    key: str
    n_rows_scored: int = 0
    auc_12m: float | None = None
    auc_6m: float | None = None
    top_decile_precision_12m: float | None = None
    top_decile_precision_6m: float | None = None
    median_lead_months_12m: float | None = None
    median_lead_months_6m: float | None = None
    hits_12m: int = 0
    hits_6m: int = 0


def _scoring_dates_before(d: date, qends: list[date], months: int) -> list[date]:
    """Quarter-ends in (d − months, d]."""
    start = d - timedelta(days=int(30.44 * months))
    return [q for q in qends if start < q <= d]


def _median(xs: list[float]) -> float | None:
    if not xs:
        return None
    xs = sorted(xs)
    n = len(xs)
    if n % 2 == 1:
        return xs[n // 2]
    return (xs[n // 2 - 1] + xs[n // 2]) / 2


def backtest(
    panel: list[PanelRow], ch11: list[Ch11Row],
) -> tuple[list[ScoreReport], dict[str, object]]:
    qends = sorted({r.as_of_date for r in panel})
    panel_ciks_by_date: dict[date, set[str]] = defaultdict(set)
    for r in panel:
        panel_ciks_by_date[r.as_of_date].add(r.cik)

    # Universe-coverage sanity: of the 1,316 filers, how many appear in the
    # panel at any quarter-end during the 12 months before their filing?
    coverage_hits = 0
    missing: list[tuple[Ch11Row, str]] = []
    for f in ch11:
        pre_window = _scoring_dates_before(f.filing_date, qends, 12)
        in_universe = any(f.cik in panel_ciks_by_date[q] for q in pre_window)
        if in_universe:
            coverage_hits += 1
        else:
            # Classify the likely reason. Without additional data we can only
            # say "not in panel"; follow-ups can enrich with submissions.zip.
            missing.append((f, "not in universe panel in the 12 months before filing"))

    reports: list[ScoreReport] = []

    for key, label, higher_is_riskier in SCORE_SPEC:
        ranks = _rank_series(panel, key, higher_is_riskier)

        # AUC inputs: "risk score" at each row = negated-rank fraction so higher = riskier.
        # Use raw score (sign-flipped if needed) for the AUC positives/negatives.
        pos12: list[float] = []
        neg12: list[float] = []
        pos6: list[float] = []
        neg6: list[float] = []
        hits12 = 0
        hits6 = 0
        lead12: list[float] = []
        lead6: list[float] = []
        top_decile_pos12 = 0
        top_decile_rows12 = 0
        top_decile_pos6 = 0
        top_decile_rows6 = 0
        n_rows = 0

        # For every panel row, we need to know if the CIK files Ch11 within 6m / 12m.
        ch11_by_cik: dict[str, list[date]] = defaultdict(list)
        for f in ch11:
            ch11_by_cik[f.cik].append(f.filing_date)
        for v in ch11_by_cik.values():
            v.sort()

        for r in panel:
            s = r.score(key)
            if s is None or math.isnan(s) or math.isinf(s):
                continue
            risk_score = s if higher_is_riskier else -s
            n_rows += 1
            # Horizon labels.
            future_filings = [fd for fd in ch11_by_cik.get(r.cik, [])
                              if fd > r.as_of_date]
            next_filing = future_filings[0] if future_filings else None

            def label_within(months: int) -> bool:
                if next_filing is None:
                    return False
                return (next_filing - r.as_of_date).days <= int(30.44 * months)

            lab12 = label_within(12)
            lab6 = label_within(6)
            (pos12 if lab12 else neg12).append(risk_score)
            (pos6 if lab6 else neg6).append(risk_score)

            # Top-decile accounting.
            rank, n = ranks.get((r.as_of_date, r.cik), (None, None))
            if rank is not None and n is not None and n > 0:
                in_top = rank <= max(1, n // 10)
                if in_top:
                    top_decile_rows12 += 1
                    if lab12:
                        top_decile_pos12 += 1
                        lead12.append((next_filing - r.as_of_date).days / 30.44)
                    top_decile_rows6 += 1
                    if lab6:
                        top_decile_pos6 += 1
                        lead6.append((next_filing - r.as_of_date).days / 30.44)
            # Hit counters.
            if lab12:
                hits12 += 1
            if lab6:
                hits6 += 1

        auc12 = _roc_auc(pos12, neg12)
        auc6 = _roc_auc(pos6, neg6)
        prec12 = top_decile_pos12 / top_decile_rows12 if top_decile_rows12 else None
        prec6 = top_decile_pos6 / top_decile_rows6 if top_decile_rows6 else None

        reports.append(ScoreReport(
            label=label,
            key=key,
            n_rows_scored=n_rows,
            auc_12m=auc12,
            auc_6m=auc6,
            top_decile_precision_12m=prec12,
            top_decile_precision_6m=prec6,
            median_lead_months_12m=_median(lead12),
            median_lead_months_6m=_median(lead6),
            hits_12m=hits12,
            hits_6m=hits6,
        ))

    summary = {
        "n_panel_rows": len(panel),
        "n_quarter_ends": len(qends),
        "n_ch11_filings": len(ch11),
        "coverage_pct": (coverage_hits / len(ch11) * 100) if ch11 else 0.0,
        "coverage_hits": coverage_hits,
        "missing": missing,
    }
    return reports, summary


# =============================================================================
# Markdown report
# =============================================================================

def _fmt(x: float | None, digits: int = 3) -> str:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        return "—"
    return f"{x:.{digits}f}"


def render_markdown(reports: list[ScoreReport], summary: dict) -> str:
    out: list[str] = []
    out.append("# Fulcrum v5 Phase 4 — Distress Radar backtest\n")
    out.append(
        f"_Generated {datetime.now(timezone.utc).isoformat()} from "
        f"{summary['n_panel_rows']:,} panel rows across "
        f"{summary['n_quarter_ends']} quarter-ends against "
        f"{summary['n_ch11_filings']:,} Chapter 11 filings._\n"
    )

    out.append("## Universe-coverage sanity check\n")
    out.append(
        f"Of the {summary['n_ch11_filings']:,} Chapter 11 filers in the label "
        f"set, **{summary['coverage_hits']:,} ({summary['coverage_pct']:.1f}%)** "
        f"appear in the universe panel at least once in the 12 months before "
        f"filing. The others are below the $250m debt threshold, in excluded "
        f"SIC codes (financials / REITs), had no reported XBRL facts at the "
        f"required precision, or filed before their first annual filing was "
        f"on record.\n"
    )
    if summary["missing"]:
        n_missing = len(summary["missing"])
        sample = summary["missing"][: min(10, n_missing)]
        out.append("### First 10 missing names:\n")
        for row, reason in sample:
            out.append(
                f"- {row.filing_date}  {row.cik}  {row.name}  — {reason}"
            )
        out.append("")

    out.append("## Score metrics\n")
    out.append(
        "| Score | n rows | AUC (12m) | AUC (6m) | Top-decile prec 12m | Top-decile prec 6m | Median lead 12m (mo) | Hits 12m | Hits 6m |"
    )
    out.append("|---|---:|---:|---:|---:|---:|---:|---:|---:|")
    for r in reports:
        out.append(
            f"| {r.label} | {r.n_rows_scored:,} | "
            f"{_fmt(r.auc_12m)} | {_fmt(r.auc_6m)} | "
            f"{_fmt(r.top_decile_precision_12m)} | {_fmt(r.top_decile_precision_6m)} | "
            f"{_fmt(r.median_lead_months_12m, 1)} | {r.hits_12m:,} | {r.hits_6m:,} |"
        )
    out.append("")
    out.append(
        "### Read conventions\n"
        "- Sign on net leverage and maturity-pressure scores is flipped so "
        "\"top decile\" always means riskiest.\n"
        "- AUC is standard ROC-AUC with Mann-Whitney U. 0.5 = no signal; "
        "0.7-0.8 = usable; ≥0.8 = strong.\n"
        "- Top-decile precision = share of the panel's riskiest 10% at a "
        "quarter-end that file Chapter 11 within the next 6 or 12 months. "
        "Base rate is tiny (a few hundred filers over tens of thousands of "
        "rows), so any precision above ~2-3% is informative.\n"
        "- Median lead time is measured only on top-decile true positives.\n\n"
        "### Caveats worth repeating\n"
        "- Flow quantities use the most recent FY (10-K) observation, so "
        "LTM is stale up to ~12 months. Quarterly LTM aggregation is a "
        "follow-up improvement.\n"
        "- Merton distance-to-default and CHS failure probability aren't "
        "scored here. Both need stock-price history; Yahoo doesn't carry "
        "most delisted bankrupt tickers. The live radar runs those as "
        "add-ons on names that still have price feeds.\n"
        "- The universe test excludes the market-cap-below-debt branch "
        "(no price panel in backtest). That branch stays live in the "
        "production radar.\n"
    )

    return "\n".join(out)


# =============================================================================
# Driver
# =============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(description="Distress Radar backtest + report")
    parser.add_argument("--panel", default="quant/research/distress_panel.csv")
    parser.add_argument("--ch11", default="quant/research/ch11_filings.csv")
    parser.add_argument("--out", default="quant/research/distress_backtest.md")
    args = parser.parse_args()

    panel_path = Path(args.panel)
    ch11_path = Path(args.ch11)
    if not panel_path.exists():
        print(f"❌ Panel missing: {panel_path}. Run build_distress_panel.py first.", file=sys.stderr)
        return 2
    if not ch11_path.exists():
        print(f"❌ Ch11 list missing: {ch11_path}. Run fetch_ch11_filings.py first.", file=sys.stderr)
        return 2

    print(f"  Loading panel from {panel_path} …", flush=True)
    panel = load_panel(panel_path)
    print(f"  ✓ {len(panel):,} panel rows", flush=True)

    print(f"  Loading Ch11 list from {ch11_path} …", flush=True)
    ch11 = load_ch11(ch11_path)
    print(f"  ✓ {len(ch11):,} Chapter 11 filings", flush=True)

    print("  Running backtest …", flush=True)
    reports, summary = backtest(panel, ch11)
    print(
        f"  ✓ Universe coverage: {summary['coverage_hits']:,} / "
        f"{summary['n_ch11_filings']:,} = {summary['coverage_pct']:.1f}%",
        flush=True,
    )

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(render_markdown(reports, summary), encoding="utf-8")
    print(f"  ✓ Wrote {out_path}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
