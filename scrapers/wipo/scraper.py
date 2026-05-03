"""WIPO scraper - UDRP gTLD and ccTLD decision indexer."""

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
WIPO_CASES_INDEX = "https://www.wipo.int/amc/en/domains/casesx/all.html"
WIPO_YEAR_INDEX = "https://www.wipo.int/amc/en/domains/decisionsx/{year}/index.html"

CASE_NUMBER_RE = re.compile(r"\b(D[A-Z]*[0-9]{4}-[0-9]{4})\b")


def parse_case_number(text: str) -> str | None:
    m = CASE_NUMBER_RE.search(text)
    return m.group(1) if m else None


def parse_date_iso(text: str) -> date | None:
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


def detect_outcome(text: str) -> str | None:
    rdnh_re = re.compile(r"\breverse\s+domain\s+name\s+hijacking\b|\bRDNH\b", re.IGNORECASE)
    if rdnh_re.search(text):
        return "RDNH"

    if re.search(r"\b(?:proceedings?\s+(?:are\s+)?withdrawn|case\s+terminated|complaint\s+withdrawn)\b", text, re.IGNORECASE):
        return "WITHDRAWN"

    if re.search(r"\b(?:domain\s+name\s+(?:is\s+)?suspended|suspension\s+ordered)\b", text, re.IGNORECASE):
        return "SUSPEND"

    if re.search(
        r"\b(?:order(?:ed|s)?\s+(?:that\s+)?(?:the\s+)?(?:disputed\s+)?domain(?:\s+name)?s?\s+(?:be\s+)?(?:to\s+be\s+)?transferred|"
        r"transfer\s+(?:of\s+)?(?:the\s+)?(?:disputed\s+)?domain|"
        r"domain(?:\s+name)?s?\s+(?:is|shall\s+be|are)\s+transferred|"
        r"hereby\s+transferred|"
        r"be\s+transferred\s+to\s+(?:the\s+)?[Cc]omplainant)\b",
        text,
        re.IGNORECASE,
    ):
        return "TRANSFER"

    if re.search(
        r"\b(?:complaint\s+is\s+denied|complaint\s+denied|denying\s+the\s+complaint|deny\s+the\s+complaint)\b",
        text,
        re.IGNORECASE,
    ):
        return "DENY"

    return None


def parse_index_page(html: str, year: int) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "lxml")
    cases: list[dict[str, Any]] = []

    for row in soup.find_all("tr"):
        if not isinstance(row, Tag):
            continue
        cells = row.find_all(["td", "th"])
        if len(cells) < 2:
            continue

        row_text = row.get_text(" ", strip=True)
        case_number = parse_case_number(row_text)
        if not case_number:
            continue

        link = row.find("a", href=re.compile(r"decisions"))
        if not isinstance(link, Tag) or not link.get("href"):
            continue

        href = link["href"]
        if isinstance(href, list):
            href = href[0]
        decision_url = urljoin(WIPO_BASE, str(href))

        domains: list[str] = []
        for cell in cells:
            cell_text = cell.get_text(" ", strip=True)
            for token in cell_text.split():
                if "." in token and len(token) >= 4 and " " not in token:
                    cleaned = token.strip("<>(),;.")
                    if "." in cleaned and not cleaned.startswith(".") and not cleaned.endswith("."):
                        if not cleaned.startswith("http") and not parse_case_number(cleaned):
                            domains.append(cleaned)

        decision_date = None
        for cell in cells:
            d = parse_date_iso(cell.get_text(strip=True))
            if d:
                decision_date = d
                break

        cases.append({
            "case_number": case_number,
            "decision_url": decision_url,
            "domains": list(set(domains)),
            "decision_date": decision_date,
            "year": year,
        })

    return cases


