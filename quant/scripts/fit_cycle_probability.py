"""
fit_cycle_probability.py — Fulcrum v5 Phase 2B
================================================================

Fits the Cycle Probability (12-month) logistic regression and writes
src/data/cycleModel.json. Mirrors the reference implementation at
quant/scripts/research/cycle_model_leakcheck.py and MUST produce the
same OOS numbers: feature publication lags, training label lags in
calendar months, full-horizon label guard, and onset targets.

Pre-registered primary target: corblacbs_rise_onset (CORBLACBS rising
≥ 0.25pp over the next 4Q, dropping months already in a rising run).
NBER onset is reported as a robustness row only. There is no
select-by-test-AUC logic here — the primary target is fixed.

Primary feature set: ebp_level + t10y3m_min_18m (2 features). The 7-feature
and yield-curve-only sets are reported in the backtest table as
comparison rows but are not shipped as the operational model.

L2-regularized logistic regression (sklearn). Bootstrap draws for the
probability band use a 12-month block bootstrap to respect the serial
correlation of monthly features.

Inputs: CSVs under quant/data/ produced by fetch_fred_data.py and
fetch_ebp.py. See fit-cycle-model.yml for the CI wiring.
"""

from __future__ import annotations

import argparse
import bisect
import csv
import json
import sys
import warnings
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Callable

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# sklearn 1.8 deprecated the penalty/solver keyword pair we rely on in favor
# of l1_ratio. The call still works — mirror the leakcheck's noise suppression.
warnings.filterwarnings("ignore", category=FutureWarning, module="sklearn")

# =============================================================================
# CONFIG — see leakcheck.py for the empirical basis of each number.
# =============================================================================

# Pre-registered primary target. Not selected by AUC.
PRIMARY_TARGET = "corblacbs_rise_onset"
ROBUSTNESS_TARGETS = ["nber_onset_12m"]

# Primary operational model.
PRIMARY_FEATURES = ["ebp_level", "t10y3m_min_18m"]

# Reported-only comparison rows.
ALL_FEATURES = [
    "ebp_level",
    "ebp_change_6m",
    "sloos_cni_large",
    "t10y3m_min_18m",
    "nfci",
    "claims_4w_over_52w_min",
    "baa_pctl",
]
YC_ONLY_FEATURES = ["t10y3m_min_18m"]  # Estrella-Mishkin benchmark

# Publication lags (days) — a feature value at month-end d can only use
# observations actually released by d. EBP posts the 4th biz day of m+1
# (~1 month). SLOOS posts ~5 weeks after quarter start. NFCI/claims lag ~1 week.
EBP_LAG_DAYS = 31
SLOOS_LAG_DAYS = 45
WEEKLY_LAG_DAYS = 7

# Training label lags (calendar months) — at scoring month i, only use
# labels whose value was actually knowable by i given the forward horizon
# AND the realized-data publication delay.
#   CORBLACBS: 12m horizon + ~5m quarterly release lag = 17m
#   NBER     : 12m horizon + NBER's typical 12m dating lag      = 24m
TRAINING_LAG_MONTHS = {
    "corblacbs_rise_onset": 17,
    "nber_onset_12m": 24,
}

# Walk-forward and bootstrap config.
WALK_FORWARD_START = date(2000, 1, 31)
LABEL_HORIZON_DAYS = 366       # 12 months, ±
LABEL_HORIZON_TOLERANCE = 92   # a future observation must be within one quarter of d+12m
N_BOOTSTRAP = 500
BOOTSTRAP_BLOCK_MONTHS = 12
RIDGE_C = 0.5
RANDOM_SEED = 42

# =============================================================================
# CSV LOADERS
# =============================================================================

def _parse_date(s: str) -> date | None:
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _load_date_value_csv(path: Path, value_col: str) -> list[tuple[date, float]]:
    """Generic loader for the pipeline's date+value CSV schema."""
    out: list[tuple[date, float]] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            d = _parse_date(row.get("date", ""))
            if d is None:
                continue
            raw = row.get(value_col, "")
            if raw in ("", ".", None):
                continue
            try:
                out.append((d, float(raw)))
            except ValueError:
                continue
    out.sort()
    return out


def _load_ebp_csv(path: Path, column: str = "ebp") -> list[tuple[date, float]]:
    out: list[tuple[date, float]] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            d = _parse_date(row.get("date", ""))
            if d is None:
                continue
            raw = row.get(column, "")
            try:
                out.append((d, float(raw)))
            except (ValueError, TypeError):
                continue
    out.sort()
    return out


