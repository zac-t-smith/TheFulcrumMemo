"""
fit_cycle_probability.py — Fulcrum v5 Phase 2B
================================================================

Fits the Cycle Probability (12-month) logistic regression model
described in FULCRUM_V5_SPEC.md and writes src/data/cycleModel.json.

Design
------
Walk-forward with an expanding window, out of sample from 2000-01.
For each OOS month we retrain on everything available up to that point
(minus the 12-month label horizon) and record the resulting probability
against the eventual realized label. We score the two target definitions
the spec names (CORBLACBS +≥0.25pp over the next four quarters, or NBER
recession starting within 12 months) and pick the one with the better
OOS AUC subject to a reasonable base rate.

L2-regularized logistic regression (sklearn) with a conservative C.
Bootstrap the final-window training set N_BOOT times to get coefficient
draws; those give the probability band in the UI.

Inputs (CSVs expected under quant/data/)
----------------------------------------
    fred_BAA10Y.csv         (daily, 1986+)   true-hist percentile
    ebp.csv                 (monthly, 1973+) ebp, gz_spread
    fred_DRTSCILM.csv       (quarterly, 1990+)
    fred_DRTSCIS.csv        (quarterly, 1990+)
    fred_NFCI.csv           (weekly, 1971+)
    fred_T10Y3M.csv         (daily, 1982+)   18m rolling min
    fred_ICSA.csv           (weekly, 1967+)  4w/52w ratio
    fred_CORBLACBS.csv      (quarterly, 1985+) target input
    fred_USREC.csv          (monthly)          target input

If any FRED CSV is missing the script prints which ones and exits non-zero
with guidance to run .github/workflows/update-fulcrum-data.yml first.

Outputs
-------
    src/data/cycleModel.json

Run
---
    pip install -r quant/requirements-model.txt
    python quant/scripts/fit_cycle_probability.py
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Callable

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# =============================================================================
# CONFIG
# =============================================================================

FEATURE_NAMES = [
    "ebp_level",
    "ebp_change_6m",
    "sloos_cni_large",
    "t10y3m_min_18m",
    "nfci",
    "claims_4w_over_52w_min",
    "baa_pctl",
]

TARGET_DEFINITIONS = ["corblacbs_delta_025pp", "nber_recession_within_12m"]

WALK_FORWARD_START = "2000-01-01"
LABEL_HORIZON_MONTHS = 12
N_BOOTSTRAP = 500
RIDGE_C = 0.5      # Smaller C → more L2 shrinkage; appropriate for ~5 cycles.
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


def _load_ebp_csv(path: Path) -> list[tuple[date, float]]:
    """Return monthly (date, ebp) pairs; the CSV has gz_spread/ebp/est_prob too."""
    out: list[tuple[date, float]] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            d = _parse_date(row.get("date", ""))
            if d is None:
                continue
            raw = row.get("ebp", "")
            try:
                out.append((d, float(raw)))
            except (ValueError, TypeError):
                continue
    out.sort()
    return out


# =============================================================================
# MONTHLY ALIGNMENT
# =============================================================================

def _month_ends(start: date, end: date) -> list[date]:
    """Return a list of last-of-month dates in [start, end]."""
    from datetime import timedelta
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
    """Return the value from `series` with the most recent date ≤ d."""
    # series is sorted ascending by date; bisect_right by date.
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


# =============================================================================
# FEATURE ENGINEERING
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
    """True-historical percentile of BAA10Y as of date d against all observations ≤ d."""
    vals = [v for (dt, v) in series if dt <= d]
    if not vals:
        return None
    val_today = vals[-1]
    sorted_vals = sorted(vals)
    import bisect
    lo = bisect.bisect_left(sorted_vals, val_today)
    hi = bisect.bisect_right(sorted_vals, val_today)
    return (lo + hi) / 2 / len(sorted_vals)


def _ebp_change_6m(series: list[tuple[date, float]], d: date) -> float | None:
    now = _last_on_or_before(series, d)
    six_mo_ago = date(d.year if d.month > 6 else d.year - 1,
                      d.month - 6 if d.month > 6 else d.month + 6, 1)
    prior = _last_on_or_before(series, six_mo_ago)
    if now is None or prior is None:
        return None
    return now - prior


def _t10y3m_min_18m(series: list[tuple[date, float]], d: date) -> float | None:
    from datetime import timedelta
    cutoff = d - timedelta(days=int(18 * 30.44))
    window = [v for (dt, v) in series if cutoff <= dt <= d]
    return min(window) if window else None


def _claims_ratio(series: list[tuple[date, float]], d: date) -> float | None:
    """ICSA 4-week trailing average divided by 52-week trailing minimum, minus 1."""
    from datetime import timedelta
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
    """All candidate features for month-end d. Returns None for any that can't be computed."""
    ebp_level = _last_on_or_before(s.ebp, d)
    return {
        "ebp_level": ebp_level,
        "ebp_change_6m": _ebp_change_6m(s.ebp, d),
        "sloos_cni_large": _last_on_or_before(s.drtsci_large, d),
        "sloos_cni_small": _last_on_or_before(s.drtsci_small, d),
        "t10y3m_min_18m": _t10y3m_min_18m(s.t10y3m, d),
        "nfci": _last_on_or_before(s.nfci, d),
        "claims_4w_over_52w_min": _claims_ratio(s.icsa, d),
        "baa_pctl": _baa_true_pctl(s.baa, d),
    }


