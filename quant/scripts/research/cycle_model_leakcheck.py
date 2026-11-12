"""
cycle_model_leakcheck.py — reference implementation for the Phase 2B fixes.

Re-runs the Cycle Probability walk-forward with:
  * publication lags on features (EBP ~1 month, SLOOS ~45 days, NFCI/claims ~1 week)
  * label-availability lags in training (CORBLACBS ~17 months, NBER ~24 months)
  * a full-horizon guard on labels (no forward-filled future values)
  * onset targets (months already in the event are dropped)
  * benchmarks: yield curve only, EBP + yield curve, and the Fed's published EBP probability

Run from the repo root:  python quant/scripts/research/cycle_model_leakcheck.py
Needs numpy + scikit-learn (quant/requirements-model.txt).
"""
import sys, json, warnings
from datetime import date, timedelta
import numpy as np
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "quant" / "scripts"))
warnings.filterwarnings("ignore")
import fit_cycle_probability as F
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

s = F.load_all(ROOT / "quant" / "data")
L = F._last_on_or_before
D = lambda n: timedelta(days=n)

# ---- release lags (value must have been PUBLISHED by month-end d) ----
def feats(d):
    ebp_now = L(s.ebp, d - D(31))                     # month m published early m+1
    ebp_6 = L(s.ebp, d - D(31 + 183))
    return {
        "ebp_level": ebp_now,
        "ebp_change_6m": None if ebp_now is None or ebp_6 is None else ebp_now - ebp_6,
        "sloos_cni_large": L(s.drtsci_large, d - D(45)),  # dated qtr start, out ~5 wks later
        "t10y3m_min_18m": F._t10y3m_min_18m(s.t10y3m, d),
        "nfci": L(s.nfci, d - D(7)),
        "claims_4w_over_52w_min": F._claims_ratio(s.icsa, d - D(7)),
        "baa_pctl": F._baa_true_pctl(s.baa, d),
    }

def usrec_at(d): return L(s.usrec, d)

# ---- onset targets with full-horizon guard ----
def y_nber_onset(d):
    if usrec_at(d) is None or usrec_at(d) >= 0.5: return None   # already in recession: drop
    end = d + D(366)
    if max(dt for dt, _ in s.usrec) < end: return None          # horizon not closed
    w = [v for dt, v in s.usrec if d < dt <= end]
    return int(any(v >= 0.5 for v in w))

def y_corb(d, onset=False):
    fut = d + D(366)
    now = L(s.corblacbs, d); fv = L(s.corblacbs, fut)
    if now is None or fv is None: return None
    fdate = max(dt for dt, _ in s.corblacbs if dt <= fut)
    if fdate < fut - D(92): return None                         # horizon not closed
    if onset:
        past = L(s.corblacbs, d - D(366))
        if past is not None and now - past >= 0.25: return None # already rising: drop
    return int(fv - now >= 0.25)

TARGETS = {
    "nber_onset_12m": (y_nber_onset, 24),       # label known ~12m after horizon (NBER dating lag)
    "corblacbs_rise_025": (lambda d: y_corb(d), 17),           # Q data out ~5m after qtr start
    "corblacbs_rise_onset": (lambda d: y_corb(d, True), 17),
}

months = F._month_ends(date(1990, 7, 31), date(2026, 10, 31))
rows = []
for d in months:
    f = feats(d)
    if any(v is None for v in f.values()): continue
    rows.append((d, f))
dates = [r[0] for r in rows]
FEATS = list(rows[0][1].keys())
X = np.array([[r[1][k] for k in FEATS] for r in rows])
mi = {d: i for i, d in enumerate(dates)}

def months_between(a, b): return (b.year - a.year) * 12 + b.month - a.month