# =============================================================================
# MONTHLY ALIGNMENT HELPERS
# =============================================================================

def _month_ends(start: date, end: date) -> list[date]:
    out: list[date] = []
    y, m = start.year, start.month
    while True:
        nxt = date(y + 1, 1, 1) if m == 12 else date(y, m + 1, 1)
        me = nxt - timedelta(days=1)
        if me > end:
            break
        out.append(me)
        y, m = nxt.year, nxt.month
    return out


def _last_on_or_before(series: list[tuple[date, float]], d: date) -> float | None:
    """Value with the most recent date ≤ d (binary search)."""
    lo, hi = 0, len(series)
    while lo < hi:
        mid = (lo + hi) // 2
        if series[mid][0] <= d:
            lo = mid + 1
        else:
            hi = mid
    if lo == 0:
        return None
    return series[lo - 1][1]


def _months_between(a: date, b: date) -> int:
    return (b.year - a.year) * 12 + (b.month - a.month)


# =============================================================================
# FEATURE ENGINEERING — all applied at month-end d with publication lags.
# =============================================================================

@dataclass
class SeriesBundle:
    baa: list[tuple[date, float]]
    ebp: list[tuple[date, float]]
    drtsci_large: list[tuple[date, float]]
    drtsci_small: list[tuple[date, float]]
    nfci: list[tuple[date, float]]
    t10y3m: list[tuple[date, float]]
    icsa: list[tuple[date, float]]
    corblacbs: list[tuple[date, float]]
    usrec: list[tuple[date, float]]


def _baa_true_pctl(series: list[tuple[date, float]], d: date) -> float | None:
    """True-historical percentile of BAA10Y as of d against all observations ≤ d."""
    vals = [v for (dt, v) in series if dt <= d]
    if not vals:
        return None
    val_today = vals[-1]
    sorted_vals = sorted(vals)
    lo = bisect.bisect_left(sorted_vals, val_today)
    hi = bisect.bisect_right(sorted_vals, val_today)
    return (lo + hi) / 2 / len(sorted_vals)


def _t10y3m_min_18m(series: list[tuple[date, float]], d: date) -> float | None:
    cutoff = d - timedelta(days=int(18 * 30.44))
    window = [v for (dt, v) in series if cutoff <= dt <= d]
    return min(window) if window else None


def _claims_ratio(series: list[tuple[date, float]], d: date) -> float | None:
    four_wk = [v for (dt, v) in series if (d - timedelta(days=28)) <= dt <= d]
    one_yr = [v for (dt, v) in series if (d - timedelta(days=365)) <= dt <= d]
    if not four_wk or not one_yr:
        return None
    avg_4w = float(np.mean(four_wk))
    min_52w = min(one_yr)
    if min_52w <= 0:
        return None
    return (avg_4w / min_52w) - 1.0


def compute_features(d: date, s: SeriesBundle) -> dict[str, float | None]:
    """All candidate features at month-end d, respecting publication lags."""
    ebp_now = _last_on_or_before(s.ebp, d - timedelta(days=EBP_LAG_DAYS))
    ebp_6 = _last_on_or_before(s.ebp, d - timedelta(days=EBP_LAG_DAYS + 183))
    return {
        "ebp_level": ebp_now,
        "ebp_change_6m": None if (ebp_now is None or ebp_6 is None) else (ebp_now - ebp_6),
        "sloos_cni_large": _last_on_or_before(s.drtsci_large, d - timedelta(days=SLOOS_LAG_DAYS)),
        "t10y3m_min_18m": _t10y3m_min_18m(s.t10y3m, d),
        "nfci": _last_on_or_before(s.nfci, d - timedelta(days=WEEKLY_LAG_DAYS)),
        "claims_4w_over_52w_min": _claims_ratio(s.icsa, d - timedelta(days=WEEKLY_LAG_DAYS)),
        "baa_pctl": _baa_true_pctl(s.baa, d),
    }


# =============================================================================
# TARGETS — onset-style, with full-horizon guards.
# =============================================================================

