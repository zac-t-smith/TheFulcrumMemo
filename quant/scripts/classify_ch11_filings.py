"""
classify_ch11_filings.py — Fulcrum v5 Phase 4 (v3 label-set enrichment)
========================================================================

Enriches ch11_filings.csv with two columns:

  - chapter:                 'chapter_11', 'chapter_15', 'chapter_7',
                             'receivership', or 'unknown'
  - registrant_is_debtor:    True if the registrant itself is the
                             bankrupt entity; False if the 8-K describes
                             a subsidiary's petition (common for parent
                             holdcos: NRG/GenOn, LendingTree, AT&T's
                             obscure subs, etc.)

Classification: fetches each 8-K's full-submission `.txt` file from
EDGAR (one request per filing), scans the first ~200KB for chapter
keywords and a subsidiary pattern. Rate: 5 requests/sec (under SEC's
10/sec cap). About 700 case-start filings — total ~2-3 minutes.

Chapter rule:
  - 'chapter_11' wins if present.
  - Else 'chapter_15'.
  - Else 'chapter_7'.
  - Else 'receivership' if keyword present.
  - Else 'unknown'.

Registrant-is-debtor rule:
  - Find the first match of 'voluntary petition' or 'petition for relief'.
  - In the ~600 chars before the match, if 'wholly-owned subsidiary'
    (or variants) appears, registrant_is_debtor = False. The subsidiary
    was the debtor; the registrant is a parent holdco.
  - Else True.

The heuristic is conservative — when it can't tell, it labels the
registrant as debtor so we don't lose real signals. Known edge cases
to monitor via spot-check:
  - Chapter 15 / foreign proceedings where parent is the registrant.
  - Multi-entity petitions where the registrant is the holding company
    filing jointly with subsidiaries.

Run:
    export SEC_USER_AGENT="Your Name your.email@example.com"
    python quant/scripts/classify_ch11_filings.py \\
        --in quant/research/ch11_filings.csv \\
        --out quant/research/ch11_filings_classified.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

INTER_REQ_SLEEP = 0.2
MAX_BYTES = 200_000  # read window; 8-K bodies with Item 1.03 fit easily
SUBSIDIARY_PATTERN = re.compile(
    r"wholly[- ]owned\s+(?:direct|indirect\s+)?subsidiary|"
    r"wholly[- ]owned\s+and\s+indirectly\s+held\s+subsidiary|"
    r"indirectly[- ]owned\s+subsidiary",
    re.IGNORECASE,
)
PETITION_PATTERN = re.compile(
    r"\bvoluntary\s+petition|\bpetition\s+for\s+relief|"
    r"\bfiled\s+for\s+bankruptcy|\bfiled\s+a\s+voluntary",
    re.IGNORECASE,
)


def _resolve_ua() -> str:
    ua = os.environ.get("SEC_USER_AGENT", "").strip()
    if not ua:
        raise RuntimeError("SEC_USER_AGENT env var required")
    return ua


def fetch_filing_text(cik: str, accession: str, ua: str) -> str | None:
    """
    Fetch up to MAX_BYTES of the filing's `.txt` submission file. Returns
    None on HTTP failure. The .txt submission contains SGML wrappers plus
    every document in the filing concatenated — plenty of context for a
    keyword scan.
    """
    cik_no_zeros = cik.lstrip("0") or "0"
    accession_no_dashes = accession.replace("-", "")
    url = (
        f"https://www.sec.gov/Archives/edgar/data/{cik_no_zeros}/"
        f"{accession_no_dashes}/{accession}.txt"
    )
    last_err: Exception | None = None
    for attempt in range(2):
        try:
            req = Request(url, headers={"User-Agent": ua, "Accept-Encoding": "identity"})
            with urlopen(req, timeout=30) as resp:
                return resp.read(MAX_BYTES).decode("utf-8", errors="replace")
        except (HTTPError, URLError, TimeoutError) as e:
            last_err = e
            if attempt == 0:
                time.sleep(1.0)
    return None


def classify(text: str, registrant_name: str) -> tuple[str, bool]:
    """Return (chapter, registrant_is_debtor) from an 8-K body excerpt."""
    lower = text.lower()

    # Chapter — strict priority Chapter 11 > 15 > 7 > receivership.
    if "chapter 11" in lower:
        chapter = "chapter_11"
    elif "chapter 15" in lower:
        chapter = "chapter_15"
    elif "chapter 7" in lower:
        chapter = "chapter_7"
    elif "receivership" in lower or "receiver has been appointed" in lower:
        chapter = "receivership"
    else:
        chapter = "unknown"

    # Registrant-is-debtor: default True; flip to False when a subsidiary
    # is named in the pre-petition context window.
    registrant_is_debtor = True
    m = PETITION_PATTERN.search(lower)
    if m:
        before = lower[max(0, m.start() - 600):m.start()]
        if SUBSIDIARY_PATTERN.search(before):
            registrant_is_debtor = False
    return chapter, registrant_is_debtor


def main() -> int:
    parser = argparse.ArgumentParser(description="Classify Ch11 filings by chapter + registrant-is-debtor")
    parser.add_argument("--in", dest="input", required=True,
                        help="Input CSV (ch11_filings.csv shape).")
    parser.add_argument("--out", required=True, help="Output CSV with added columns.")
    parser.add_argument("--summary-out", help="Optional JSON summary.")
    parser.add_argument("--limit", type=int, default=0, help="Process at most N rows (debug).")
    args = parser.parse_args()

    try:
        ua = _resolve_ua()
    except RuntimeError as e:
        print(f"❌ {e}", file=sys.stderr)
        return 2

    in_path = Path(args.input)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with in_path.open(newline="", encoding="utf-8") as f_in:
        reader = csv.DictReader(f_in)
        rows = list(reader)
        in_fields = list(reader.fieldnames or [])

    out_fields = in_fields + ["chapter", "registrant_is_debtor"]
    counts = {
        "chapter_11": 0, "chapter_15": 0, "chapter_7": 0,
        "receivership": 0, "unknown": 0,
        "registrant_debtor_true": 0, "registrant_debtor_false": 0,
        "fetch_errors": 0,
    }

    with out_path.open("w", newline="", encoding="utf-8") as f_out:
        writer = csv.DictWriter(f_out, fieldnames=out_fields)
        writer.writeheader()

        for i, row in enumerate(rows):
            if args.limit and i >= args.limit:
                break
            text = fetch_filing_text(row["cik"], row["accession"], ua)
            if text is None:
                counts["fetch_errors"] += 1
                row["chapter"] = "unknown"
                row["registrant_is_debtor"] = "True"  # conservative
            else:
                chapter, is_debtor = classify(text, row.get("name", ""))
                row["chapter"] = chapter
                row["registrant_is_debtor"] = str(is_debtor)
                counts[chapter] = counts.get(chapter, 0) + 1
                key = "registrant_debtor_true" if is_debtor else "registrant_debtor_false"
                counts[key] += 1
            writer.writerow(row)
            time.sleep(INTER_REQ_SLEEP)
            if (i + 1) % 100 == 0:
                print(
                    f"  {i + 1}/{len(rows)}: 11={counts['chapter_11']} "
                    f"15={counts['chapter_15']} 7={counts['chapter_7']} "
                    f"rec={counts['receivership']} unk={counts['unknown']} "
                    f"subs={counts['registrant_debtor_false']}",
                    flush=True,
                )

    print(f"\n  Done. Counts: {json.dumps(counts, indent=2)}")
    if args.summary_out:
        Path(args.summary_out).write_text(json.dumps({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "input_rows": len(rows),
            "counts": counts,
            "output_path": str(out_path),
        }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
