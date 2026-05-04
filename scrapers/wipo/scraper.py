"""
WIPO scraper - UDRP gTLD decision indexer.

Strategy:
  WIPO publishes decisions in paginated HTML tables, 200 cases per page:
    list.jsp?prefix=D&year=YYYY&seq_min=N&seq_max=N+199
  
  Each page has a table with columns:
    Case Number | Complainant | Respondent | Domain Name(s) | Decision
  
  We iterate chunks (1-199, 200-399, ...) until either:
    - An empty page is returned (no more cases for that range)
    - The --max cap is reached
  
  For each row, we extract:
    - case_number (always)
    - decision_url (when case has a link to search/text.jsp page)
    - complainant_name, respondent_name
    - domain(s)
    - outcome (Transfer / Terminated / Complaint denied / etc.)

Rate limit: 3 seconds between requests (PoliteClient).

Reference: Architecture section 04 Track A.
"""

from __future__ import annotations

import asyncio
import re
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
WIPO_LIST_URL = (
    "https://www.wipo.int/amc/en/domains/decisionsx/list.jsp"
    "?prefix=D&year={year}&seq_min={seq_min}&seq_max={seq_max}"
)
CHUNK_SIZE = 200
MAX_CHUNKS_PER_YEAR = 35

# WIPO case number pattern: D2024-1234, DAI2024-0053, DCO2024-0001, DBIZ..., etc.
CASE_NUMBER_RE = re.compile(r"\b(D[A-Z]*[0-9]{4}-[0-9]{4})\b")


def parse_case_number(text: str) -> str | None:
    """Extract a WIPO case number from a string."""
    m = CASE_NUMBER_RE.search(text)
    return m.group(1) if m else None


def map_outcome(decision_text: str) -> str | None:
    """Map WIPO decision-column text to our normalized Outcome enum."""
    s = (decision_text or "").strip().lower()
    if not s or s == "-":
        return None
    if "transfer" in s:
        return "TRANSFER"
    if "denied" in s or "deny" in s:
        return "DENY"
    if "rdnh" in s or "reverse domain name hijacking" in s:
        return "RDNH"
    if "terminated" in s or "withdrawn" in s:
        return "WITHDRAWN"
    if "suspended" in s or "suspension" in s:
        return "SUSPEND"
    if "pending" in s:
        return "PENDING"
    return "OTHER"


def parse_domains_cell(cell_text: str) -> list[str]:
    """Parse the Domain Name(s) column. Multiple domains separated by whitespace."""
    domains: list[str] = []
    for token in cell_text.split():
        cleaned = token.strip("<>(),;.\"'")
        if (
            "." in cleaned
            and len(cleaned) >= 4
            and not cleaned.startswith("http")
            and not cleaned.startswith(".")
            and not cleaned.endswith(".")
        ):
            domains.append(cleaned)
    return list(dict.fromkeys(domains))  # dedupe, preserve order


def parse_list_chunk(html: str) -> list[dict[str, Any]]:
    """
    Parse a WIPO list.jsp HTML page, returning case stub dicts.
    
    Each row of the decisions table becomes one stub with:
        case_number, decision_url, domains, complainant, respondent, outcome
    """
    soup = BeautifulSoup(html, "lxml")
    cases: list[dict[str, Any]] = []
    seen: set[str] = set()

    # Find all table rows that have at least 5 cells (case#, comp, resp, domain, decision)
    for row in soup.find_all("tr"):
        if not isinstance(row, Tag):
            continue
        cells = row.find_all(["td", "th"])
        if len(cells) < 5:
            continue

        # Cell 0: case number (text, possibly with link)
        case_cell = cells[0]
        case_text = case_cell.get_text(" ", strip=True)
        case_number = parse_case_number(case_text)
        if not case_number:
            continue
        if case_number in seen:
            continue
        seen.add(case_number)

        # Decision URL (if there's a link in the case-number cell)
        decision_url = None
        link = case_cell.find("a", href=True)
        if isinstance(link, Tag):
            href_attr = link.get("href")
            if isinstance(href_attr, list):
                href_attr = href_attr[0]
            if href_attr:
                decision_url = urljoin(WIPO_BASE, str(href_attr))

        # If no direct link (Terminated cases), construct the search URL
        if not decision_url:
            decision_url = (
                f"{WIPO_BASE}/amc/en/domains/search/text.jsp?case={case_number}"
            )

        # Cells 1, 2, 3, 4 = Complainant, Respondent, Domains, Decision
        complainant = cells[1].get_text(" ", strip=True)[:255] if len(cells) > 1 else None
        respondent = cells[2].get_text(" ", strip=True)[:255] if len(cells) > 2 else None
        domains_text = cells[3].get_text(" ", strip=True) if len(cells) > 3 else ""
        decision_text = cells[4].get_text(" ", strip=True) if len(cells) > 4 else ""

        cases.append({
            "case_number": case_number,
            "decision_url": decision_url,
            "domains": parse_domains_cell(domains_text),
            "complainant_name": complainant if complainant and complainant != "-" else None,
            "respondent_name": respondent if respondent and respondent != "-" else None,
            "outcome": map_outcome(decision_text),
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
                    domains=case_stub.get("domains", []),
                    complainant_name=case_stub.get("complainant_name"),
                    respondent_name=case_stub.get("respondent_name"),
                    outcome=case_stub.get("outcome"),
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