def walk(y, lag, cols, C=0.5, start=date(2000, 1, 31)):
    P, Y, Dd = [], [], []
    Xc = X[:, cols]
    for i, d in enumerate(dates):
        if d < start: continue
        tr = np.array([months_between(dj, d) >= lag for dj in dates]) & ~np.isnan(y)
        if tr.sum() < 50 or len(np.unique(y[tr])) < 2: continue
        mu, sd = Xc[tr].mean(0), Xc[tr].std(0); sd[sd == 0] = 1
        m = LogisticRegression(C=C, max_iter=2000).fit((Xc[tr] - mu) / sd, y[tr].astype(int))
        P.append(m.predict_proba(((Xc[i] - mu) / sd)[None])[0, 1]); Y.append(y[i]); Dd.append(d)
    return np.array(P), np.array(Y), Dd

def events(Y, Dd):
    """onset months: first 1 after a 0 (or after a gap)"""
    out = []
    for k in range(len(Y)):
        if Y[k] == 1 and (k == 0 or Y[k-1] != 1): out.append(k)
    return out

def report(name, P, Y, Dd):
    v = ~np.isnan(Y)
    auc = roc_auc_score(Y[v].astype(int), P[v]) if len(np.unique(Y[v])) > 1 else None
    br = Y[v].mean()
    ev = events(Y, Dd)
    evs = [(Dd[k].isoformat()[:7], round(float(P[k]), 2), round(float(P[max(0,k-6):k+1].max()), 2)) for k in ev]
    thr = max(0.3, 2 * br)
    fa = int(((P >= thr) & (Y == 0)).sum()); tp = int(((P >= thr) & (Y == 1)).sum())
    print(f"  {name:34s} AUC={auc:.3f} base={br:.2f} n={v.sum()} thr={thr:.2f} TP-months={tp} FA-months={fa}")
    print(f"      label-1 run starts (yyyy-mm, p_at_start, max p in prior 6m): {evs}")
    return auc

ALL = list(range(len(FEATS)))
YC = [FEATS.index("t10y3m_min_18m")]
EBP2 = [FEATS.index("ebp_level"), FEATS.index("t10y3m_min_18m")]
results = {}
for tname, (fn, lag) in TARGETS.items():
    y = np.array([np.nan if (t := fn(d)) is None else t for d in dates], dtype=float)
    print(f"\n=== {tname} (train-label lag {lag}m) ===")
    for lbl, cols in [("ALL 7 features", ALL), ("Yield curve only (Estrella-Mishkin)", YC), ("EBP + yield curve", EBP2)]:
        P, Y, Dd = walk(y, lag, cols)
        results[(tname, lbl)] = report(lbl, P, Y, Dd)
    # Fed's own published EBP recession probability as a benchmark (full-sample, so flattering to it)
    est = [(dt, v) for dt, v in F._load_date_value_csv(ROOT / "quant" / "data" / "ebp.csv", "est_prob")]
    Pf = np.array([L(est, d - D(31)) for d in dates]); Yf = y.copy()
    m = (np.array([d >= date(2000,1,31) for d in dates])) & ~np.isnan(Yf)
    print(f"  {'Fed EBP est_prob (in-sample!)':34s} AUC={roc_auc_score(Yf[m].astype(int), Pf[m]):.3f}")

print("\n=== current reading, EBP + yield curve, trained on all labels available today ===")
today = dates[-1]
for tname, (fn, lag) in TARGETS.items():
    y = np.array([np.nan if (t := fn(d)) is None else t for d in dates], dtype=float)
    tr = ~np.isnan(y)
    Xc = X[:, EBP2]; mu, sd = Xc[tr].mean(0), Xc[tr].std(0)
    m = LogisticRegression(C=0.5, max_iter=2000).fit((Xc[tr]-mu)/sd, y[tr].astype(int))
    p = m.predict_proba(((Xc[-1]-mu)/sd)[None])[0,1]
    print(f"  {tname:24s} as of {today}: p={p:.2f}  base rate={y[tr].mean():.2f}  coefs={dict(zip(['ebp','yc_min18'], m.coef_[0].round(2)))}")
print("  latest features:", {k: round(v,3) for k, v in zip(FEATS, X[-1])})
