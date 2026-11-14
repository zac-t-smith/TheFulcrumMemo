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

# SIC exclusions. v2 excluded the entire 6000-6799 band, which incorrectly
# blocked WeWork (6512), Core Scientific (6199 is excluded, this one is OK
# to flag), American Apparel (6770 blank-check), and all real-estate
# operators. v3 keeps 6500-6599 real estate operators in, keeps blank-check
# 6770 in (operating companies pre-merger), and keeps only the real
# financials and REITs out: 6000-6499 and 6798.
EXCLUDE_SIC_LOW_NEW = 6000
EXCLUDE_SIC_HIGH_NEW = 6499
EXCLUDE_SIC_REIT_NEW = 6798
# v2 exclusion kept for reporting both ways.
EXCLUDE_SIC_LOW_OLD = 6000
EXCLUDE_SIC_HIGH_OLD = 6799


def is_excluded_sic(sic: int | None, rule: str = "v3") -> bool:
    if sic is None:
        return False
    if rule == "v3":
        return EXCLUDE_SIC_LOW_NEW <= sic <= EXCLUDE_SIC_HIGH_NEW or sic == EXCLUDE_SIC_REIT_NEW
    return EXCLUDE_SIC_LOW_OLD <= sic <= EXCLUDE_SIC_HIGH_OLD


# -----------------------------------------------------------------------------
# XBRL tag fallbacks
# -----------------------------------------------------------------------------
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
    # Debt: total-LTD-first preferred tags.
    "ltd_total_single_tag": [
        "LongTermDebt",
        "LongTermDebtAndCapitalLeaseObligations",
        "DebtAndCapitalLeaseObligations",             # Weatherford, others
        "DebtLongtermAndShorttermCombinedAmount",     # Weatherford, others — includes ST
    ],
    # Debt: noncurrent-only variants.
    "ltd_noncurrent_only": [
        "LongTermDebtNoncurrent",
        "LongTermDebtAndCapitalLeaseObligationsNoncurrent",
    ],
    # Debt: current-portion-only variants.
    "ltd_current_only": [
        "LongTermDebtCurrent",
        "LongTermDebtAndCapitalLeaseObligationsCurrent",
    ],
    # Short-term borrowings variants.
    "st_debt": [
        "ShortTermBorrowings",
        "DebtCurrent",
        "CommercialPaper",
        "LinesOfCreditCurrent",
    ],
    # Instrument-level tags — used only when none of the above resolve.
    # These are totals-across-instruments for the registrant (XBRL default
    # dimension); we sum across them to approximate total debt.
    "instr_senior_notes": ["SeniorNotes"],
    "instr_convertible_notes": ["ConvertibleNotesPayable"],
    "instr_secured_debt": ["SecuredDebt"],
    "instr_other_ltd_noncurrent": ["OtherLongTermDebtNoncurrent"],
    "instr_notes_payable": ["NotesPayable"],
    "instr_debt_instrument_carrying": ["DebtInstrumentCarryingAmount"],

    "retained_earnings": ["RetainedEarningsAccumulatedDeficit"],
    "stockholders_equity": [
        "StockholdersEquity",
        "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest",
    ],
    "net_income": ["NetIncomeLoss", "ProfitLoss"],
    "operating_income": ["OperatingIncomeLoss"],
    "interest_expense": ["InterestExpense", "InterestAndDebtExpense"],
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
    "maturities_12m": ["LongTermDebtMaturitiesRepaymentsOfPrincipalInNextTwelveMonths"],
    "maturities_13_24m": ["LongTermDebtMaturitiesRepaymentsOfPrincipalInYearTwo"],
}

STOCK_KEYS = {
    "assets", "assets_current", "liabilities", "liabilities_current",
    "cash",
    "ltd_total_single_tag", "ltd_noncurrent_only", "ltd_current_only", "st_debt",
    "instr_senior_notes", "instr_convertible_notes", "instr_secured_debt",
    "instr_other_ltd_noncurrent", "instr_notes_payable", "instr_debt_instrument_carrying",
    "retained_earnings", "stockholders_equity",
    "maturities_12m", "maturities_13_24m",
}
FLOW_KEYS = {
    "net_income", "operating_income", "interest_expense",
    "depreciation_amortization", "cfo", "capex",
}

