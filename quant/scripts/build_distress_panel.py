"""
build_distress_panel.py — Fulcrum v5 Phase 4 (panel builder)
================================================================

Builds the Distress Radar backtest panel. For each quarter-end in the
sample window, walks every CIK in SEC's companyfacts.zip, applies
point-in-time fact extraction (facts whose `filed` date is on or before
the as-of date), filters by SIC code (non-financial, non-REIT) and the
spec's leverage/coverage/debt tests, computes the filing-only scores
the backtest can honestly evaluate (Altman Z″, coverage, net leverage,
liquidity runway, 24-month maturity wall), and writes the panel out.

Why point-in-time matters: without it, a company's "known today" facts
include revisions filed years after the as-of date. Using those would
tell the backtest things no real-time analyst could have seen. Every
fact in companyfacts carries a `filed` timestamp — the `_select_pit`
helpers below enforce it rigorously.

Flow quantities (OperatingIncomeLoss, InterestExpense, D&A, CFO, capex,
NetIncome) use the most recently-filed FY (10-K) observation whose
`end` date is on or before the as-of date. This is conservative: the
LTM measurement is up to ~12 months stale. Quarterly LTM aggregation is
feasible later; the FY-only pass gives a defensible baseline without
getting tangled in XBRL's fp=FY-vs-Q4 ambiguities.

Stock quantities (Assets, Cash, Debt tiers, StockholdersEquity, RE, WC
components) use the most recently-filed observation of any fp whose
`end` date is on or before the as-of date.

Universe:
  SIC NOT in 6000-6799 (financials and REITs excluded)
  Total debt > $250m
  AT LEAST ONE of:
    net_debt / EBITDA > 4x
    EBIT / Interest < 2x
  Market-cap test skipped — the backtest has no price panel.

Outputs:
  quant/research/distress_panel.csv   (one row per (as_of, CIK) that passes)

Inputs:
  quant/.cache/sec/companyfacts.zip   (fetched by fetch_sec_bulk.py)
  quant/.cache/sec/submissions.zip    (fetched by fetch_sec_bulk.py)
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
import zipfile
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable, Iterator

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


# =============================================================================
# Config
# =============================================================================

UNIVERSE_DEBT_FLOOR = 250_000_000      # $250m
NET_LEVERAGE_THRESHOLD = 4.0           # net debt / EBITDA
COVERAGE_THRESHOLD = 2.0               # EBIT / interest

# SIC exclusions: 6000-6799 = financials, holding companies, insurance, REITs.
FINANCIAL_SIC_LOW = 6000
FINANCIAL_SIC_HIGH = 6799

# Longest tag-for-tag fallback chains for XBRL variability. First match wins.
TAG_FALLBACKS: dict[str, list[str]] = {
    "assets": ["Assets"],
    "assets_current": ["AssetsCurrent"],
    "liabilities": ["Liabilities"],
    "liabilities_current": ["LiabilitiesCurrent"],
    "cash": [
        "CashAndCashEquivalentsAtCarryingValue",
        "Cash",
        "CashCashEquivalentsAndShortTermInvestments",
    ],
    "long_term_debt_noncurrent": [
        "LongTermDebtNoncurrent",
        "LongTermDebt",
    ],
    "long_term_debt_current": [
        "LongTermDebtCurrent",
        "LongTermDebtAndCapitalLeaseObligationsCurrent",
    ],
    "short_term_borrowings": [
        "ShortTermBorrowings",
        "DebtCurrent",
        "CommercialPaper",
    ],
    "retained_earnings": [
        "RetainedEarningsAccumulatedDeficit",
    ],
    "stockholders_equity": [
        "StockholdersEquity",
        "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest",
    ],
    "net_income": [
        "NetIncomeLoss",
        "ProfitLoss",
    ],
    "operating_income": [
        "OperatingIncomeLoss",
    ],
    "interest_expense": [
        "InterestExpense",
        "InterestAndDebtExpense",
    ],
    "depreciation_amortization": [
        "DepreciationDepletionAndAmortization",
        "DepreciationAmortizationAndAccretionNet",
        "DepreciationAndAmortization",
        "Depreciation",
    ],
    "cfo": [
        "NetCashProvidedByUsedInOperatingActivities",
        "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
    ],
    "capex": [
        "PaymentsToAcquirePropertyPlantAndEquipment",
        "PaymentsToAcquireProductiveAssets",
    ],
    "maturities_12m": [
        "LongTermDebtMaturitiesRepaymentsOfPrincipalInNextTwelveMonths",
    ],
    "maturities_13_24m": [
        "LongTermDebtMaturitiesRepaymentsOfPrincipalInYearTwo",
    ],
}

STOCK_KEYS = {
    "assets", "assets_current", "liabilities", "liabilities_current",
    "cash", "long_term_debt_noncurrent", "long_term_debt_current",
    "short_term_borrowings", "retained_earnings", "stockholders_equity",
    "maturities_12m", "maturities_13_24m",
}
# Flow keys use FY observations for LTM approximation.
FLOW_KEYS = {
    "net_income", "operating_income", "interest_expense",
    "depreciation_amortization", "cfo", "capex",
}


# =============================================================================
# Point-in-time extraction
# =============================================================================

@dataclass
class Fact:
    value: float
    end: date
    filed: date
    fp: str
    form: str


def _parse_date(s: str) -> date | None:
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _facts_for_tag(cf_facts: dict, taxonomy: str, tag: str) -> list[Fact]:
    """Collect all USD observations for a tag under a given taxonomy (us-gaap / ifrs-full)."""
    tx = cf_facts.get(taxonomy, {})
    node = tx.get(tag, {})
    units = node.get("units", {})
    # Most companies report in USD; prefer that unit.
    observations = units.get("USD") or units.get("USD/shares") or []
    out: list[Fact] = []
    for obs in observations:
        val = obs.get("val")
        end = _parse_date(obs.get("end", ""))
        filed = _parse_date(obs.get("filed", ""))
        fp = obs.get("fp") or ""
        form = obs.get("form") or ""
        if val is None or end is None or filed is None:
            continue
        try:
            fval = float(val)
        except (TypeError, ValueError):
            continue
        out.append(Fact(value=fval, end=end, filed=filed, fp=fp, form=form))
    return out


def _select_pit_stock(facts: Iterable[Fact], as_of: date) -> float | None:
    """Most-recent instantaneous fact (any fp) with filed ≤ as_of and end ≤ as_of."""
    best: Fact | None = None
    for f in facts:
        if f.filed > as_of or f.end > as_of:
            continue
        # Prefer the fact with the latest `end` date; break ties by latest `filed`.
        if best is None or (f.end, f.filed) > (best.end, best.filed):
            best = f
    return best.value if best else None


def _select_pit_flow(facts: Iterable[Fact], as_of: date) -> float | None:
    """Most-recent FY (annual) observation with filed ≤ as_of and end ≤ as_of."""
    best: Fact | None = None
    for f in facts:
        if f.fp != "FY":
            continue
        if f.filed > as_of or f.end > as_of:
            continue
        if best is None or (f.end, f.filed) > (best.end, best.filed):
            best = f
    return best.value if best else None


def prepack_cik_facts(cf_facts: dict) -> dict[str, list[Fact]]:
    """
    Pre-extract and merge every observation for each logical key once per
    CIK. Returns {key: sorted_facts}. Later `extract_pit(packed, key, as_of)`
    calls then just filter by date instead of re-parsing the raw JSON for
    every quarter-end.
    """
    packed: dict[str, list[Fact]] = {}
    for key, tags in TAG_FALLBACKS.items():
        merged: list[Fact] = []
        for tag in tags:
            for taxonomy in ("us-gaap", "ifrs-full"):
                merged.extend(_facts_for_tag(cf_facts, taxonomy, tag))
            if merged:
                # Use the first tag that produced facts; the fallback chain
                # is ordered by preference and mixing multiple real tags
                # across companies breeds silent double-counting.
                break
        if merged:
            packed[key] = merged
    return packed


def extract_pit(packed: dict[str, list[Fact]], key: str, as_of: date) -> float | None:
    """Return the point-in-time value for a logical key from pre-packed facts."""
    facts = packed.get(key)
    if not facts:
        return None
    if key in STOCK_KEYS:
        return _select_pit_stock(facts, as_of)
    return _select_pit_flow(facts, as_of)


# =============================================================================
# SIC extraction from submissions.zip
# =============================================================================

def load_sic_map(submissions_zip: Path) -> dict[str, tuple[int | None, str]]:
    """Return {cik_zero_padded: (sic_int_or_None, name)} across all CIKs."""
    out: dict[str, tuple[int | None, str]] = {}
    with zipfile.ZipFile(submissions_zip) as zf:
        for member in zf.namelist():
            # Main submissions files are named CIK##########.json. Sub-files
            # like CIK##########-submissions-001.json carry only extra filings
            # history and no sic/name — skip them.
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
            name = j.get("name") or j.get("entityName") or ""
            out[cik] = (sic, name)
    return out


# =============================================================================
# Row builder
# =============================================================================

@dataclass
class PanelRow:
    as_of_date: str
    cik: str
    sic: int | None
    name: str
    total_debt: float | None
    cash: float | None
    ebit: float | None
    ebitda: float | None
    interest: float | None
    coverage: float | None
    net_leverage: float | None
    altman_z_double_prime: float | None
    cfo_ltm: float | None
    capex_ltm: float | None
    fcf_ltm: float | None
    runway_months: float | None
    maturities_12m: float | None
    maturities_13_24m: float | None
    maturity_pressure_24m: float | None
    debt_gt_250m: bool
    lev_test_pass: bool
    cov_test_pass: bool
    universe_pass: bool


def _safe_div(num: float | None, den: float | None) -> float | None:
    if num is None or den is None or den == 0:
        return None
    return num / den


def _add(*vals: float | None) -> float | None:
    """Sum non-None values. Returns None if ALL inputs are None."""
    parts = [v for v in vals if v is not None]
    return sum(parts) if parts else None


def compute_row(
    as_of: date,
    cik: str,
    sic: int | None,
    name: str,
    packed: dict[str, list[Fact]],
) -> PanelRow | None:
    """
    Return a PanelRow if the CIK passes universe filters as of `as_of`, else None.
    `packed` is produced once per CIK by `prepack_cik_facts`.
    """
    # SIC filter first — fast reject.
    if sic is not None and FINANCIAL_SIC_LOW <= sic <= FINANCIAL_SIC_HIGH:
        return None

    cash = extract_pit(packed, "cash", as_of)
    ltd_nc = extract_pit(packed, "long_term_debt_noncurrent", as_of)
    ltd_cur = extract_pit(packed, "long_term_debt_current", as_of)
    std = extract_pit(packed, "short_term_borrowings", as_of)
    total_debt = _add(ltd_nc, ltd_cur, std)
    if total_debt is None:
        return None

    debt_gt_250m = total_debt > UNIVERSE_DEBT_FLOOR

    ebit = extract_pit(packed, "operating_income", as_of)
    da = extract_pit(packed, "depreciation_amortization", as_of)
    ebitda = _add(ebit, da)

    interest = extract_pit(packed, "interest_expense", as_of)
    net_debt = total_debt - (cash or 0.0)

    coverage = _safe_div(ebit, interest)
    net_leverage = _safe_div(net_debt, ebitda) if (ebitda is not None and ebitda > 0) else None

    lev_test_pass = net_leverage is not None and net_leverage > NET_LEVERAGE_THRESHOLD
    cov_test_pass = coverage is not None and coverage < COVERAGE_THRESHOLD
    universe_pass = debt_gt_250m and (lev_test_pass or cov_test_pass)

    if not universe_pass:
        return None

    # Altman Z″ (non-manufacturer): 6.56*WC/TA + 3.26*RE/TA + 6.72*EBIT/TA + 1.05*E/TL
    assets = extract_pit(packed, "assets", as_of)
    assets_cur = extract_pit(packed, "assets_current", as_of)
    liab = extract_pit(packed, "liabilities", as_of)
    liab_cur = extract_pit(packed, "liabilities_current", as_of)
    retained = extract_pit(packed, "retained_earnings", as_of)
    equity = extract_pit(packed, "stockholders_equity", as_of)

    wc: float | None = None
    if assets_cur is not None and liab_cur is not None:
        wc = assets_cur - liab_cur

    altman: float | None = None
    if (
        assets is not None and assets > 0
        and liab is not None and liab > 0
        and wc is not None
        and retained is not None
        and ebit is not None
        and equity is not None
    ):
        altman = (
            6.56 * (wc / assets)
            + 3.26 * (retained / assets)
            + 6.72 * (ebit / assets)
            + 1.05 * (equity / liab)
        )

    # Liquidity runway (months): cash / monthly cash burn, burn = -(CFO - capex) when negative.
    cfo = extract_pit(packed, "cfo", as_of)
    capex = extract_pit(packed, "capex", as_of)
    fcf: float | None = None
    if cfo is not None:
        fcf = cfo - (capex or 0.0)
    runway_months: float | None = None
    if cash is not None and fcf is not None and fcf < 0:
        monthly_burn = -fcf / 12.0
        runway_months = cash / monthly_burn if monthly_burn > 0 else None

    # 24m maturity pressure
    mat12 = extract_pit(packed, "maturities_12m", as_of)
    mat24 = extract_pit(packed, "maturities_13_24m", as_of)
    maturity_pressure_24m: float | None = None
    if mat12 is not None or mat24 is not None:
        total_mat = (mat12 or 0.0) + (mat24 or 0.0)
        denom = (cash or 0.0) + max(0.0, fcf or 0.0)
        if denom > 0:
            maturity_pressure_24m = total_mat / denom

    return PanelRow(
        as_of_date=as_of.isoformat(),
        cik=cik,
        sic=sic,
        name=name,
        total_debt=total_debt,
        cash=cash,
        ebit=ebit,
        ebitda=ebitda,
        interest=interest,
        coverage=coverage,
        net_leverage=net_leverage,
        altman_z_double_prime=altman,
        cfo_ltm=cfo,
        capex_ltm=capex,
        fcf_ltm=fcf,
        runway_months=runway_months,
        maturities_12m=mat12,
        maturities_13_24m=mat24,
        maturity_pressure_24m=maturity_pressure_24m,
        debt_gt_250m=debt_gt_250m,
        lev_test_pass=lev_test_pass,
        cov_test_pass=cov_test_pass,
        universe_pass=True,
    )


# =============================================================================
# Driver
# =============================================================================

def quarter_ends(start: date, end: date) -> list[date]:
    """Return a list of quarter-end dates (3-31, 6-30, 9-30, 12-31) in [start, end]."""
    out: list[date] = []
    for yr in range(start.year, end.year + 1):
        for m, d in [(3, 31), (6, 30), (9, 30), (12, 31)]:
            qe = date(yr, m, d)
            if start <= qe <= end:
                out.append(qe)
    return out


def iter_companyfacts(companyfacts_zip: Path) -> Iterator[tuple[str, dict]]:
    """Yield (cik_zero_padded, facts_dict) for each CIK in the zip."""
    with zipfile.ZipFile(companyfacts_zip) as zf:
        for member in zf.namelist():
            if not member.startswith("CIK") or not member.endswith(".json"):
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
            facts = j.get("facts", {}) or {}
            yield cik, facts


def main() -> int:
    parser = argparse.ArgumentParser(description="Fulcrum v5 Distress Radar panel builder")
    parser.add_argument("--cache-dir", default="quant/.cache/sec")
    parser.add_argument("--start", default="2014-12-31")
    parser.add_argument("--end", default=date.today().isoformat())
    parser.add_argument("--out", default="quant/research/distress_panel.csv")
    parser.add_argument("--summary-out")
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Stop after processing N CIKs (debug only).",
    )
    args = parser.parse_args()

    cache_dir = Path(args.cache_dir)
    cf_zip = cache_dir / "companyfacts.zip"
    sub_zip = cache_dir / "submissions.zip"
    for z in (cf_zip, sub_zip):
        if not z.exists():
            print(f"❌ Missing bulk zip: {z}. Run fetch_sec_bulk.py first.", file=sys.stderr)
            return 2

    start = _parse_date(args.start) or date(2014, 12, 31)
    end = _parse_date(args.end) or date.today()
    qends = quarter_ends(start, end)
    print(f"  Panel window: {qends[0]} → {qends[-1]} ({len(qends)} quarter-ends)", flush=True)

    print(f"  Loading SIC map from {sub_zip} …", flush=True)
    sic_map = load_sic_map(sub_zip)
    print(f"  ✓ {len(sic_map):,} CIKs with SIC metadata", flush=True)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    fieldnames = [
        "as_of_date", "cik", "sic", "name",
        "total_debt", "cash", "ebit", "ebitda", "interest",
        "coverage", "net_leverage", "altman_z_double_prime",
        "cfo_ltm", "capex_ltm", "fcf_ltm", "runway_months",
        "maturities_12m", "maturities_13_24m", "maturity_pressure_24m",
        "debt_gt_250m", "lev_test_pass", "cov_test_pass", "universe_pass",
    ]

    rows_written = 0
    ciks_seen = 0
    ciks_with_any_row = 0

    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for cik, facts in iter_companyfacts(cf_zip):
            ciks_seen += 1
            if args.limit and ciks_seen > args.limit:
                break
            sic, name = sic_map.get(cik, (None, ""))
            if sic is not None and FINANCIAL_SIC_LOW <= sic <= FINANCIAL_SIC_HIGH:
                continue
            packed = prepack_cik_facts(facts)
            if not packed:
                continue
            any_row = False
            for qe in qends:
                row = compute_row(qe, cik, sic, name, packed)
                if row is None:
                    continue
                writer.writerow({
                    k: ("" if v is None else v) for k, v in row.__dict__.items()
                })
                rows_written += 1
                any_row = True
            if any_row:
                ciks_with_any_row += 1
            if ciks_seen % 500 == 0:
                print(
                    f"    scanned {ciks_seen:,} CIKs; "
                    f"{ciks_with_any_row:,} universe-eligible at some quarter; "
                    f"{rows_written:,} panel rows",
                    flush=True,
                )

    print(
        f"  ✓ Wrote {out_path}: {rows_written:,} rows across "
        f"{ciks_with_any_row:,} CIKs ({ciks_seen:,} scanned)",
        flush=True,
    )
    if args.summary_out:
        Path(args.summary_out).write_text(json.dumps({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "start": start.isoformat(),
            "end": end.isoformat(),
            "quarters": len(qends),
            "ciks_scanned": ciks_seen,
            "ciks_universe_eligible": ciks_with_any_row,
            "panel_rows": rows_written,
            "output_path": str(out_path),
        }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
