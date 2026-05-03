"""
Forum (formerly NAF - National Arbitration Forum) scraper.
Forum publishes domain dispute decisions at adrforum.com/domain-decisions.
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

FORUM_BASE = "https://www.adrforum.com"
FORUM_INDEX = "https://www.adrforum.com/domain-decisions"

FORUM_CASE_RE = re.compile(r"\b(FA[0-9]{7,})\b")


def parse_case_number(text: str) -> str | None:
    m = FORUM_CASE_RE.search(text)
    return m.group(1) if m else None


def parse_date_iso(text: str) -> date | None:
    text = text.strip()
    for fmt in ("%Y-%m-%d", "%B %d, %Y", "%b %d, %Y", "%m/%d/%Y", "%d %B %Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def parse_index_page(html: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "lxml")
    cases: list[dict[str, Any]] = []

    for link in soup.find_all("a", href=True):
        if not isinstance(link, Tag):
            continue

        href_attr = link.get("href")
        if isinstance(href_attr, list):
            href_attr = href_attr[0]
        href = str(href_attr or "")

        link_text = link.get_text(" ", strip=True)
        case_number = parse_case_number(link_text) or parse_case_number(href)
        if not case_number:
            continue

        decision_url = urljoin(FORUM_BASE, href)

        parent_text = ""
        parent = link.parent
        if isinstance(parent, Tag):
            parent_text = parent.get_text(" ", strip=True)
            for ancestor in link.parents:
                if isinstance(ancestor, Tag) and ancestor.name in ("tr", "li"):
                    parent_text = ancestor.get_text(" ", strip=True)
                    break

        domains: list[str] = []
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

        decision_date = None
        date_match = re.search(
            r"\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
            r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
            r"\s+\d{1,2},?\s+(?:19|20)\d{2}\b",
            parent_text,
        )
        if date_match:
            decision_date = parse_date_iso(date_match.group(0))

        cases.append({
            "case_number": case_number,
            "decision_url": decision_url,
            "domains": list(set(domains)),
            "decision_date": decision_date,
        })

    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for c in cases:
        if c["case_number"] not in seen:
            seen.add(c["case_number"])
            deduped.append(c)
    return deduped


async def scrape_forum_index(max_cases: int | None = None) -> None:
    async with track_run("forum_weekly") as run, PoliteClient() as client:
        console.log(f"[bold]Fetching Forum index:[/bold] {FORUM_INDEX}")

        try:
            html = await client.get(FORUM_INDEX)
        except Exception as e:
            run.add_error(FORUM_INDEX, e)
            run.notes = f"Failed to fetch Forum index: {e}"
            return

        cases = parse_index_page(html)
        console.log(f"[bold green]Found {len(cases)} Forum cases on index[/bold green]")

        if max_cases:
            cases = cases[:max_cases]

        for i, case_stub in enumerate(cases, start=1):
            console.log(
                f"[dim]({i}/{len(cases)})[/dim] "
                f"[bold]{case_stub['case_number']}[/bold]"
            )

            scraped = ScrapedCase(
                provider="FORUM",
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
            except Exception as e:
                run.add_error(case_stub["decision_url"], e)
                console.log(f"  [red]upsert failed:[/red] {e}")


@click.command()
@click.option("--max", "max_cases", type=int, default=None, help="Cap on cases for testing")
def main(max_cases: int | None) -> None:
    """Run the Forum scraper."""
    asyncio.run(scrape_forum_index(max_cases))


if __name__ == "__main__":
    main()
