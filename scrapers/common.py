"""
Shared infrastructure for all scrapers.

- Supabase client (service role, writes)
- PoliteClient: browser UA, 1 request / 3 s, retries
- track_run(): audit rows in scraper_runs
- WIPO list-page parsing shared by the decisions and docket scrapers
- Batched upserts: one select + one upsert per 200-case chunk (v1 did 2 round
  trips per case, ~50 s per chunk)
"""

from __future__ import annotations

import asyncio
import os
import re
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Any
from urllib.parse import urljoin
from uuid import UUID

import httpx
from bs4 import BeautifulSoup, Tag
from dotenv import load_dotenv
from rich.console import Console
from supabase import Client, create_client
from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_exponential

load_dotenv()
console = Console()

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
MIN_DELAY_SECONDS = 3.0
TIMEOUT = httpx.Timeout(30.0, connect=10.0)

WIPO_BASE = "https://www.wipo.int"
CHUNK_SIZE = 200
CASE_NUMBER_RE = re.compile(r"\b(D[A-Z]*[0-9]{4}-[0-9]{4})\b")


def chunk_bounds(idx: int) -> tuple[int, int]:
    """WIPO ranges: 1-199, 200-399, 400-599, ... (v1 skipped every 200th case)."""
    return (1 if idx == 0 else idx * CHUNK_SIZE, idx * CHUNK_SIZE + CHUNK_SIZE - 1)


def seq_of(case_number: str) -> int:
    try:
        return int(case_number.rsplit("-", 1)[1])
    except (IndexError, ValueError):
        return 0


# -----------------------------------------------------------------------------
# Supabase
# -----------------------------------------------------------------------------
_supabase_client: Client | None = None


def supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    return _supabase_client


# -----------------------------------------------------------------------------
# HTTP
# -----------------------------------------------------------------------------
class PoliteClient:
    def __init__(self, min_delay: float = MIN_DELAY_SECONDS):
        self.min_delay = min_delay
        self._last_request_at = 0.0
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self) -> PoliteClient:
        self._client = httpx.AsyncClient(
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
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
            raise RuntimeError("PoliteClient must be used as an async context manager")
        loop = asyncio.get_event_loop()
        wait = self.min_delay - (loop.time() - self._last_request_at)
        if wait > 0:
            await asyncio.sleep(wait)
        self._last_request_at = loop.time()

        async for attempt in AsyncRetrying(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=2, min=2, max=30),
            retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError)),
            reraise=True,
        ):
            with attempt:
                response = await self._client.get(url)
                if response.status_code >= 400:
                    console.log(f"[red]HTTP {response.status_code}[/red] {url}")
                    response.raise_for_status()
                console.log(f"[dim]GET {url} -> {len(response.text)} bytes[/dim]")
                return response.text
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
        self.errors.append({"url": source_url, "type": type(error).__name__, "message": str(error)[:500]})


@asynccontextmanager
async def track_run(scraper_name: str):
    run = ScraperRun(scraper_name=scraper_name)
    response = supabase().table("scraper_runs").insert({"scraper_name": scraper_name, "status": "RUNNING"}).execute()
    run.run_id = response.data[0]["id"]
    console.log(f"[bold cyan]Started run {run.run_id} for {scraper_name}[/bold cyan]")
    status = "FAILED"
    try:
        yield run
        status = "SUCCESS" if not run.errors else "PARTIAL"
    except Exception as e:
        run.add_error("scraper-level", e)
        raise
    finally:
        supabase().table("scraper_runs").update(
            {
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "status": status,
                "cases_added": run.cases_added,
                "cases_updated": run.cases_updated,
                "errors": run.errors or None,
                "notes": run.notes[:2000],
            }
        ).eq("id", str(run.run_id)).execute()
        console.log(f"[bold green]Run {run.run_id} -> {status}[/bold green] added={run.cases_added} updated={run.cases_updated} errors={len(run.errors)}")


# -----------------------------------------------------------------------------
# Data model
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
            "is_published": True,  # public-record data
        }


def upsert_case(case: ScrapedCase) -> tuple[bool, bool]:
    """Single-row upsert with every column (Forum scraper, which parses full decisions)."""
    added, updated = upsert_cases_batch([case], full_rows=True)
    return (added > 0, updated > 0)


# Columns written by list scrapers. Uniform keys are required for bulk upserts,
# and leaving out filing/decision dates means a re-scan never blanks them.
_LIST_COLS = ("provider", "case_number", "decision_url", "complainant_name", "respondent_name", "domains", "outcome", "source_quality", "is_published")


def upsert_cases_batch(cases: list[ScrapedCase], full_rows: bool = False) -> tuple[int, int]:
    """Insert new cases and update changed ones. Returns (added, updated)."""
    if not cases:
        return (0, 0)
    sb = supabase()
    numbers = [c.case_number for c in cases]
    existing: dict[tuple[str, str], dict[str, Any]] = {}
    for i in range(0, len(numbers), 200):
        res = (
            sb.table("cases")
            .select("provider, case_number, outcome, respondent_name, domains")
            .in_("case_number", numbers[i : i + 200])
            .execute()
        )
        for r in res.data or []:
            existing[(r["provider"], r["case_number"])] = r

    rows: list[dict[str, Any]] = []
    added = updated = 0
    for c in cases:
        full = c.to_supabase_row()
        row = full if full_rows else {k: full[k] for k in _LIST_COLS}
        prev = existing.get((c.provider, c.case_number))
        if prev is None:
            added += 1
            rows.append(row)
        elif (
            full_rows
            or prev.get("outcome") != c.outcome
            or (c.respondent_name and prev.get("respondent_name") != c.respondent_name)
            or (c.domains and sorted(prev.get("domains") or []) != sorted(c.domains))
        ):
            updated += 1
            rows.append(row)

    for i in range(0, len(rows), 200):
        sb.table("cases").upsert(rows[i : i + 200], on_conflict="provider,case_number").execute()
    return (added, updated)


