"""
Live filings scraper - hourly cadence.

Fetches the most recent WIPO cases (newest sequence numbers in current year)
and records them in the live_filings table for the /live page.

If a case has already been promoted to a decision in the cases table, we skip
inserting a duplicate live_filing row but mark any existing live_filing as
'DECIDED'.

Reference: Architecture Sec 04 Track C, Sec 06 Pillar 3.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

import click
from rich.console import Console

from scrapers.common import (
    PoliteClient,
    supabase,
    track_run,
)
from scrapers.wipo.scraper import (
    WIPO_LIST_URL,
    parse_list_chunk,
)

console = Console()


async def scrape_live_filings(max_filings: int | None = 50) -> None:
    """
    Hourly scrape: pull the latest 50 (or max_filings) WIPO cases from the
    current year by hitting the highest sequence-number chunk first and
    walking backwards.
    """
    current_year = datetime.now(timezone.utc).year
    target_count = max_filings or 50

    async with track_run("wipo_live_filings_hourly") as run, PoliteClient() as client:
        console.log(f"[bold]Live feed scrape[/bold] - target {target_count} latest filings for {current_year}")

        # Find the highest chunk that has cases for the current year.
        # Probe from chunk 30 (5800-5999) downward.
        latest_chunk_idx = None
        for chunk_idx in range(30, -1, -1):
            seq_min = chunk_idx * 200 + 1
            seq_max = (chunk_idx + 1) * 200 - 1
            url = WIPO_LIST_URL.format(year=current_year, seq_min=seq_min, seq_max=seq_max)

            try:
                html = await client.get(url)
            except Exception as e:
                run.add_error(url, e)
                console.log(f"[red]Probe failed at chunk {chunk_idx}:[/red] {e}")
                continue

            cases = parse_list_chunk(html)
            if cases:
                latest_chunk_idx = chunk_idx
                console.log(f"[green]Found latest chunk: {chunk_idx} (seq {seq_min}-{seq_max}, {len(cases)} cases)[/green]")
                break

        if latest_chunk_idx is None:
            console.log("[yellow]No cases found for current year[/yellow]")
            run.notes = f"No cases found for {current_year}"
            return

        # Collect cases from latest chunk + previous chunk (if needed)
        all_cases: list[dict[str, Any]] = []
        for chunk_idx in range(latest_chunk_idx, max(latest_chunk_idx - 2, -1), -1):
            seq_min = chunk_idx * 200 + 1
            seq_max = (chunk_idx + 1) * 200 - 1
            url = WIPO_LIST_URL.format(year=current_year, seq_min=seq_min, seq_max=seq_max)

            try:
                html = await client.get(url)
            except Exception as e:
                run.add_error(url, e)
                console.log(f"[red]Failed to fetch chunk {chunk_idx}:[/red] {e}")
                continue

            chunk_cases = parse_list_chunk(html)
            chunk_cases.sort(key=lambda c: c["case_number"], reverse=True)
            all_cases.extend(chunk_cases)

            if len(all_cases) >= target_count:
                break

        all_cases = sorted(all_cases, key=lambda c: c["case_number"], reverse=True)[:target_count]
        console.log(f"[green]Top {len(all_cases)} most recent cases collected[/green]")

        # Check which are already decided in the cases table
        decided_case_numbers: set[str] = set()
        if all_cases:
            case_numbers = [c["case_number"] for c in all_cases]
            existing = (
                supabase()
                .table("cases")
                .select("case_number")
                .in_("case_number", case_numbers)
                .eq("provider", "WIPO")
                .execute()
            )
            decided_case_numbers = {row["case_number"] for row in (existing.data or [])}

        # Upsert into live_filings using ACTUAL schema columns:
        # provider, case_number, filing_date, domains, complainant, status, filing_url
        added = 0
        promoted = 0
        for case_stub in all_cases:
            case_number = case_stub["case_number"]
            status = "DECIDED" if case_number in decided_case_numbers else "FILED"

            existing_filing = (
                supabase()
                .table("live_filings")
                .select("id, status")
                .eq("provider", "WIPO")
                .eq("case_number", case_number)
                .limit(1)
                .execute()
            )

            row = {
                "provider": "WIPO",
                "case_number": case_number,
                "filing_url": case_stub.get("decision_url"),
                "domains": case_stub.get("domains", []),
                "complainant": case_stub.get("complainant_name"),  # match schema column name
                "status": status,
            }

            if existing_filing.data:
                if existing_filing.data[0].get("status") != status:
                    supabase().table("live_filings").update({"status": status}).eq(
                        "id", existing_filing.data[0]["id"]
                    ).execute()
                    if status == "DECIDED":
                        promoted += 1
            else:
                supabase().table("live_filings").insert(row).execute()
                added += 1
                run.cases_added += 1

        console.log(
            f"[bold green]Live feed complete:[/bold green] "
            f"added={added} promoted_to_decided={promoted}"
        )
        run.notes = f"added={added}, promoted_to_decided={promoted}, year={current_year}"


@click.command()
@click.option("--max", "max_filings", type=int, default=50, help="Max live filings to keep (default 50)")
def main(max_filings: int) -> None:
    asyncio.run(scrape_live_filings(max_filings))


if __name__ == "__main__":
    main()