def target_corblacbs_rise_onset(
    d: date,
    s: SeriesBundle,
    delta_pp: float = 0.25,
    horizon_days: int = LABEL_HORIZON_DAYS,
    horizon_tol_days: int = LABEL_HORIZON_TOLERANCE,
    onset: bool = True,
) -> int | None:
    """
    1 if CORBLACBS rises ≥ delta_pp over the next 12 months.
    Returns None if (a) the forward observation isn't within `horizon_tol_days`
    of d+12m (horizon not closed), or (b) in onset mode, the prior 12m already
    rose ≥ delta_pp (drop months already in a rising run).
    """
    fut = d + timedelta(days=horizon_days)
    now_val = _last_on_or_before(s.corblacbs, d)
    fut_val = _last_on_or_before(s.corblacbs, fut)
    if now_val is None or fut_val is None:
        return None
    corb_dates_leq_fut = [dt for (dt, _) in s.corblacbs if dt <= fut]
    if not corb_dates_leq_fut:
        return None
    fdate = max(corb_dates_leq_fut)
    if fdate < fut - timedelta(days=horizon_tol_days):
        return None  # horizon window not actually observed
    if onset:
        past_val = _last_on_or_before(s.corblacbs, d - timedelta(days=horizon_days))
        if past_val is not None and (now_val - past_val) >= delta_pp:
            return None  # already rising → not an onset
    return int((fut_val - now_val) >= delta_pp)


def target_nber_onset_12m(
    d: date,
    s: SeriesBundle,
    horizon_days: int = LABEL_HORIZON_DAYS,
) -> int | None:
    """
    1 if a new NBER recession starts in (d, d+12m]. Drops months already in
    a recession at d, and requires the USREC series to cover the full forward
    window (horizon closed).
    """
    now_val = _last_on_or_before(s.usrec, d)
    if now_val is None or now_val >= 0.5:
        return None
    end = d + timedelta(days=horizon_days)
    if not s.usrec or max(dt for (dt, _) in s.usrec) < end:
        return None
    window = [v for (dt, v) in s.usrec if d < dt <= end]
    if not window:
        return None
    return int(any(v >= 0.5 for v in window))


# =============================================================================
# TABLE BUILD
# =============================================================================

def build_monthly_table(s: SeriesBundle) -> tuple[list[date], np.ndarray, dict[str, np.ndarray]]:
    """
    Build the monthly design matrix over ALL candidate features and both
    target definitions. Drop rows where any candidate feature is unknown
    (so the primary, YC-only, and full-7 feature sets all draw from the
    same sample — apples-to-apples in the backtest table).
    """
    data_start = date(1990, 7, 31)
    data_end = max(dt for (dt, _) in s.ebp)

    months = _month_ends(data_start, data_end)

    cols: dict[str, list[float]] = {name: [] for name in ALL_FEATURES}
    tgt_primary: list[float] = []
    tgt_nber: list[float] = []
    kept: list[date] = []

    for d in months:
        feats = compute_features(d, s)
        if any(feats[k] is None for k in ALL_FEATURES):
            continue
        # Keep the row whenever features are observable. Labels may still be
        # NaN for recent months (12-month forward window not yet closed);
        # the walk-forward skips NaN labels for training and scoring but we
        # need these rows for the latest-snapshot prediction.
        t_primary = target_corblacbs_rise_onset(d, s)
        t_nber = target_nber_onset_12m(d, s)
        kept.append(d)
        for k in ALL_FEATURES:
            cols[k].append(feats[k])  # type: ignore[arg-type]
        tgt_primary.append(np.nan if t_primary is None else float(t_primary))
        tgt_nber.append(np.nan if t_nber is None else float(t_nber))

    X = np.column_stack([np.array(cols[k], dtype=float) for k in ALL_FEATURES])
    y = {
        PRIMARY_TARGET: np.array(tgt_primary, dtype=float),
        "nber_onset_12m": np.array(tgt_nber, dtype=float),
    }
    return kept, X, y


# =============================================================================
# WALK-FORWARD (calendar-month training-lag mask + feature subset)
# =============================================================================

