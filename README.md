# DomainDispute.com

Self-help research and document-preparation platform for domain dispute self-representation. Not a law firm.

## Status

**Phase 1 · Week 1 · Day 0** — initial scaffolding shipped.

## Quick Start (Web)

Read `docs/WEEK_1_RUNBOOK.md` first. It walks you through Day 1 → Day 7 step by step.

## Codebase Map

```
domaindispute-app/
├── supabase/                 # Database migrations (apply via SQL Editor)
│   ├── 0001_init.sql         # Tables: cases, analyses, leads, etc.
│   ├── 0002_indexes.sql      # Performance indexes incl. pgvector HNSW
│   └── 0003_rls.sql          # Row-level security policies
├── scrapers/
│   ├── common.py             # Shared HTTP client, Supabase client, run tracking
│   ├── wipo/scraper.py       # WIPO scraper
│   ├── forum/scraper.py      # Forum/NAF scraper
│   └── live/scraper.py       # Hourly live-filings scraper
├── web/                      # Next.js 15 app
├── .github/workflows/
│   └── scrapers.yml          # Daily WIPO, weekly Forum, hourly live-filings
├── docs/
│   └── WEEK_1_RUNBOOK.md     # Step-by-step founder runbook
├── pyproject.toml            # Python deps + dev tools
├── .env.example              # Environment variable template
└── README.md                 # this file
```

## Compliance Posture

This project operates under a **self-help platform** model, not a law firm model:

- We do not file documents on behalf of users
- We do not provide legal advice
- We do not establish attorney-client relationships
- UDRP Rules ¶ 4(b) and the supplemental rules of every ICANN-approved provider expressly permit self-representation
- Three-layer disclaimer architecture is enforced site-wide

Quebec carve-out: Quebec-IP-detected purchases of Tier 2/3 are blocked at checkout until in-house counsel is engaged. Tier 1 (analysis-only) remains available globally.

## License

Proprietary. © 2026 DomainDispute.com. All rights reserved.