INSTRUMENT_DEBT_KEYS = [
    "instr_senior_notes", "instr_convertible_notes", "instr_secured_debt",
    "instr_other_ltd_noncurrent", "instr_notes_payable",
    "instr_debt_instrument_carrying",
]


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
    start: date | None = None
    span_days: int | None = None


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
    observations = units.get("USD") or units.get("USD/shares") or []
    out: list[Fact] = []
    for obs in observations:
        val = obs.get("val")
        end = _parse_date(obs.get("end", ""))
        filed = _parse_date(obs.get("filed", ""))
        start = _parse_date(obs.get("start", ""))
        fp = obs.get("fp") or ""
        form = obs.get("form") or ""
        if val is None or end is None or filed is None:
            continue
        try:
            fval = float(val)
        except (TypeError, ValueError):
            continue
        span = (end - start).days if start is not None else None
        out.append(Fact(
            value=fval, end=end, filed=filed, fp=fp, form=form,
            start=start, span_days=span,
        ))
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
    """
    LTM selection with quarterly aggregation.

    Preference 1: most-recent FY (fp=FY) observation ending within the last
                  12 months of as_of. Standard annual-report path.
    Preference 2: sum of the four most recent pure-quarterly observations
                  (span 60-110 days) whose combined end dates cover a
                  360±60 day window ending at or before as_of.

    The quarterly path lifts LTM freshness from stale-up-to-12-months (v2)
    to roughly stale-up-to-the-last-10-Q-filing. XBRL YTD-span observations
    (span 150-290 days) are intentionally ignored because summing them
    with pure-quarterly values double-counts.
    """
    best_fy: Fact | None = None
    quarterly: list[Fact] = []
    for f in facts:
        if f.filed > as_of or f.end > as_of:
            continue
        if f.fp == "FY":
            # Prefer FY observations whose end is within 400 days of as_of
            # so an old 10-K doesn't bury a newer 10-Q set.
            if (as_of - f.end).days > 400:
                continue
            if best_fy is None or (f.end, f.filed) > (best_fy.end, best_fy.filed):
                best_fy = f
        elif f.fp in ("Q1", "Q2", "Q3", "Q4"):
            if f.span_days is not None and 60 <= f.span_days <= 110:
                quarterly.append(f)

    if best_fy is not None:
        return best_fy.value

    if len(quarterly) < 4:
        return None
    # Dedup by `end` keeping latest-filed version, then take the most recent four.
    by_end: dict[date, Fact] = {}
    for f in quarterly:
        prev = by_end.get(f.end)
        if prev is None or f.filed > prev.filed:
            by_end[f.end] = f
    unique = sorted(by_end.values(), key=lambda f: f.end, reverse=True)
    if len(unique) < 4:
        return None
    last_four = unique[:4]
    span = (last_four[0].end - last_four[-1].end).days
    if not (240 <= span <= 400):
        return None
    return sum(f.value for f in last_four)


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


# -----------------------------------------------------------------------------
# Tiered total-debt computation (v3)
# -----------------------------------------------------------------------------