def walk_forward(
    dates: list[date],
    X: np.ndarray,
    y: np.ndarray,
    lag_months: int,
    feature_idx: list[int],
    start_oos: date = WALK_FORWARD_START,
    C: float = RIDGE_C,
) -> tuple[np.ndarray, np.ndarray, list[date]]:
    Xc = X[:, feature_idx]
    preds: list[float] = []
    actuals: list[float] = []
    out_dates: list[date] = []
    for i, d in enumerate(dates):
        if d < start_oos:
            continue
        # Training mask: label was known as of month i (calendar-month lag)
        # AND the label itself is not NaN.
        train_mask = np.array(
            [_months_between(dj, d) >= lag_months for dj in dates]
        ) & ~np.isnan(y)
        if train_mask.sum() < 50:
            continue
        y_tr = y[train_mask].astype(int)
        if len(np.unique(y_tr)) < 2:
            continue
        X_tr = Xc[train_mask]
        mu = X_tr.mean(axis=0)
        sd = X_tr.std(axis=0)
        sd[sd == 0] = 1.0
        X_tr_std = (X_tr - mu) / sd
        X_i_std = (Xc[i] - mu) / sd
        clf = LogisticRegression(
            penalty="l2", C=C, solver="lbfgs", max_iter=2000, random_state=RANDOM_SEED
        )
        clf.fit(X_tr_std, y_tr)
        p = clf.predict_proba(X_i_std.reshape(1, -1))[0, 1]
        preds.append(p)
        actuals.append(y[i])
        out_dates.append(d)
    return np.array(preds), np.array(actuals), out_dates


# =============================================================================
# METRICS — onset events, max-prior-6m, false alarms, TP/FA at 2× base rate.
# =============================================================================

def _onset_indices(actuals: np.ndarray) -> list[int]:
    """Indices where a positive label starts (first 1 after a 0 or start)."""
    out: list[int] = []
    for k in range(len(actuals)):
        if actuals[k] == 1 and (k == 0 or actuals[k - 1] != 1):
            out.append(k)
    return out


def score_run(
    preds: np.ndarray,
    actuals: np.ndarray,
    out_dates: list[date],
) -> dict:
    valid = ~np.isnan(actuals)
    if valid.sum() < 2 or len(np.unique(actuals[valid].astype(int))) < 2:
        return {"auc": None, "n_oos": 0, "note": "insufficient OOS labels"}
    auc = float(roc_auc_score(actuals[valid].astype(int), preds[valid]))
    base_rate = float(actuals[valid].mean())
    threshold = float(max(0.3, 2 * base_rate))

    events_idx = _onset_indices(actuals)
    events = []
    for k in events_idx:
        prior_max = float(preds[max(0, k - 6):k + 1].max())
        events.append({
            "date": out_dates[k].isoformat()[:7],
            "p_at_onset": round(float(preds[k]), 3),
            "p_max_prior_6m": round(prior_max, 3),
        })

    # False-alarm stretches: contiguous runs of months where P >= threshold
    # AND the label is a known 0 (no onset ahead, not already in an event).
    # Months whose label is NaN (already inside a rising run, or horizon not
    # yet closed) end a run instead of extending it, so the downturns
    # themselves (2001, 2008, 2020) are never counted as false alarms.
    false_alarms: list[dict] = []
    clear_alarm = (preds >= threshold) & (actuals == 0)
    run_start = None
    for i in range(len(preds) + 1):
        on = i < len(preds) and bool(clear_alarm[i])
        if on and run_start is None:
            run_start = i
        elif not on and run_start is not None:
            run_end = i - 1
            fa = {
                "start": out_dates[run_start].isoformat()[:7],
                "end": out_dates[run_end].isoformat()[:7],
                "months": run_end - run_start + 1,
                "peak_prob": round(float(preds[run_start:run_end + 1].max()), 3),
            }
            if run_end == len(preds) - 1:
                fa["ongoing"] = True
            false_alarms.append(fa)
            run_start = None

    tp_months = int(((preds >= threshold) & (actuals == 1)).sum())
    fa_months = int(((preds >= threshold) & (actuals == 0)).sum())

    return {
        "auc": round(auc, 3),
        "n_oos": int(valid.sum()),
        "base_rate": round(base_rate, 3),
        "threshold": round(threshold, 3),
        "tp_months": tp_months,
        "fa_months": fa_months,
        "events": events,
        "false_alarms": false_alarms,
    }


# =============================================================================
# FINAL FIT + 12-MONTH BLOCK BOOTSTRAP
# =============================================================================