# -----------------------------------------------------------------------------
# WIPO list pages (decisionsx and casesx share the layout, different columns)
# -----------------------------------------------------------------------------
def _clean(text: str) -> str | None:
    t = re.sub(r"\s+", " ", text or "").strip()
    return None if t in ("", "-", "- -") else t


def parse_domains_cell(cell_text: str) -> list[str]:
    domains: list[str] = []
    for token in (cell_text or "").replace("/", " ").split():
        cleaned = token.strip("<>(),;\"'").rstrip(".").lower()
        if "." in cleaned and len(cleaned) >= 4 and not cleaned.startswith(("http", ".")):
            domains.append(cleaned)
    return list(dict.fromkeys(domains))


def map_outcome(decision_text: str) -> str | None:
    s = (decision_text or "").strip().lower()
    if not s or s == "-":
        return None
    if "transfer" in s:
        return "TRANSFER"
    if "hijack" in s or "rdnh" in s:
        return "RDNH"
    if "denied" in s or "deny" in s:
        return "DENY"
    if "terminat" in s or "withdraw" in s:
        return "WITHDRAWN"
    if "suspen" in s:
        return "SUSPEND"
    if "cancel" in s:
        return "OTHER"
    if "pending" in s:
        return "PENDING"
    return "OTHER"


def _column_map(rows: list[Tag], defaults: dict[str, int]) -> dict[str, int]:
    """Map logical columns from the header row when present, else use defaults."""
    for row in rows[:5]:
        headers = [_clean(c.get_text(" ", strip=True)) or "" for c in row.find_all(["th", "td"])]
        low = [h.lower() for h in headers]
        if any("case number" in h for h in low):
            m: dict[str, int] = {}
            for i, h in enumerate(low):
                if "case number" in h:
                    m["case"] = i
                elif "domain" in h:
                    m["domains"] = i
                elif "complainant" in h:
                    m["complainant"] = i
                elif "respondent" in h:
                    m["respondent"] = i
                elif "commencement" in h or "date" in h:
                    m["date"] = i
                elif "status" in h or "decision" in h:
                    m["status"] = i
            if "case" in m and "domains" in m:
                return {**defaults, **m}
    return defaults


def _href(cell: Tag, base: str = WIPO_BASE) -> str | None:
    link = cell.find("a", href=True)
    if isinstance(link, Tag):
        href = link.get("href")
        if isinstance(href, list):
            href = href[0]
        if href:
            return urljoin(base, str(href))
    return None


def parse_wipo_table(html: str, kind: str) -> list[dict[str, Any]]:
    """
    kind="decisions": Case Number | Complainant | Respondent | Domain Name(s) | Decision
    kind="cases":     Case Number | Domain Name(s) | Complainant | Respondent | Commencement Date | Case Status
    """
    soup = BeautifulSoup(html, "lxml")
    rows = [r for r in soup.find_all("tr") if isinstance(r, Tag)]
    defaults = (
        {"case": 0, "complainant": 1, "respondent": 2, "domains": 3, "status": 4}
        if kind == "decisions"
        else {"case": 0, "domains": 1, "complainant": 2, "respondent": 3, "date": 4, "status": 5}
    )
    col = _column_map(rows, defaults)
    # relative links resolve against the list page they came from
    base = f"{WIPO_BASE}/amc/en/domains/{'decisionsx' if kind == 'decisions' else 'casesx'}/list.jsp"
    need = max(col.values()) + 1

    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in rows:
        cells = row.find_all(["td", "th"])
        if len(cells) < need:
            continue
        m = CASE_NUMBER_RE.search(cells[col["case"]].get_text(" ", strip=True))
        if not m or m.group(1) in seen:
            continue
        case_number = m.group(1)
        seen.add(case_number)
        get = lambda k: cells[col[k]].get_text(" ", strip=True) if k in col and col[k] < len(cells) else ""  # noqa: E731
        item: dict[str, Any] = {
            "case_number": case_number,
            "link": _href(cells[col["case"]], base),
            "domains": parse_domains_cell(get("domains")),
            "complainant": (_clean(get("complainant")) or "")[:255] or None,
            "respondent": (_clean(get("respondent")) or "")[:255] or None,
            "status_text": _clean(get("status")) or "",
        }
        if kind == "cases":
            item["status_link"] = _href(cells[col["status"]], base) if "status" in col else None
            raw_date = _clean(get("date"))
            item["commenced"] = None
            if raw_date:
                for fmt in ("%B %d, %Y", "%b %d, %Y", "%Y-%m-%d", "%d %B %Y"):
                    try:
                        item["commenced"] = datetime.strptime(raw_date, fmt).date().isoformat()
                        break
                    except ValueError:
                        continue
        out.append(item)
    return out