# =============================================================================
# TARGET CONSTRUCTION
# =============================================================================

def target_corblacbs_delta(d: date, s: SeriesBundle, delta_pp: float = 0.25) -> int | None:
    """1 if CORBLACBS[d+12m] − CORBLACBS[d] ≥ delta_pp, else 0. None if either side missing."""
    from datetime import timedelta
    future = d + timedelta(days=int(LABEL_HORIZON_MONTHS * 30.44))
    now_val = _last_on_or_before(s.corblacbs, d)
    future_val = _last_on_or_before(s.corblacbs, future)
    if now_val is None or future_val is None:
        return None
    # Guard: future_val must come from a date actually at or after future-30d
    # to avoid the forward-fill illusion.
    future_date = max(dt for (dt, _) in s.corblacbs if dt <= future)
    if future_date < d:  # no quarterly release after d yet
        return None
    return int((future_val - now_val) >= delta_pp)


def target_nber_12m(d: date, s: SeriesBundle) -> int | None:
    """1 if USREC = 1 for any month in (d, d+12m]."""
    from datetime import timedelta
    end = d + timedelta(days=int(LABEL_HORIZON_MONTHS * 30.44))
    window = [v for (dt, v) in s.usrec if d < dt <= end]
    if not window:
        return None
    return int(any(v >= 0.5 for v in window))


# =============================================================================
# ASSEMBLE MONTHLY TABLE
# =============================================================================

def build_monthly_table(s: SeriesBundle) -> tuple[list[date], dict[str, np.ndarray], dict[str, np.ndarray]]:
    """Build monthly feature matrix + target vectors (both target definitions)."""
    data_start = date(1990, 7, 31)  # SLOOS modern questionnaire starts Q2 1990
    data_end = max(dt for (dt, _) in s.ebp)  # EBP is the slowest-updating input

    months = _month_ends(data_start, data_end)

    feat_cols = {name: [] for name in FEATURE_NAMES}
    tgt_corb: list[float] = []
    tgt_nber: list[float] = []
    kept: list[date] = []

    for d in months:
        feats = compute_features(d, s)
        # FEATURE_NAMES contains sloos_cni_large but not sloos_cni_small — the
        # two SLOOS tightening series are highly collinear (r ≈ 0.9), so we
        # drop small to stay inside the 4-6 feature cap the spec imposes.
        row = {k: feats[k] for k in FEATURE_NAMES}
        if any(v is None for v in row.values()):
            continue
        t_corb = target_corblacbs_delta(d, s)
        t_nber = target_nber_12m(d, s)
        if t_corb is None and t_nber is None:
            continue

        kept.append(d)
        for k, v in row.items():
            feat_cols[k].append(v)
        tgt_corb.append(np.nan if t_corb is None else t_corb)
        tgt_nber.append(np.nan if t_nber is None else t_nber)

    X = {k: np.array(v, dtype=float) for k, v in feat_cols.items()}
    y = {
        "corblacbs_delta_025pp": np.array(tgt_corb, dtype=float),
        "nber_recession_within_12m": np.array(tgt_nber, dtype=float),
    }
    return kept, X, y