def fit_final(
    X: np.ndarray,
    y: np.ndarray,
    feature_idx: list[int],
    feature_names: list[str],
    C: float = RIDGE_C,
) -> dict:
    """Fit on all labeled rows for the chosen target and feature set."""
    Xc = X[:, feature_idx]
    valid = ~np.isnan(y)
    X_fit = Xc[valid]
    y_fit = y[valid].astype(int)
    mu = X_fit.mean(axis=0)
    sd = X_fit.std(axis=0)
    sd[sd == 0] = 1.0
    X_std = (X_fit - mu) / sd
    clf = LogisticRegression(
        penalty="l2", C=C, solver="lbfgs", max_iter=2000, random_state=RANDOM_SEED
    )
    clf.fit(X_std, y_fit)
    return {
        "coefficients": {
            "intercept": float(clf.intercept_[0]),
            **{name: float(c) for name, c in zip(feature_names, clf.coef_[0])},
        },
        "standardization": {
            name: {"mean": float(mu[i]), "std": float(sd[i])}
            for i, name in enumerate(feature_names)
        },
        "n_training_obs": int(valid.sum()),
        "feature_set": feature_names,
    }


def block_bootstrap_coefs(
    X: np.ndarray,
    y: np.ndarray,
    feature_idx: list[int],
    feature_names: list[str],
    standardization: dict,
    n_boot: int = N_BOOTSTRAP,
    block_size: int = BOOTSTRAP_BLOCK_MONTHS,
    C: float = RIDGE_C,
    seed: int = RANDOM_SEED,
) -> list[dict[str, float]]:
    """
    12-month block bootstrap on the labeled rows. Standardization is held
    fixed at the training-sample moments (passed in) so bootstrap coefficients
    are comparable to the final-fit coefficients.
    """
    Xc = X[:, feature_idx]
    valid = ~np.isnan(y)
    X_fit = Xc[valid]
    y_fit = y[valid].astype(int)
    mu = np.array([standardization[n]["mean"] for n in feature_names])
    sd = np.array([standardization[n]["std"] for n in feature_names])
    X_std = (X_fit - mu) / sd
    N = len(y_fit)
    rng = np.random.default_rng(seed)
    n_blocks = (N + block_size - 1) // block_size
    boot: list[dict[str, float]] = []
    # Maximum valid starting index so that start + block_size ≤ N.
    max_start = max(1, N - block_size + 1)
    for _ in range(n_boot):
        starts = rng.integers(0, max_start, size=n_blocks)
        idx = np.concatenate([np.arange(s, s + block_size) for s in starts])[:N]
        X_b, y_b = X_std[idx], y_fit[idx]
        if len(np.unique(y_b)) < 2:
            continue
        clf = LogisticRegression(penalty="l2", C=C, solver="lbfgs", max_iter=2000)
        clf.fit(X_b, y_b)
        row = {"intercept": float(clf.intercept_[0])}
        for name, c in zip(feature_names, clf.coef_[0]):
            row[name] = float(c)
        boot.append(row)
    return boot


# =============================================================================
# BENCHMARK: Fed's own est_prob column from ebp.csv — in-sample reference.
# =============================================================================

def fed_estprob_benchmark(
    dates: list[date],
    s_ebp_est: list[tuple[date, float]],
    y: np.ndarray,
    start_oos: date,
) -> dict:
    preds = np.array([
        _last_on_or_before(s_ebp_est, d - timedelta(days=EBP_LAG_DAYS))
        for d in dates
    ], dtype=float)
    mask = np.array([d >= start_oos for d in dates]) & ~np.isnan(y) & ~np.isnan(preds)
    if mask.sum() < 2 or len(np.unique(y[mask].astype(int))) < 2:
        return {"auc": None, "n": 0, "note": "insufficient overlap"}
    auc = float(roc_auc_score(y[mask].astype(int), preds[mask]))
    return {"auc": round(auc, 3), "n": int(mask.sum()), "note": "in-sample (Fed-estimated)"}


# =============================================================================
# DRIVER
# =============================================================================