def compute_total_debt(
    packed: dict[str, list[Fact]], as_of: date,
) -> tuple[float | None, str | None]:
    """
    Return (total_debt_usd, source_tier).

    Companies tag debt inconsistently — some use a clean single "LongTermDebt"
    total, some only tag the current portion, some rely on instrument-level
    tags (SeniorNotes, DebtInstrumentCarryingAmount, etc.). Rather than stop
    at the first tier that produces any value, we compute every tier and
    take the LARGEST. That protects against (for example) Weatherford's
    pre-2022 filings where only LongTermDebtCurrent was tagged ($0.4B)
    while instrument-level DebtInstrumentCarryingAmount tagged $1.5B+.
    Short-term borrowings are added once, outside the max.

      Tier 1 ("total"): single-tag LTD total (LongTermDebt,
          LongTermDebtAndCapitalLeaseObligations, DebtAndCapitalLeaseObligations,
          DebtLongtermAndShorttermCombinedAmount).
      Tier 2 ("split"): LongTermDebtNoncurrent + LongTermDebtCurrent.
      Tier 3 ("instruments"): sum of SeniorNotes + ConvertibleNotes +
          SecuredDebt + OtherLongTermDebtNoncurrent + NotesPayable +
          DebtInstrumentCarryingAmount.

    Returns (None, None) if every tier is empty.
    """
    candidates: list[tuple[float, str]] = []

    total_ltd = extract_pit(packed, "ltd_total_single_tag", as_of)
    if total_ltd is not None and total_ltd > 0:
        candidates.append((total_ltd, "total"))

    nc = extract_pit(packed, "ltd_noncurrent_only", as_of)
    cur = extract_pit(packed, "ltd_current_only", as_of)
    if nc is not None and cur is not None:
        candidates.append((nc + cur, "split"))
    elif nc is not None:
        candidates.append((nc, "split(nc_only)"))
    elif cur is not None:
        candidates.append((cur, "split(cur_only)"))

    inst_total = 0.0
    inst_used: list[str] = []
    for key in INSTRUMENT_DEBT_KEYS:
        v = extract_pit(packed, key, as_of)
        if v is not None and v > 0:
            inst_total += v
            inst_used.append(key.replace("instr_", ""))
    if inst_used:
        candidates.append((inst_total, "instruments(" + "+".join(inst_used) + ")"))

    st = extract_pit(packed, "st_debt", as_of)

    if candidates:
        candidates.sort(key=lambda t: t[0], reverse=True)
        best_val, best_tier = candidates[0]
        if st is not None:
            return best_val + st, best_tier + "+st"
        return best_val, best_tier

    if st is not None:
        return st, "st_only"
    return None, None


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
    total_debt_source: str | None   # v3: which debt-tag tier supplied the figure
    liabilities: float | None       # v3: last reported total liabilities (coverage-check input)
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
    # v3: SIC-exclusion flags for both-ways reporting.
    sic_excluded_old: bool          # v2 rule: 6000-6799
    sic_excluded_new: bool          # v3 rule: 6000-6499 or 6798


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

    v3 changes:
      - Debt via tiered compute_total_debt, with a source tier recorded.
      - Flow quantities via quarterly-LTM selection (FY first, then
        sum-of-last-four-quarterly).
      - No early SIC reject; SIC is carried on the row so the backtest
        can apply either exclusion rule for both-ways reporting.
      - Liabilities captured on the row so the backtest's coverage check
        doesn't have to re-open companyfacts.zip.
    """
    cash = extract_pit(packed, "cash", as_of)
    total_debt, total_debt_source = compute_total_debt(packed, as_of)
    liab = extract_pit(packed, "liabilities", as_of)

    debt_gt_250m = (total_debt is not None) and (total_debt > UNIVERSE_DEBT_FLOOR)

    ebit = extract_pit(packed, "operating_income", as_of)
    da = extract_pit(packed, "depreciation_amortization", as_of)
    # EBITDA requires BOTH ebit and D&A — using one alone is a mislabel.
    ebitda = (ebit + da) if (ebit is not None and da is not None) else None

    interest = extract_pit(packed, "interest_expense", as_of)
    net_debt = (total_debt or 0.0) - (cash or 0.0)

    coverage = _safe_div(ebit, interest)
    net_leverage = _safe_div(net_debt, ebitda) if (ebitda is not None and ebitda > 0) else None

    lev_test_pass = net_leverage is not None and net_leverage > NET_LEVERAGE_THRESHOLD
    cov_test_pass = coverage is not None and coverage < COVERAGE_THRESHOLD
    universe_pass = debt_gt_250m and (lev_test_pass or cov_test_pass)

    sic_excluded_old = is_excluded_sic(sic, rule="v2")
    sic_excluded_new = is_excluded_sic(sic, rule="v3")

    # Keep the row if EITHER universe-pass OR the CIK has >=$250m liabilities
    # OR >=$250m debt. The second keeps non-universe-pass companies in the
    # output so backtest coverage analysis can see them. Rows with neither
    # tag resolved get dropped entirely (nothing to analyze).
    keep = universe_pass or (
        liab is not None and liab >= UNIVERSE_DEBT_FLOOR
    ) or (
        total_debt is not None and total_debt >= UNIVERSE_DEBT_FLOOR
    )
    if not keep:
        return None

    # Altman Z″ (non-manufacturer): 6.56*WC/TA + 3.26*RE/TA + 6.72*EBIT/TA + 1.05*E/TL
    assets = extract_pit(packed, "assets", as_of)
    assets_cur = extract_pit(packed, "assets_current", as_of)
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
        total_debt_source=total_debt_source,
        liabilities=liab,
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
        universe_pass=universe_pass,
        sic_excluded_old=sic_excluded_old,
        sic_excluded_new=sic_excluded_new,
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
        "total_debt", "total_debt_source", "liabilities",
        "cash", "ebit", "ebitda", "interest",
        "coverage", "net_leverage", "altman_z_double_prime",
        "cfo_ltm", "capex_ltm", "fcf_ltm", "runway_months",
        "maturities_12m", "maturities_13_24m", "maturity_pressure_24m",
        "debt_gt_250m", "lev_test_pass", "cov_test_pass", "universe_pass",
        "sic_excluded_old", "sic_excluded_new",
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
            # v3: no early SIC reject — the SIC flag is on the row.
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