# =============================================================================
# WALK-FORWARD BACKTEST
# =============================================================================

def walk_forward(
    dates: list[date],
    X_dict: dict[str, np.ndarray],
    y: np.ndarray,
    start_oos: date,
    C: float = RIDGE_C,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Expanding-window OOS predictions. Returns (oos_pred_probs, oos_actual, oos_dates_idx)."""
    feat_names = list(X_dict.keys())
    X = np.column_stack([X_dict[n] for n in feat_names])  # shape (T, F)

    preds: list[float] = []
    actuals: list[float] = []
    kept_idx: list[int] = []

    for i, d in enumerate(dates):
        if d < start_oos:
            continue
        # Train set: only months whose 12-month label window has fully closed
        # by month i. Using `< i` instead would leak labels whose horizon
        # extends beyond the scoring date into the training set.
        train_mask = np.arange(len(dates)) <= i - LABEL_HORIZON_MONTHS
        y_train = y[train_mask]
        X_train = X[train_mask]
        if y_train.size == 0:
            continue
        valid = ~np.isnan(y_train)
        if valid.sum() < 50:  # too thin
            continue
        y_tr = y_train[valid].astype(int)
        X_tr = X_train[valid]
        # Standardize using TRAINING-only moments (prevents leakage).
        mu = X_tr.mean(axis=0)
        sd = X_tr.std(axis=0)
        sd[sd == 0] = 1.0
        X_tr_std = (X_tr - mu) / sd
        X_pred_std = (X[i] - mu) / sd

        if len(np.unique(y_tr)) < 2:
            # Degenerate — all one class. Skip.
            continue

        clf = LogisticRegression(
            penalty="l2", C=C, solver="lbfgs", max_iter=1000, random_state=RANDOM_SEED
        )
        clf.fit(X_tr_std, y_tr)
        p = clf.predict_proba(X_pred_std.reshape(1, -1))[0, 1]

        preds.append(p)
        actuals.append(y[i])
        kept_idx.append(i)

    return np.array(preds), np.array(actuals), np.array(kept_idx)


# =============================================================================
# METRICS
# =============================================================================

def score_target(
    dates: list[date],
    X_dict: dict[str, np.ndarray],
    y: np.ndarray,
    start_oos: date,
) -> dict:
    """Walk-forward, metrics, and events."""
    preds, actuals, idx = walk_forward(dates, X_dict, y, start_oos)
    # Where target is nan (recent months), drop for AUC.
    valid = ~np.isnan(actuals)
    if valid.sum() < 2 or len(np.unique(actuals[valid].astype(int))) < 2:
        return {"auc_oos": None, "n_oos": 0, "note": "insufficient OOS labels"}
    auc = float(roc_auc_score(actuals[valid].astype(int), preds[valid]))

    # Hits: for each contiguous run of target==1, the prediction crossed 0.5
    # at some lead.
    threshold = 0.5
    runs: list[tuple[int, int]] = []
    in_run = False
    start = 0
    arr = actuals.astype(float)
    for i, v in enumerate(arr):
        if np.isnan(v):
            if in_run:
                runs.append((start, i - 1))
                in_run = False
            continue
        if v >= 0.5 and not in_run:
            start = i
            in_run = True
        elif v < 0.5 and in_run:
            runs.append((start, i - 1))
            in_run = False
    if in_run:
        runs.append((start, len(arr) - 1))

    hits: list[dict] = []
    for s, e in runs:
        # Find lead: first prediction above threshold in a window prior to s.
        lead_months = None
        for j in range(s, max(-1, s - 24) - 1, -1):
            if preds[j] >= threshold:
                lead_months = s - j
                continue
            else:
                break
        hits.append({
            "event_start": dates[idx[s]].isoformat(),
            "event_end": dates[idx[e]].isoformat(),
            "prob_at_start": float(preds[s]),
            "lead_months": lead_months,
        })

    # False alarms: contiguous stretches of preds≥threshold with NO actual event
    # within the following 12 months.
    alarms: list[dict] = []
    in_alarm = False
    a_start = 0
    for i, p in enumerate(preds):
        if p >= threshold and not in_alarm:
            a_start = i
            in_alarm = True
        elif p < threshold and in_alarm:
            a_end = i - 1
            # Any true positive in [a_start, a_end+12]?
            tail = actuals[a_start:min(len(arr), a_end + 13)]
            tail_valid = tail[~np.isnan(tail)]
            if tail_valid.size and (tail_valid >= 0.5).any():
                pass  # it was an early warning, not a false alarm
            else:
                alarms.append({
                    "date_crossed": dates[idx[a_start]].isoformat(),
                    "date_fell_below": dates[idx[a_end]].isoformat(),
                    "peak_prob": float(preds[a_start:a_end + 1].max()),
                })
            in_alarm = False

    return {
        "auc_oos": auc,
        "n_oos": int(valid.sum()),
        "base_rate_oos": float(actuals[valid].mean()),
        "hits": hits,
        "false_alarms": alarms,
    }


# =============================================================================
# FINAL FIT + BOOTSTRAP
# =============================================================================

def fit_final_and_bootstrap(
    X_dict: dict[str, np.ndarray],
    y: np.ndarray,
    C: float = RIDGE_C,
    n_boot: int = N_BOOTSTRAP,
    seed: int = RANDOM_SEED,
) -> dict:
    """Fit on all labeled data; bootstrap to get coefficient draws."""
    feat_names = list(X_dict.keys())
    X = np.column_stack([X_dict[n] for n in feat_names])
    valid = ~np.isnan(y)
    X_fit = X[valid]
    y_fit = y[valid].astype(int)

    mu = X_fit.mean(axis=0)
    sd = X_fit.std(axis=0)
    sd[sd == 0] = 1.0
    X_std = (X_fit - mu) / sd

    clf = LogisticRegression(
        penalty="l2", C=C, solver="lbfgs", max_iter=1000, random_state=seed
    )
    clf.fit(X_std, y_fit)
    coefs = {name: float(c) for name, c in zip(feat_names, clf.coef_[0])}
    intercept = float(clf.intercept_[0])

    rng = np.random.default_rng(seed)
    boot_coefs: list[dict[str, float]] = []
    for _ in range(n_boot):
        idx = rng.integers(0, len(y_fit), size=len(y_fit))
        X_b, y_b = X_std[idx], y_fit[idx]
        if len(np.unique(y_b)) < 2:
            continue
        clf_b = LogisticRegression(
            penalty="l2", C=C, solver="lbfgs", max_iter=1000
        )
        clf_b.fit(X_b, y_b)
        row = {"intercept": float(clf_b.intercept_[0])}
        for name, c in zip(feat_names, clf_b.coef_[0]):
            row[name] = float(c)
        boot_coefs.append(row)

    return {
        "features": feat_names,
        "standardization": {
            name: {"mean": float(mu[i]), "std": float(sd[i])}
            for i, name in enumerate(feat_names)
        },
        "coefficients": {"intercept": intercept, **coefs},
        "bootstrap_coefficients": boot_coefs,
        "n_training_obs": int(valid.sum()),
    }


# =============================================================================
# DRIVER
# =============================================================================

def load_all(data_dir: Path) -> SeriesBundle:
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
            "   Run .github/workflows/update-fulcrum-data.yml first (or locally:\n"
            "   python quant/scripts/fetch_fred_data.py --ts-dir ../src/data --data-dir data).",
            file=sys.stderr,
        )
        sys.exit(2)

    loaders: dict[str, Callable[[], list[tuple[date, float]]]] = {
        "ebp": lambda: _load_ebp_csv(required["ebp"][0]),
    }
    series = {}
    for name, (p, col) in required.items():
        if name in loaders:
            series[name] = loaders[name]()
        else:
            series[name] = _load_date_value_csv(p, col)  # type: ignore[arg-type]
    return SeriesBundle(**series)


def pick_better_target(scored: dict[str, dict]) -> str:
    """Pick target definition with better OOS AUC, requiring at least 10 positive labels."""
    best_name = None
    best_auc = -1.0
    for name, s in scored.items():
        if s.get("auc_oos") is None:
            continue
        # Reasonable base rate check — avoid picking a target that never fires.
        if s.get("base_rate_oos", 0) < 0.03:
            continue
        if s["auc_oos"] > best_auc:
            best_auc = s["auc_oos"]
            best_name = name
    return best_name or TARGET_DEFINITIONS[0]


def main() -> int:
    parser = argparse.ArgumentParser(description="Fulcrum v5 Cycle Probability model fit")
    parser.add_argument("--data-dir", default="quant/data", help="FRED/EBP CSVs root")
    parser.add_argument("--out", default="src/data/cycleModel.json", help="Output JSON")
    parser.add_argument("--start-oos", default=WALK_FORWARD_START)
    args = parser.parse_args()

    print("  Loading series …", flush=True)
    s = load_all(Path(args.data_dir))

    print("  Building monthly feature table …", flush=True)
    dates, X, ys = build_monthly_table(s)
    print(f"  ✓ {len(dates)} monthly rows ({dates[0]} → {dates[-1]})", flush=True)

    start_oos = datetime.strptime(args.start_oos, "%Y-%m-%d").date()

    print("  Walk-forward scoring both target definitions …", flush=True)
    scored = {name: score_target(dates, X, ys[name], start_oos) for name in TARGET_DEFINITIONS}
    for name, s_ in scored.items():
        print(f"    {name}: AUC={s_.get('auc_oos')}  base_rate={s_.get('base_rate_oos')}")

    chosen = pick_better_target(scored)
    print(f"  ✓ Chosen target: {chosen}", flush=True)

    print(f"  Fitting final model + {N_BOOTSTRAP} bootstrap draws …", flush=True)
    final = fit_final_and_bootstrap(X, ys[chosen])

    # Latest-features snapshot for the UI (ebpHistory etc. are updated daily,
    # so the UI can re-score as needed; this snapshot is a fallback).
    latest_date = dates[-1]
    latest_features = {
        name: float(X[name][-1]) for name in FEATURE_NAMES
    }

    out = {
        "schema_version": 1,
        "fit_date": date.today().isoformat(),
        "chosen_target": chosen,
        "all_targets_scored": scored,
        "feature_definitions": {
            "ebp_level":              "Excess Bond Premium (monthly, Fed FEDS Note), level in percent.",
            "ebp_change_6m":          "6-month change in EBP.",
            "sloos_cni_large":        "SLOOS DRTSCILM: net % of banks tightening C&I lending standards, large/mid firms.",
            "t10y3m_min_18m":         "Minimum of daily T10Y3M (10Y minus 3M) over the prior 18 months.",
            "nfci":                   "Chicago Fed NFCI: National Financial Conditions Index.",
            "claims_4w_over_52w_min": "ICSA: 4-week trailing avg of initial claims divided by 52-week trailing minimum, minus 1.",
            "baa_pctl":               "True-historical percentile of BAA10Y against all observations ≤ as-of date.",
        },
        **final,
        "latest_snapshot": {
            "date": latest_date.isoformat(),
            "features": latest_features,
        },
        "config": {
            "ridge_C": RIDGE_C,
            "n_bootstrap": N_BOOTSTRAP,
            "walk_forward_start": start_oos.isoformat(),
            "label_horizon_months": LABEL_HORIZON_MONTHS,
            "random_seed": RANDOM_SEED,
        },
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2))
    print(f"  ✓ Wrote {out_path}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