def load_all(data_dir: Path) -> tuple[SeriesBundle, list[tuple[date, float]]]:
    required = {
        "baa": (data_dir / "fred_BAA10Y.csv", "BAA10Y"),
        "ebp": (data_dir / "ebp.csv", None),
        "drtsci_large": (data_dir / "fred_DRTSCILM.csv", "DRTSCILM"),
        "drtsci_small": (data_dir / "fred_DRTSCIS.csv", "DRTSCIS"),
        "nfci": (data_dir / "fred_NFCI.csv", "NFCI"),
        "t10y3m": (data_dir / "fred_T10Y3M.csv", "T10Y3M"),
        "icsa": (data_dir / "fred_ICSA.csv", "ICSA"),
        "corblacbs": (data_dir / "fred_CORBLACBS.csv", "CORBLACBS"),
        "usrec": (data_dir / "fred_USREC.csv", "USREC"),
    }
    missing = [name for name, (p, _) in required.items() if not p.exists()]
    if missing:
        print("❌ Missing CSVs: " + ", ".join(missing), file=sys.stderr)
        print(
            "   Run update-fulcrum-data.yml first (or locally:\n"
            "   python quant/scripts/fetch_fred_data.py --ts-dir ../src/data --data-dir data).",
            file=sys.stderr,
        )
        sys.exit(2)

    bundle_kwargs = {}
    for name, (p, col) in required.items():
        if name == "ebp":
            bundle_kwargs[name] = _load_ebp_csv(p, "ebp")
        else:
            bundle_kwargs[name] = _load_date_value_csv(p, col)  # type: ignore[arg-type]
    bundle = SeriesBundle(**bundle_kwargs)
    ebp_est = _load_ebp_csv(data_dir / "ebp.csv", "est_prob")
    return bundle, ebp_est


def feature_idx(names: list[str]) -> list[int]:
    return [ALL_FEATURES.index(n) for n in names]


