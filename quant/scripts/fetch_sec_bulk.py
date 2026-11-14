"""
fetch_sec_bulk.py — Fulcrum v5 Phase 4 (SEC bulk-data fetcher)
================================================================

Downloads the two SEC EDGAR bulk zips the Distress Radar backtest
needs:

  - companyfacts.zip  : all XBRL companyfacts JSON, one per CIK
                        (~1-3 GB, recompiled nightly)
  - submissions.zip   : filings history and SIC codes for every CIK
                        (~200-500 MB, recompiled nightly)

Both are cached under quant/.cache/sec/ which is gitignored — raw SEC
data never enters the repo. A cache hit skips the download when the
local file is newer than the configured TTL (default 24h). Every row
in companyfacts carries a `filed` date, so an older cached zip still
yields the same point-in-time answer for past dates; the TTL exists
only to pick up newly-filed data.

Compliance:
  - User-Agent read from the SEC_USER_AGENT env var (SEC requires a
    contact email per their fair-access policy). The CI workflow sets
    it from a GitHub Actions variable so no email lands in the repo.
  - Rate limit stays well under SEC's 10 req/s cap — this script
    makes two requests total, each HTTP streaming.

Run locally:
    export SEC_USER_AGENT="Your Name your.email@example.com"
    python quant/scripts/fetch_sec_bulk.py

Run in CI: see .github/workflows/update-distress-radar.yml (TBD).
"""

from __future__ import annotations

import argparse
import json
import os
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

SEC_URLS: dict[str, str] = {
    "companyfacts": "https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip",
    "submissions": "https://www.sec.gov/Archives/edgar/daily-index/bulkdata/submissions.zip",
}

DEFAULT_TTL_HOURS = 24
CHUNK_SIZE = 1024 * 1024  # 1 MiB streaming


@dataclass
class FetchResult:
    key: str
    path: Path
    size_bytes: int
    status: str   # "ok" | "cached" | "error"
    error: str | None = None


def _resolve_user_agent() -> str:
    ua = os.environ.get("SEC_USER_AGENT", "").strip()
    if not ua:
        raise RuntimeError(
            "SEC_USER_AGENT environment variable is required. Format: "
            '"Your Name your.email@example.com". The SEC blocks requests '
            "without a contact UA per https://www.sec.gov/os/accessing-edgar-data."
        )
    return ua


def _cache_is_fresh(path: Path, ttl_hours: int) -> bool:
    if not path.exists():
        return False
    age_hours = (time.time() - path.stat().st_mtime) / 3600
    return age_hours < ttl_hours


def _fetch_one(key: str, url: str, cache_dir: Path, ttl_hours: int, ua: str) -> FetchResult:
    cache_dir.mkdir(parents=True, exist_ok=True)
    target = cache_dir / f"{key}.zip"

    if _cache_is_fresh(target, ttl_hours):
        size = target.stat().st_size
        print(f"  ✓ {key}: cache hit at {target} ({size / 1_048_576:.1f} MiB)")
        return FetchResult(key=key, path=target, size_bytes=size, status="cached")

    tmp = target.with_suffix(".zip.part")
    print(f"  ↓ {key}: downloading {url} …", flush=True)
    t0 = time.time()
    try:
        req = Request(url, headers={"User-Agent": ua, "Accept-Encoding": "identity"})
        with urlopen(req, timeout=120) as resp:
            total_header = resp.headers.get("Content-Length")
            total = int(total_header) if total_header else None
            with tmp.open("wb") as f:
                done = 0
                last_pct = -1
                while True:
                    chunk = resp.read(CHUNK_SIZE)
                    if not chunk:
                        break
                    f.write(chunk)
                    done += len(chunk)
                    if total:
                        pct = int(100 * done / total)
                        if pct != last_pct and pct % 5 == 0:
                            print(
                                f"    {key}: {done / 1_048_576:.0f} / "
                                f"{total / 1_048_576:.0f} MiB ({pct}%)",
                                flush=True,
                            )
                            last_pct = pct
        tmp.replace(target)
    except (HTTPError, URLError, TimeoutError) as e:
        if tmp.exists():
            try:
                tmp.unlink()
            except OSError:
                pass
        return FetchResult(
            key=key, path=target, size_bytes=0, status="error", error=str(e)
        )

    size = target.stat().st_size
    dt = time.time() - t0
    print(f"  ✓ {key}: {size / 1_048_576:.1f} MiB in {dt:.1f}s")
    return FetchResult(key=key, path=target, size_bytes=size, status="ok")


def main() -> int:
    parser = argparse.ArgumentParser(description="SEC EDGAR bulk-data fetcher")
    parser.add_argument(
        "--cache-dir",
        default="quant/.cache/sec",
        help="Where to cache the zip files (gitignored).",
    )
    parser.add_argument(
        "--ttl-hours",
        type=int,
        default=DEFAULT_TTL_HOURS,
        help=f"Cache freshness window in hours (default {DEFAULT_TTL_HOURS}).",
    )
    parser.add_argument(
        "--only",
        choices=list(SEC_URLS.keys()),
        help="Fetch only this bulk file (companyfacts or submissions).",
    )
    parser.add_argument(
        "--summary-out",
        help="Write a JSON summary to this path for CI consumption.",
    )
    args = parser.parse_args()

    try:
        ua = _resolve_user_agent()
    except RuntimeError as e:
        print(f"❌ {e}", file=sys.stderr)
        return 2

    cache_dir = Path(args.cache_dir)
    keys = [args.only] if args.only else list(SEC_URLS.keys())
    results: list[FetchResult] = []
    for key in keys:
        results.append(_fetch_one(key, SEC_URLS[key], cache_dir, args.ttl_hours, ua))

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "cache_dir": str(cache_dir),
        "results": [
            {
                "key": r.key,
                "path": str(r.path),
                "size_mb": round(r.size_bytes / 1_048_576, 1),
                "status": r.status,
                "error": r.error,
            }
            for r in results
        ],
    }
    if args.summary_out:
        Path(args.summary_out).write_text(json.dumps(summary, indent=2))

    failed = [r for r in results if r.status == "error"]
    if failed:
        for r in failed:
            print(f"❌ {r.key}: {r.error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
