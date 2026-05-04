"""
WIPO scraper - UDRP gTLD decision indexer.

Strategy:
  WIPO publishes decisions in paginated chunks of 200 per page:
    list.jsp?prefix=D&year=YYYY&seq_min=N&seq_max=N+199
  
  We iterate chunks (1-199, 200-399, 400-599, ...) until either:
    - An empty page is returned (no cases yet for that range)
    - The --max cap is reached
  
  Each chunk's HTML contains a list of links to individual decision pages.
  Each link has the case number (D2025-XXXX) in the URL or text.

Rate limit: 3 seconds between requests (PoliteClient).

Reference: Architecture section 04 Track A.
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
    ScrapedCase,
    track_run,
    upsert_case,
)

console = Console()

WIPO_BASE = "https://www.wipo.int"
# Paginated list URL - chunks of 200 cases per page
WIPO_LIST_URL = (
    "https://www.wipo.int/amc/en/domains/decisionsx/list.jsp"
    "?prefix=D&year={year}&seq_min={seq_min}&seq_max={seq_max}"
)
# Page size used by WIPO
CHUNK_SIZE = 200
# Max chunks per year (5600 cases / 200 = 28 chunks)
MAX_CHUNKS_PER_YEAR = 35

# WIPO case number pattern: D2024-1234, DAI2024-0053, DCO2024-0001, etc.
CASE_NUMBER_RE = re.compile(r"\b(D[A-Z]*[0-9]{4}-[0-9]{4})\b")


def parse_case_number(text: str) -> str | None:
    """Extract WIPO case number from a string."""
    m = CASE_NUMBER_RE.search(text)
    return m.group(1) if m else None


def parse_date_iso(text: str) -> date | None:
    """Parse 'June 12, 2025' or '2025-06-12' into a date."""
    text = text.strip()
    try:
        return datetime.strptime(text, "%Y-%m-%d").date()
    except ValueError:
        pass
    for fmt in ("%B %d, %Y", "%b %d, %Y", "%d %B %Y", "%d %b %Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def parse_list_chunk(html: str) -> list[dict[str, Any]]:
    """
    Parse a WIPO list.jsp chunk page and extract case stubs.
    
    Returns a list of dicts with keys: case_number, decision_url, domains, decision_date.
    """
    soup = BeautifulSoup(html, "lxml")
    cases: list[dict[str, Any]] = []
    seen: set[str] = set()

    # WIPO list pages have <a href="/amc/en/domains/decisions/html/YYYY/dXXXX-NNNN.html"> links
    for link in soup.find_all("a", href=True):
        if not isinstance(link, Tag):
            continue

        href_attr = link.get("href")
        if isinstance(href_attr, list):
            href_attr = href_attr[0]
        href = str(href_attr or "")

        # Only interested in decision document links
        if "/decisions/" not in href and "decisionsx" not in href:
            continue

        link_text = link.get_text(" ", strip=True)
        case_number = parse_case_number(link_text) or parse_case_number(href)
        if not case_number:
            continue
        if case_number in seen:
            continue

        decision_url = urljoin(WIPO_BASE, href)

        # Look at parent row/element for domain names and date
        domains: list[str] = []
        decision_date: date | None = None

        parent_text = ""
        for ancestor in link.parents:
            if isinstance(ancestor, Tag) and ancestor.name in ("tr", "li", "p"):
                parent_text = ancestor.get_text(" ", strip=True)
                break

        # Extract domain-like tokens
        for token in parent_text.split():
            cleaned = token.strip("<>(),;.\"'")
            if (
                "." in cleaned
                and len(cleaned) >= 4
                and not cleaned.startswith("http")
                and not cleaned.startswith(".")
                and not cleaned.endswith(".")
                and not parse_case_number(cleaned)
            ):
                domains.append(cleaned)

        # Extract a date
        date_match = re.search(
            r"\b(?:January|February|March|April|May|June|July|"
            r"August|September|October|November|December)"
            r"\s+\d{1,2},?\s+(?:19|20)\d{2}\b",
            parent_text,
        )
        if date_match:
            decision_date = parse_date_iso(date_match.group(0))

        seen.add(case_number)
        cases.append({
            "case_number": case_number,
            "decision_url": decision_url,
            "domains": list(set(domains)),
            "decision_date": decision_date,
        })

    return cases


async def scrape_wipo_year(year: int, max_cases: int | None = None) -> None:
    """
    Scrape all WIPO decisions for a given year by paginating through chunks.
    
    If max_cases is set, stop after collecting that many cases total.
    """
    scraper_name = f"wipo_{year}_index"

    async with track_run(scraper_name) as run, PoliteClient() as client:
        console.log(f"[bold]Scraping WIPO {year}[/bold] - paginated chunks")

        total_cases = 0

        for chunk_idx in range(MAX_CHUNKS_PER_YEAR):
            seq_min = chunk_idx * CHUNK_SIZE + 1
            seq_max = (chunk_idx + 1) * CHUNK_SIZE - 1
            url = WIPO_LIST_URL.format(year=year, seq_min=seq_min, seq_max=seq_max)

            console.log(f"[dim]Chunk {chunk_idx + 1}: {seq_min}-{seq_max}[/dim]")

            try:
                html = await client.get(url)
            except Exception as e:
                run.add_error(url, e)
                console.log(f"  [red]Failed to fetch:[/red] {e}")
                if chunk_idx == 0:
                    run.notes = f"Failed to fetch first chunk: {e}"
                    return
                break

            chunk_cases = parse_list_chunk(html)

            if not chunk_cases:
                console.log(f"  [yellow]No cases in chunk {chunk_idx + 1}, stopping[/yellow]")
                break

            console.log(f"  [green]Found {len(chunk_cases)} cases[/green]")

            for case_stub in chunk_cases:
                if max_cases is not None and total_cases >= max_cases:
                    console.log(f"[bold cyan]Reached --max {max_cases}, stopping[/bold cyan]")
                    return

                scraped = ScrapedCase(
                    provider="WIPO",
                    case_number=case_stub["case_number"],
                    decision_url=case_stub["decision_url"],
                    decision_date=case_stub.get("decision_date"),
                    domains=case_stub.get("domains", []),
                )

                try:
                    inserted, updated = upsert_case(scraped)
                    if inserted:
                        run.cases_added += 1
                    elif updated:
                        run.cases_updated += 1
                    total_cases += 1
                except Exception as e:
                    run.add_error(case_stub["decision_url"], e)
                    console.log(
                        f"  [red]Upsert failed for {case_stub['case_number']}:[/red] {e}"
                    )

        console.log(
            f"[bold green]Done. Added: {run.cases_added}, Updated: {run.cases_updated}[/bold green]"
        )


@click.command()
@click.option("--year", type=int, required=True, help="Year to scrape (e.g., 2025)")
@click.option("--max", "max_cases", type=int, default=None, help="Cap on cases (for testing)")
def main(year: int, max_cases: int | None) -> None:
    """Run the WIPO scraper for a given year."""
    asyncio.run(scrape_wipo_year(year, max_cases))


if __name__ == "__main__":
    main()
