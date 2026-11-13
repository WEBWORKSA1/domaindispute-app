"""
Live docket scraper (runs hourly from the existing workflow).

1. Filed cases - WIPO casesx list (commencement date + status):
     https://www.wipo.int/amc/en/domains/casesx/list.jsp?prefix=D&year=YYYY&seq_min=N&seq_max=M
   The newest ranges are upserted into live_filings with status
     FILED   = compliance review, not yet commenced
     PENDING = commenced / suspended, awaiting decision
     DECIDED = decided or terminated
   Every 6th UTC hour the scan widens to the last 8 ranges so older pending
   cases are promoted when they close.

2. Fresh decisions - the newest decisionsx ranges for the current year are
   upserted into `cases`, so outcomes appear within the hour.

python -m scrapers.live.scraper [--ranges 3] [--max N]
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

import click
from rich.console import Console

from scrapers.common import (
    PoliteClient,
    ScrapedCase,
    chunk_bounds,
    map_outcome,
    parse_wipo_table,
    seq_of,
    supabase,
    track_run,
    upsert_cases_batch,
)
from scrapers.wipo.scraper import WIPO_BASE, WIPO_LIST_URL, last_indexed_seq

console = Console()

CASES_LIST_URL = "https://www.wipo.int/amc/en/domains/casesx/list.jsp?prefix=D&year={year}&seq_min={seq_min}&seq_max={seq_max}"


def docket_status(status_text: str) -> str:
    s = status_text.lower()
    if "decided" in s or "terminat" in s or "closed" in s:
        return "DECIDED"
    if "compliance" in s:
        return "FILED"
    return "PENDING"


def latest_filing_seq(year: int) -> int:
    res = (
        supabase()
        .table("live_filings")
        .select("case_number")
        .eq("provider", "WIPO")
        .like("case_number", f"D{year}-%")
        .order("case_number", desc=True)
        .limit(1)
        .execute()
    )
    return seq_of(res.data[0]["case_number"]) if res.data else 0


async def find_latest_range(client: PoliteClient, year: int, hint_seq: int) -> int | None:
    """Return the highest range index that contains cases."""
    idx = hint_seq // 200 if hint_seq else 30
    html = await client.get(CASES_LIST_URL.format(year=year, seq_min=chunk_bounds(idx)[0], seq_max=chunk_bounds(idx)[1]))
    if parse_wipo_table(html, "cases"):
        # walk up while the next range has cases
        while idx < 60:
            lo, hi = chunk_bounds(idx + 1)
            nxt = await client.get(CASES_LIST_URL.format(year=year, seq_min=lo, seq_max=hi))
            if not parse_wipo_table(nxt, "cases"):
                return idx
            idx += 1
        return idx
    # walk down until a range has cases
    while idx > 0:
        idx -= 1
        lo, hi = chunk_bounds(idx)
        html = await client.get(CASES_LIST_URL.format(year=year, seq_min=lo, seq_max=hi))
        if parse_wipo_table(html, "cases"):
            return idx
    return None


def upsert_filings(rows: list[dict[str, Any]]) -> tuple[int, int]:
    """Batch upsert into live_filings; rows without a date never blank a stored date."""
    if not rows:
        return (0, 0)
    sb = supabase()
    numbers = [r["case_number"] for r in rows]
    existing: dict[str, dict[str, Any]] = {}
    for i in range(0, len(numbers), 200):
        res = sb.table("live_filings").select("case_number, status, filing_date").in_("case_number", numbers[i : i + 200]).execute()
        for r in res.data or []:
            existing[r["case_number"]] = r

    with_date: list[dict[str, Any]] = []
    without_date: list[dict[str, Any]] = []
    added = changed = 0
    for r in rows:
        prev = existing.get(r["case_number"])
        if prev is None:
            added += 1
        elif prev.get("status") == r["status"] and (not r.get("filing_date") or prev.get("filing_date") == r["filing_date"]):
            continue
        else:
            changed += 1
        if r.get("filing_date"):
            with_date.append(r)
        else:
            without_date.append({k: v for k, v in r.items() if k != "filing_date"})

    for batch in (with_date, without_date):
        for i in range(0, len(batch), 200):
            sb.table("live_filings").upsert(batch[i : i + 200], on_conflict="provider,case_number").execute()
    return (added, changed)


async def scrape_live(ranges: int, max_rows: int | None) -> None:
    now = datetime.now(timezone.utc)
    year = now.year
    if now.hour % 6 == 0:
        ranges = max(ranges, 8)

    async with track_run("wipo_live_filings_hourly") as run, PoliteClient() as client:
        notes: list[str] = []

        # ---- 1. docket of filed cases
        latest = await find_latest_range(client, year, latest_filing_seq(year))
        if latest is None and now.month == 1:
            year -= 1
            latest = await find_latest_range(client, year, latest_filing_seq(year))
        if latest is None:
            run.notes = f"no casesx ranges found for {year}"
            return

        processed = 0
        for idx in range(latest, max(-1, latest - ranges), -1):
            lo, hi = chunk_bounds(idx)
            url = CASES_LIST_URL.format(year=year, seq_min=lo, seq_max=hi)
            try:
                items = parse_wipo_table(await client.get(url), "cases")
            except Exception as e:  # noqa: BLE001
                run.add_error(url, e)
                continue
            rows = [
                {
                    "provider": "WIPO",
                    "case_number": it["case_number"],
                    "filing_date": it.get("commenced"),
                    "domains": it["domains"],
                    "complainant": it["complainant"],
                    "status": docket_status(it["status_text"]),
                    "filing_url": it["link"],
                }
                for it in items
            ]
            if max_rows is not None:
                rows = rows[: max(0, max_rows - processed)]
            try:
                added, changed = upsert_filings(rows)
                run.cases_added += added
                run.cases_updated += changed
                processed += len(rows)
                console.log(f"  docket {lo}-{hi}: {len(rows)} rows, +{added} new, {changed} changed")
            except Exception as e:  # noqa: BLE001
                run.add_error(url, e)
            if max_rows is not None and processed >= max_rows:
                break
        notes.append(f"docket year={year} latest_range={latest} rows={processed}")

        # ---- 2. newest decisions for the current year
        start = max(0, last_indexed_seq(year) // 200 - 1)
        dec_rows = 0
        for idx in range(start, start + 4):
            lo, hi = chunk_bounds(idx)
            url = WIPO_LIST_URL.format(year=year, seq_min=lo, seq_max=hi)
            try:
                items = parse_wipo_table(await client.get(url), "decisions")
            except Exception as e:  # noqa: BLE001
                run.add_error(url, e)
                continue
            if not items:
                break
            cases = [
                ScrapedCase(
                    provider="WIPO",
                    case_number=it["case_number"],
                    decision_url=it["link"] or f"{WIPO_BASE}/amc/en/domains/search/text.jsp?case={it['case_number']}",
                    domains=it["domains"],
                    complainant_name=it["complainant"],
                    respondent_name=it["respondent"],
                    outcome=map_outcome(it["status_text"]),
                )
                for it in items
            ]
            try:
                added, updated = upsert_cases_batch(cases)
                run.cases_added += added
                run.cases_updated += updated
                dec_rows += len(cases)
            except Exception as e:  # noqa: BLE001
                run.add_error(url, e)
        notes.append(f"decisions rows={dec_rows}")
        run.notes = "; ".join(notes)


@click.command()
@click.option("--ranges", type=int, default=3, help="How many of the newest docket ranges to scan")
@click.option("--max", "max_rows", type=int, default=None, help="Cap docket rows (testing)")
def main(ranges: int, max_rows: int | None) -> None:
    asyncio.run(scrape_live(ranges, max_rows))


if __name__ == "__main__":
    main()
