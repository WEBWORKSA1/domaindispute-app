"""
Live filings scraper - hourly cadence.

Distinct from the daily decision scraper, this script:
  1. Fetches WIPO's "cases filed" index (the docket, not decisions)
  2. Detects new filings since the last run
  3. Inserts to live_filings table with status='FILED'
  4. Promotes filings to cases when decisions appear
"""

from __future__ import annotations

import asyncio
import re
from datetime import date, datetime
from typing import Any
from urllib.parse import urljoin

import click
from bs4 import BeautifulSoup, Tag
from rich.console import Console

from scrapers.common import (
    PoliteClient,
    supabase,
    track_run,
)

console = Console()

WIPO_CASES_INDEX = "https://www.wipo.int/amc/en/domains/casesx/all.html"
WIPO_BASE = "https://www.wipo.int"

CASE_NUMBER_RE = re.compile(r"\b(D[A-Z]*[0-9]{4}-[0-9]{4})\b")


def parse_filings_index(html: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "lxml")
    filings: list[dict[str, Any]] = []

    for row in soup.find_all("tr"):
        if not isinstance(row, Tag):
            continue
        cells = row.find_all(["td", "th"])
        if len(cells) < 2:
            continue

        row_text = row.get_text(" ", strip=True)
        case_number = None
        match = CASE_NUMBER_RE.search(row_text)
        if match:
            case_number = match.group(1)

        if not case_number:
            continue

        link = row.find("a", href=True)
        filing_url = None
        if isinstance(link, Tag):
            href = link.get("href")
            if isinstance(href, list):
                href = href[0]
            if href:
                filing_url = urljoin(WIPO_BASE, str(href))

        domains: list[str] = []
        for cell in cells:
            cell_text = cell.get_text(" ", strip=True)
            for token in cell_text.split():
                cleaned = token.strip("<>(),;.")
                if (
                    "." in cleaned
                    and len(cleaned) >= 4
                    and not cleaned.startswith("http")
                    and not cleaned.startswith(".")
                    and not cleaned.endswith(".")
                    and not CASE_NUMBER_RE.match(cleaned)
                ):
                    domains.append(cleaned)

        complainant = None
        for cell in cells:
            text = cell.get_text(" ", strip=True)
            if (
                len(text) > 8
                and any(c.isupper() for c in text)
                and "." not in text
                and not CASE_NUMBER_RE.search(text)
            ):
                if not complainant or len(text) > len(complainant):
                    complainant = text[:255]

        filings.append({
            "case_number": case_number,
            "filing_url": filing_url,
            "domains": list(set(domains)),
            "complainant": complainant,
        })

    return filings


async def scrape_live_filings(max_filings: int | None = None) -> None:
    async with track_run("wipo_live_filings_hourly") as run, PoliteClient() as client:
        console.log(f"[bold]Fetching live filings index:[/bold] {WIPO_CASES_INDEX}")

        try:
            html = await client.get(WIPO_CASES_INDEX)
        except Exception as e:
            run.add_error(WIPO_CASES_INDEX, e)
            run.notes = f"Failed to fetch index: {e}"
            return

        filings = parse_filings_index(html)
        console.log(f"[bold green]Found {len(filings)} filings on index page[/bold green]")

        if max_filings:
            filings = filings[:max_filings]

        existing_response = (
            supabase()
            .table("live_filings")
            .select("case_number")
            .eq("provider", "WIPO")
            .execute()
        )
        existing_set = {row["case_number"] for row in (existing_response.data or [])}

        cases_response = (
            supabase()
            .table("cases")
            .select("case_number")
            .eq("provider", "WIPO")
            .execute()
        )
        decided_set = {row["case_number"] for row in (cases_response.data or [])}

        new_filings: list[dict[str, Any]] = []
        for f in filings:
            cn = f["case_number"]
            if cn in existing_set:
                continue
            if cn in decided_set:
                continue
            new_filings.append({
                "provider": "WIPO",
                "case_number": cn,
                "domains": f["domains"],
                "complainant": f["complainant"],
                "filing_url": f["filing_url"],
                "status": "FILED",
            })

        if new_filings:
            console.log(f"[bold cyan]Inserting {len(new_filings)} new filings[/bold cyan]")
            for i in range(0, len(new_filings), 100):
                batch = new_filings[i : i + 100]
                supabase().table("live_filings").insert(batch).execute()
                run.cases_added += len(batch)
        else:
            console.log("[dim]No new filings to add[/dim]")

        await promote_decided_filings(run)


async def promote_decided_filings(run) -> None:
    pending = (
        supabase()
        .table("live_filings")
        .select("id, case_number, provider")
        .eq("status", "FILED")
        .is_("promoted_to_case_id", "null")
        .execute()
    )

    if not pending.data:
        return

    promoted_count = 0
    for filing in pending.data:
        case_match = (
            supabase()
            .table("cases")
            .select("id")
            .eq("provider", filing["provider"])
            .eq("case_number", filing["case_number"])
            .limit(1)
            .execute()
        )
        if case_match.data:
            supabase().table("live_filings").update({
                "status": "DECIDED",
                "promoted_to_case_id": case_match.data[0]["id"],
            }).eq("id", filing["id"]).execute()
            promoted_count += 1
            run.cases_updated += 1

    if promoted_count:
        console.log(f"[bold green]Promoted {promoted_count} filings -> decided cases[/bold green]")


@click.command()
@click.option("--max", "max_filings", type=int, default=None, help="Cap for testing")
def main(max_filings: int | None) -> None:
    """Hourly live-filings scraper."""
    asyncio.run(scrape_live_filings(max_filings))


if __name__ == "__main__":
    main()