def parse_decision_page(html: str) -> dict[str, Any]:
    soup = BeautifulSoup(html, "lxml")
    full_text = soup.get_text(" ", strip=True)

    result: dict[str, Any] = {
        "complainant_name": None,
        "respondent_name": None,
        "panelists": [],
        "outcome": detect_outcome(full_text),
        "panel_size": None,
        "domains_from_decision": [],
    }

    comp_match = re.search(
        r"(?:Complainant\s+is|Complainants?\s+are)\s+([^.,]+?)(?:\s+of\s+|\s*,)",
        full_text[:8000],
    )
    if comp_match:
        result["complainant_name"] = comp_match.group(1).strip()[:255]

    resp_match = re.search(
        r"(?:Respondent\s+is|Respondents?\s+are)\s+([^.,]+?)(?:\s+of\s+|\s*,)",
        full_text[:8000],
    )
    if resp_match:
        result["respondent_name"] = resp_match.group(1).strip()[:255]

    panel_section = re.search(
        r"(?:Panel|Panelist[s]?)[:\s]+([A-Z][a-zA-Z\u00C0-\u00FF\s,.\-']{5,150})",
        full_text,
    )
    if panel_section:
        names_raw = panel_section.group(1)
        names = [n.strip() for n in re.split(r"[,;]|\sand\s", names_raw) if n.strip()]
        result["panelists"] = [
            n for n in names
            if len(n) > 3 and len(n) < 80 and n[0].isupper() and not any(c.isdigit() for c in n)
        ][:5]
        result["panel_size"] = 3 if len(result["panelists"]) >= 3 else 1

    return result


async def scrape_year(
    year: int,
    fetch_full_decisions: bool = True,
    max_cases: int | None = None,
) -> None:
    async with track_run(f"wipo_year_{year}") as run, PoliteClient() as client:
        index_url = WIPO_YEAR_INDEX.format(year=year)
        console.log(f"[bold]Fetching index:[/bold] {index_url}")

        try:
            index_html = await client.get(index_url)
        except Exception as e:
            run.add_error(index_url, e)
            run.notes = f"Failed to fetch year index: {e}"
            return

        cases = parse_index_page(index_html, year)
        console.log(f"[bold green]Found {len(cases)} cases in {year} index[/bold green]")

        if max_cases:
            cases = cases[:max_cases]

        for i, case_stub in enumerate(cases, start=1):
            console.log(
                f"[dim]({i}/{len(cases)})[/dim] "
                f"[bold]{case_stub['case_number']}[/bold]"
            )

            scraped = ScrapedCase(
                provider="WIPO",
                case_number=case_stub["case_number"],
                decision_url=case_stub["decision_url"],
                decision_date=case_stub.get("decision_date"),
                domains=case_stub.get("domains", []),
            )

            if fetch_full_decisions:
                try:
                    decision_html = await client.get(case_stub["decision_url"])
                    parsed = parse_decision_page(decision_html)
                    scraped.complainant_name = parsed["complainant_name"]
                    scraped.respondent_name = parsed["respondent_name"]
                    scraped.panelists = parsed["panelists"]
                    scraped.panel_size = parsed["panel_size"]
                    scraped.outcome = parsed["outcome"]
                except Exception as e:
                    run.add_error(case_stub["decision_url"], e)
                    console.log(
                        f"[yellow]Could not fetch decision page: "
                        f"{type(e).__name__}: {e}[/yellow]"
                    )

            try:
                inserted, updated = upsert_case(scraped)
                if inserted:
                    run.cases_added += 1
                    console.log(f"  [green]+[/green] inserted {scraped.case_number}")
                elif updated:
                    run.cases_updated += 1
                    console.log(f"  [cyan]~[/cyan] updated {scraped.case_number}")
            except Exception as e:
                run.add_error(case_stub["decision_url"], e)
                console.log(f"  [red]upsert failed:[/red] {e}")


@click.command()
@click.option("--year", type=int, required=True, help="Decision year (e.g., 2025)")
@click.option("--no-full", is_flag=True, help="Skip fetching full decision pages (faster)")
@click.option("--max", "max_cases", type=int, default=None, help="Cap on cases for testing")
def main(year: int, no_full: bool, max_cases: int | None) -> None:
    """Run the WIPO scraper for a specific year."""
    asyncio.run(scrape_year(year, fetch_full_decisions=not no_full, max_cases=max_cases))


if __name__ == "__main__":
    main()
