"""
fetch_ch11_filings.py — Fulcrum v5 Phase 4 (Chapter 11 label set)
================================================================

Builds the Chapter 11 label set the Distress Radar backtest needs.
Queries EDGAR's full-text search API for 8-K filings tagged with Item
1.03 ("Bankruptcy or Receivership") between a start and end date and
writes a tidy CSV of (cik, name, filing_date, accession, filing_url).

A row's accession may land on a form that is actually an amendment or
a withdrawal. We keep every tagged filing anyway; the backtest side
may want to dedupe by CIK + first filing in a window, but that's a
downstream decision. The job here is a complete, uncurated label list.

Compliance:
  - User-Agent read from SEC_USER_AGENT env var (SEC fair-access policy).
  - Rate limit: 200 ms between page requests, well under SEC's 10 req/s.

Run locally:
    export SEC_USER_AGENT="Your Name your.email@example.com"
    python quant/scripts/fetch_ch11_filings.py \\
        --start 2015-01-01 --end 2026-12-31 \\
        --out quant/research/ch11_filings.csv

Run in CI: see .github/workflows/update-distress-radar.yml (TBD).
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

SEARCH_URL = "https://efts.sec.gov/LATEST/search-index"
PAGE_SIZE = 100          # max page size supported by the endpoint
INTER_REQ_SLEEP = 0.2    # seconds between requests (~5 req/s, under SEC cap)
WINDOW_DAYS = 90         # chunk the date range so page count stays modest


@dataclass(frozen=True)
class FilingRow:
    cik: str
    name: str
    filing_date: str      # YYYY-MM-DD
    accession: str        # dashed form, e.g., 0001493152-24-000337
    items: str            # comma-separated list as reported by EDGAR
    filing_url: str


def _resolve_user_agent() -> str:
    ua = os.environ.get("SEC_USER_AGENT", "").strip()
    if not ua:
        raise RuntimeError(
            "SEC_USER_AGENT env var is required. Format: "
            '"Your Name your.email@example.com".'
        )
    return ua


def _filing_url(cik: str, accession: str) -> str:
    """Build the canonical EDGAR filing-index URL for a given CIK + accession."""
    cik_no_zeros = cik.lstrip("0") or "0"
    accession_no_dashes = accession.replace("-", "")
    return (
        f"https://www.sec.gov/Archives/edgar/data/{cik_no_zeros}/"
        f"{accession_no_dashes}/{accession}-index.htm"
    )


def _normalize_name(display_names: list[str] | str | None) -> str:
    if isinstance(display_names, list):
        if not display_names:
            return ""
        return display_names[0]
    return display_names or ""


def _fetch_page(ua: str, params: dict) -> dict:
    """One page of the EDGAR full-text search API with simple retry."""
    url = f"{SEARCH_URL}?{urlencode(params)}"
    last_err: Exception | None = None
    for attempt in range(3):
        try:
            req = Request(url, headers={"User-Agent": ua, "Accept": "application/json"})
            with urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError) as e:
            last_err = e
            if attempt < 2:
                time.sleep(1 + attempt * 2)
    raise RuntimeError(f"EDGAR search failed after retries: {last_err}")


def _chunks(start: date, end: date, days: int):
    """Yield (chunk_start, chunk_end) covering [start, end] in `days`-day windows."""
    cur = start
    while cur <= end:
        chunk_end = min(cur + timedelta(days=days - 1), end)
        yield cur, chunk_end
        cur = chunk_end + timedelta(days=1)


def fetch_item_103(ua: str, start: date, end: date) -> list[FilingRow]:
    """Fetch all 8-K filings tagged Item 1.03 between start and end."""
    out: dict[tuple[str, str], FilingRow] = {}  # dedupe by (cik, accession)
    for ws, we in _chunks(start, end, WINDOW_DAYS):
        print(f"  querying {ws} → {we} …", flush=True)
        offset = 0
        while True:
            params = {
                "q": '"Item 1.03"',
                "forms": "8-K",
                "dateRange": "custom",
                "startdt": ws.isoformat(),
                "enddt": we.isoformat(),
                "from": offset,
                "size": PAGE_SIZE,
            }
            payload = _fetch_page(ua, params)
            hits = payload.get("hits", {})
            total = hits.get("total", {}).get("value", 0)
            rows = hits.get("hits", [])
            if not rows:
                break

            for h in rows:
                src = h.get("_source", {}) or {}
                raw_items = src.get("items")
                # EDGAR sometimes returns items as a comma-string, sometimes
                # as a list. Normalize to a set either way.
                if isinstance(raw_items, list):
                    item_tokens = [str(t).strip() for t in raw_items]
                    items = ", ".join(item_tokens)
                else:
                    items = (raw_items or "").strip()
                    item_tokens = [t.strip() for t in items.split(",") if t.strip()]
                item_set = {t for t in item_tokens if t}
                # Guard: confirm 1.03 is actually among the tagged items;
                # a bare "1.03" string match would pick up some 1.01, 1.02 etc.
                if "1.03" not in item_set:
                    continue
                cik_list = src.get("ciks") or []
                if not cik_list:
                    continue
                cik = str(cik_list[0]).zfill(10)
                accession = src.get("adsh", "")
                if not accession:
                    continue
                name = _normalize_name(src.get("display_names"))
                filing_date = src.get("file_date", "")
                row = FilingRow(
                    cik=cik,
                    name=name,
                    filing_date=filing_date,
                    accession=accession,
                    items=items,
                    filing_url=_filing_url(cik, accession),
                )
                out[(cik, accession)] = row

            offset += len(rows)
            time.sleep(INTER_REQ_SLEEP)
            if offset >= total:
                break

    rows = sorted(out.values(), key=lambda r: (r.filing_date, r.cik))
    return rows


def main() -> int:
    parser = argparse.ArgumentParser(description="EDGAR Item 1.03 label set fetcher")
    parser.add_argument("--start", default="2015-01-01", help="YYYY-MM-DD")
    parser.add_argument("--end", default=date.today().isoformat(), help="YYYY-MM-DD")
    parser.add_argument("--out", default="quant/research/ch11_filings.csv")
    parser.add_argument("--summary-out")
    args = parser.parse_args()

    try:
        ua = _resolve_user_agent()
    except RuntimeError as e:
        print(f"❌ {e}", file=sys.stderr)
        return 2

    start = datetime.strptime(args.start, "%Y-%m-%d").date()
    end = datetime.strptime(args.end, "%Y-%m-%d").date()
    if end < start:
        print("❌ end must be on or after start", file=sys.stderr)
        return 2

    print(f"  Fetching 8-K Item 1.03 filings, {start} → {end} …", flush=True)
    rows = fetch_item_103(ua, start, end)
    print(f"  ✓ {len(rows)} filings found", flush=True)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["cik", "name", "filing_date", "accession", "items", "filing_url"])
        for r in rows:
            w.writerow([r.cik, r.name, r.filing_date, r.accession, r.items, r.filing_url])
    print(f"  ✓ Wrote {out_path}")

    if args.summary_out:
        by_year: dict[int, int] = {}
        for r in rows:
            try:
                by_year[int(r.filing_date[:4])] = by_year.get(int(r.filing_date[:4]), 0) + 1
            except ValueError:
                continue
        summary = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "start": start.isoformat(),
            "end": end.isoformat(),
            "total_filings": len(rows),
            "by_year": {str(k): v for k, v in sorted(by_year.items())},
            "output_path": str(out_path),
        }
        Path(args.summary_out).write_text(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