def main() -> int:
    parser = argparse.ArgumentParser(description="Fulcrum v5 Cycle Probability model fit")
    parser.add_argument("--data-dir", default="quant/data")
    parser.add_argument("--out", default="src/data/cycleModel.json")
    parser.add_argument(
        "--start-oos",
        default=WALK_FORWARD_START.isoformat(),
        help="ISO date for walk-forward OOS start",
    )
    args = parser.parse_args()

    print("  Loading series …", flush=True)
    s, ebp_est = load_all(Path(args.data_dir))

    print("  Building monthly feature table (with publication lags) …", flush=True)
    dates, X, ys = build_monthly_table(s)
    print(f"  ✓ {len(dates)} monthly rows ({dates[0]} → {dates[-1]})", flush=True)

    start_oos = datetime.strptime(args.start_oos, "%Y-%m-%d").date()

    # Backtest grid: {target} × {feature set} → metrics.
    FEATURE_SETS = [
        ("primary (EBP + YC)", PRIMARY_FEATURES),
        ("yield_curve_only", YC_ONLY_FEATURES),
        ("full_7", ALL_FEATURES),
    ]

    print("  Walk-forward backtest …", flush=True)
    backtest: dict[str, dict] = {}
    for target_name in [PRIMARY_TARGET] + ROBUSTNESS_TARGETS:
        y = ys[target_name]
        lag = TRAINING_LAG_MONTHS[target_name]
        rows: dict[str, dict] = {}
        for set_label, feat_names in FEATURE_SETS:
            preds, actuals, out_dates = walk_forward(
                dates, X, y, lag_months=lag, feature_idx=feature_idx(feat_names), start_oos=start_oos
            )
            rows[set_label] = score_run(preds, actuals, out_dates)
            auc = rows[set_label].get("auc")
            print(f"    {target_name:28s} / {set_label:22s}  AUC={auc}  n={rows[set_label].get('n_oos')}")
        rows["fed_est_prob_in_sample"] = fed_estprob_benchmark(dates, ebp_est, y, start_oos)
        backtest[target_name] = {"train_label_lag_months": lag, "feature_sets": rows}

    # Final fit on the pre-registered primary target + primary feature set.
    print("  Fitting final model (primary target + primary features) …", flush=True)
    primary_idx = feature_idx(PRIMARY_FEATURES)
    final = fit_final(X, ys[PRIMARY_TARGET], primary_idx, PRIMARY_FEATURES)

    print(f"  Running {N_BOOTSTRAP}-draw block bootstrap (block={BOOTSTRAP_BLOCK_MONTHS}m) …", flush=True)
    boot = block_bootstrap_coefs(
        X,
        ys[PRIMARY_TARGET],
        primary_idx,
        PRIMARY_FEATURES,
        final["standardization"],
    )
    print(f"  ✓ {len(boot)} valid bootstrap fits", flush=True)

    # Latest reading — applies the same publication lags as training.
    latest_date = dates[-1]
    latest_features_full = compute_features(latest_date, s)
    # Turn into an ordered vector aligned to PRIMARY_FEATURES.
    mu = np.array([final["standardization"][n]["mean"] for n in PRIMARY_FEATURES])
    sd = np.array([final["standardization"][n]["std"] for n in PRIMARY_FEATURES])
    x_latest = np.array([latest_features_full[n] for n in PRIMARY_FEATURES], dtype=float)
    x_std = (x_latest - mu) / sd
    intercept = final["coefficients"]["intercept"]
    beta = np.array([final["coefficients"][n] for n in PRIMARY_FEATURES])
    logit = intercept + float(np.dot(beta, x_std))
    p_point = float(1.0 / (1.0 + np.exp(-logit)))

    # Bootstrap probability draws for the band.
    if boot:
        draws = []
        for row in boot:
            b = np.array([row[n] for n in PRIMARY_FEATURES])
            lg = row["intercept"] + float(np.dot(b, x_std))
            draws.append(1.0 / (1.0 + np.exp(-lg)))
        p_lo, p_hi = float(np.percentile(draws, 5)), float(np.percentile(draws, 95))
    else:
        p_lo = p_hi = None

    base_rate_primary = backtest[PRIMARY_TARGET]["feature_sets"]["primary (EBP + YC)"]["base_rate"]

    out = {
        "schema_version": 1,
        "fit_date": date.today().isoformat(),
        "primary_target": PRIMARY_TARGET,
        "robustness_targets": ROBUSTNESS_TARGETS,
        "primary_features": PRIMARY_FEATURES,
        "feature_definitions": {
            "ebp_level":              "Excess Bond Premium (Fed FEDS Note, monthly). Publication lag: 31 days.",
            "ebp_change_6m":          "6-month change in EBP (both terms publication-lagged).",
            "sloos_cni_large":        "SLOOS DRTSCILM: net % of banks tightening C&I lending standards, large & mid firms. Publication lag: 45 days.",
            "t10y3m_min_18m":         "Minimum of daily T10Y3M (10Y minus 3M) over the prior 18 months.",
            "nfci":                   "Chicago Fed NFCI. Publication lag: 7 days.",
            "claims_4w_over_52w_min": "ICSA: 4-week trailing avg / 52-week trailing minimum, minus 1. Publication lag: 7 days.",
            "baa_pctl":               "True-historical percentile of BAA10Y against all observations ≤ as-of date.",
        },
        "config": {
            "ridge_C": RIDGE_C,
            "n_bootstrap": N_BOOTSTRAP,
            "bootstrap_block_months": BOOTSTRAP_BLOCK_MONTHS,
            "walk_forward_start": start_oos.isoformat(),
            "label_horizon_days": LABEL_HORIZON_DAYS,
            "label_horizon_tol_days": LABEL_HORIZON_TOLERANCE,
            "ebp_publication_lag_days": EBP_LAG_DAYS,
            "sloos_publication_lag_days": SLOOS_LAG_DAYS,
            "weekly_publication_lag_days": WEEKLY_LAG_DAYS,
            "training_lag_months": TRAINING_LAG_MONTHS,
            "random_seed": RANDOM_SEED,
        },
        "coefficients": final["coefficients"],
        "standardization": final["standardization"],
        "bootstrap_coefficients": boot,
        "n_training_obs": final["n_training_obs"],
        "backtest": backtest,
        "latest_snapshot": {
            "date": latest_date.isoformat(),
            "features_raw": {k: (None if v is None else float(v)) for k, v in latest_features_full.items()},
            "features_primary_standardized": {n: float((latest_features_full[n] - final["standardization"][n]["mean"]) / final["standardization"][n]["std"]) for n in PRIMARY_FEATURES},
            "logit": logit,
            "probability": round(p_point, 4),
            "band_5pct": None if p_lo is None else round(p_lo, 4),
            "band_95pct": None if p_hi is None else round(p_hi, 4),
            "base_rate_primary_target": base_rate_primary,
        },
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2))
    print(f"  ✓ Wrote {out_path}", flush=True)

    # Console summary mirroring the leakcheck output for easy comparison.
    prim = backtest[PRIMARY_TARGET]["feature_sets"]["primary (EBP + YC)"]
    print(f"\n  Current reading ({latest_date}):")
    print(f"    probability: {p_point:.3f}   "
          f"band_5-95: [{p_lo:.3f}, {p_hi:.3f}]   "
          f"base rate: {base_rate_primary:.3f}")
    print(f"    AUC(OOS, primary target, primary features): {prim['auc']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
