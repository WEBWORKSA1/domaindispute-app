"""
WIPO decisions indexer (gTLD, prefix D).

Source: https://www.wipo.int/amc/en/domains/decisionsx/list.jsp?prefix=D&year=YYYY&seq_min=N&seq_max=M
Ranges are 1-199, 200-399, ... Each row: case, complainant, respondent, domains, decision.

Modes
  python -m scrapers.wipo.scraper --year 2025                 # 2025 + the current year, every range
  python -m scrapers.wipo.scraper --year 2024 --incremental   # 2024 from the last indexed case + current year
  python -m scrapers.wipo.scraper --no-current --year 2023

The scheduled workflow still passes a fixed --year, so the current year is always
included automatically. That keeps the case library fresh without editing the
workflow file.

Every range is rescanned (about 30 requests per year, a few minutes) because
decisions arrive out of order and older gaps heal themselves; only new or
changed rows are written. --incremental starts earlier years from the last
indexed case instead.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

import click
from rich.console import Console

from scrapers.common import (
    WIPO_BASE,
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

console = Console()

WIPO_LIST_URL = "https://www.wipo.int/amc/en/domains/decisionsx/list.jsp?prefix=D&year={year}&seq_min={seq_min}&seq_max={seq_max}"
MAX_CHUNKS_PER_YEAR = 40


def parse_list_chunk(html: str) -> list[dict]:
    """Back-compat helper: decision rows as case stubs."""
    out = []
    for r in parse_wipo_table(html, "decisions"):
        out.append(
            {
                "case_number": r["case_number"],
                "decision_url": r["link"] or f"{WIPO_BASE}/amc/en/domains/search/text.jsp?case={r['case_number']}",
                "domains": r["domains"],
                "complainant_name": r["complainant"],
                "respondent_name": r["respondent"],
                "outcome": map_outcome(r["status_text"]),
            }
        )
    return out


def last_indexed_seq(year: int) -> int:
    res = (
        supabase()
        .table("cases")
        .select("case_number")
        .eq("provider", "WIPO")
        .like("case_number", f"D{year}-%")
        .order("case_number", desc=True)
        .limit(1)
        .execute()
    )
    return seq_of(res.data[0]["case_number"]) if res.data else 0


async def scrape_year(client: PoliteClient, run, year: int, full: bool, max_cases: int | None, budget: list[int]) -> None:
    start_idx = 0
    if not full:
        start_idx = max(0, last_indexed_seq(year) // 200 - 2)
    console.log(f"[bold]WIPO decisions {year}[/bold] from range {start_idx} ({'full' if full else 'incremental'})")

    empty_streak = 0
    for idx in range(start_idx, MAX_CHUNKS_PER_YEAR):
        lo, hi = chunk_bounds(idx)
        url = WIPO_LIST_URL.format(year=year, seq_min=lo, seq_max=hi)
        try:
            html = await client.get(url)
        except Exception as e:  # noqa: BLE001
            run.add_error(url, e)
            continue

        stubs = parse_list_chunk(html)
        if not stubs:
            empty_streak += 1
            if empty_streak >= 2:
                break
            continue
        empty_streak = 0

        if max_cases is not None:
            stubs = stubs[: max(0, max_cases - budget[0])]
        cases = [
            ScrapedCase(
                provider="WIPO",
                case_number=s["case_number"],
                decision_url=s["decision_url"],
                domains=s["domains"],
                complainant_name=s["complainant_name"],
                respondent_name=s["respondent_name"],
                outcome=s["outcome"],
            )
            for s in stubs
        ]
        try:
            added, updated = upsert_cases_batch(cases)
            run.cases_added += added
            run.cases_updated += updated
            budget[0] += len(cases)
            console.log(f"  {lo}-{hi}: {len(cases)} rows, +{added} new, {updated} updated")
        except Exception as e:  # noqa: BLE001
            run.add_error(url, e)
        if max_cases is not None and budget[0] >= max_cases:
            return


async def run_scrape(years: list[int], include_current: bool, full: bool, max_cases: int | None) -> None:
    now = datetime.now(timezone.utc)
    targets: dict[int, bool] = {y: full for y in years}  # True = every range
    if include_current:
        targets[now.year] = True  # always full rescan of the current year
        if now.month <= 2:
            targets.setdefault(now.year - 1, False)

    name = "wipo_decisions_" + "_".join(str(y) for y in sorted(targets))
    async with track_run(name) as run, PoliteClient() as client:
        budget = [0]
        for year in sorted(targets, reverse=True):
            await scrape_year(client, run, year, targets[year], max_cases, budget)
            if max_cases is not None and budget[0] >= max_cases:
                break
        run.notes = f"years={sorted(targets)} rows_seen={budget[0]}"


@click.command()
@click.option("--year", "years", type=int, multiple=True, help="Year(s) to scrape, e.g. --year 2025")
@click.option("--current/--no-current", "include_current", default=True, help="Also rescan the current year (default on)")
@click.option("--full/--incremental", default=True, help="Rescan every range (default) or start from the last indexed case")
@click.option("--max", "max_cases", type=int, default=None, help="Cap rows processed (testing)")
def main(years: tuple[int, ...], include_current: bool, full: bool, max_cases: int | None) -> None:
    asyncio.run(run_scrape(list(years), include_current, full, max_cases))


if __name__ == "__main__":
    main()
