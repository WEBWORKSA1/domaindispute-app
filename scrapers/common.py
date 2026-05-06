"""
Shared infrastructure for all scrapers.

Provides:
- Supabase client (singleton)
- Polite HTTP client with retries and rate limiting
- Run tracking (writes to scraper_runs table for observability)
- Common data models

Reference: Architecture Sec 04, 09 (scraping ToS posture)
"""

from __future__ import annotations

import asyncio
import os
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Any
from uuid import UUID

import httpx
from dotenv import load_dotenv
from rich.console import Console
from supabase import Client, create_client
from tenacity import (
    AsyncRetrying,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

load_dotenv()

console = Console()

# -----------------------------------------------------------------------------
# Constants
# -----------------------------------------------------------------------------
# Use a real browser User-Agent. Many sites (including WIPO) reject custom bot
# UAs even when the bot is polite. We're scraping public data at 1 req/3s.
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

# Per-request delay
MIN_DELAY_SECONDS = 3.0

# httpx timeout
TIMEOUT = httpx.Timeout(30.0, connect=10.0)


# -----------------------------------------------------------------------------
# Supabase client
# -----------------------------------------------------------------------------
_supabase_client: Client | None = None


def supabase() -> Client:
    """Singleton Supabase client. Uses SERVICE_ROLE_KEY for scraper writes."""
    global _supabase_client
    if _supabase_client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        _supabase_client = create_client(url, key)
    return _supabase_client


# -----------------------------------------------------------------------------
# Polite HTTP client
# -----------------------------------------------------------------------------
class PoliteClient:
    def __init__(self, min_delay: float = MIN_DELAY_SECONDS):
        self.min_delay = min_delay
        self._last_request_at: float = 0.0
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self) -> PoliteClient:
        self._client = httpx.AsyncClient(
            headers={
                "User-Agent": USER_AGENT,
                "Accept": (
                    "text/html,application/xhtml+xml,application/xml;q=0.9,"
                    "image/avif,image/webp,*/*;q=0.8"
                ),
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "DNT": "1",
                "Upgrade-Insecure-Requests": "1",
            },
            timeout=TIMEOUT,
            follow_redirects=True,
        )
        return self

    async def __aexit__(self, *_: Any) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None

    async def get(self, url: str) -> str:
        if not self._client:
            raise RuntimeError("PoliteClient must be used as async context manager")

        now = asyncio.get_event_loop().time()
        elapsed = now - self._last_request_at
        if elapsed < self.min_delay:
            await asyncio.sleep(self.min_delay - elapsed)
        self._last_request_at = asyncio.get_event_loop().time()

        async for attempt in AsyncRetrying(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=2, min=2, max=30),
            retry=retry_if_exception_type(
                (httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError)
            ),
            reraise=True,
        ):
            with attempt:
                console.log(f"[dim]GET {url}[/dim]")
                response = await self._client.get(url)
                if response.status_code >= 500:
                    response.raise_for_status()
                if response.status_code >= 400:
                    console.log(f"[red]HTTP {response.status_code}[/red] {url}")
                    response.raise_for_status()

                text = response.text
                console.log(
                    f"[dim]  Got {len(text)} bytes "
                    f"(status {response.status_code}, "
                    f"content-type: {response.headers.get('content-type', 'n/a')})[/dim]"
                )
                if len(text) < 5000:
                    console.log(f"[yellow]  WARNING: response is small ({len(text)} bytes)[/yellow]")
                    console.log(f"[dim]  First 500 chars: {text[:500]}[/dim]")

                return text

        raise RuntimeError("unreachable")


# -----------------------------------------------------------------------------
# Run tracking
# -----------------------------------------------------------------------------
@dataclass
class ScraperRun:
    scraper_name: str
    run_id: UUID | None = None
    cases_added: int = 0
    cases_updated: int = 0
    errors: list[dict[str, Any]] = field(default_factory=list)
    notes: str = ""

    def add_error(self, source_url: str, error: Exception) -> None:
        self.errors.append({
            "url": source_url,
            "type": type(error).__name__,
            "message": str(error)[:500],
        })


@asynccontextmanager
async def track_run(scraper_name: str):
    run = ScraperRun(scraper_name=scraper_name)

    response = (
        supabase()
        .table("scraper_runs")
        .insert({"scraper_name": scraper_name, "status": "RUNNING"})
        .execute()
    )
    run.run_id = response.data[0]["id"]
    console.log(f"[bold cyan]Started run {run.run_id} for {scraper_name}[/bold cyan]")

    try:
        yield run
        status = "SUCCESS" if not run.errors else "PARTIAL"
    except Exception as e:
        status = "FAILED"
        run.add_error("scraper-level", e)
        raise
    finally:
        if run.run_id:
            supabase().table("scraper_runs").update({
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "status": status,
                "cases_added": run.cases_added,
                "cases_updated": run.cases_updated,
                "errors": run.errors if run.errors else None,
                "notes": run.notes,
            }).eq("id", str(run.run_id)).execute()
            console.log(
                f"[bold green]Run {run.run_id} -> {status}[/bold green] "
                f"added={run.cases_added} updated={run.cases_updated} "
                f"errors={len(run.errors)}"
            )


# -----------------------------------------------------------------------------
# Common data model
# -----------------------------------------------------------------------------
@dataclass
class ScrapedCase:
    provider: str
    case_number: str
    decision_url: str
    filing_date: date | None = None
    decision_date: date | None = None
    complainant_name: str | None = None
    complainant_country: str | None = None
    respondent_name: str | None = None
    respondent_country: str | None = None
    domains: list[str] = field(default_factory=list)
    panelists: list[str] = field(default_factory=list)
    panel_size: int | None = None
    language: str = "en"
    outcome: str | None = None
    raw_html_s3_key: str | None = None
    source_quality: str = "PRIMARY"

    def to_supabase_row(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "case_number": self.case_number,
            "decision_url": self.decision_url,
            "filing_date": self.filing_date.isoformat() if self.filing_date else None,
            "decision_date": self.decision_date.isoformat() if self.decision_date else None,
            "complainant_name": self.complainant_name,
            "complainant_country": self.complainant_country,
            "respondent_name": self.respondent_name,
            "respondent_country": self.respondent_country,
            "domains": self.domains,
            "panelists": self.panelists,
            "panel_size": self.panel_size,
            "language": self.language,
            "outcome": self.outcome,
            "raw_html_s3_key": self.raw_html_s3_key,
            "source_quality": self.source_quality,
            "is_published": True,  # auto-publish: cases are public-record data
        }


def upsert_case(case: ScrapedCase) -> tuple[bool, bool]:
    row = case.to_supabase_row()

    existing = (
        supabase()
        .table("cases")
        .select("id, decision_date, outcome")
        .eq("provider", case.provider)
        .eq("case_number", case.case_number)
        .limit(1)
        .execute()
    )

    if existing.data:
        existing_row = existing.data[0]
        if (
            existing_row.get("outcome") != case.outcome
            or existing_row.get("decision_date") != row.get("decision_date")
        ):
            supabase().table("cases").update(row).eq("id", existing_row["id"]).execute()
            return (False, True)
        return (False, False)
    else:
        supabase().table("cases").insert(row).execute()
        return (True, False)
