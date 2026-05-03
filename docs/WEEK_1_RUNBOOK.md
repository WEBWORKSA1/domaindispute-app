# Phase 1 - Week 1 - Founder Runbook

> **Goal:** By end of Week 1 Day 7, the case database is populated, scrapers running on cron, and three external dependency clocks (Stripe, Google Ads, sender domain) are ticking.

---

## Day 1 - Morning - Account creation (~2 hours)

### 1. Create Supabase project (15 min)
1. Go to https://supabase.com and sign up.
2. New Project: name `domaindispute-prod`, region close to Montreal.
3. Save the database password to 1Password.
4. Wait ~2 min to provision.
5. Settings -> API -> copy three values into `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (public)
   - `SUPABASE_SERVICE_ROLE_KEY` (SECRET - never commit)

### 2. Apply database migrations (10 min)
1. Supabase dashboard -> SQL Editor -> New query.
2. Paste contents of `supabase/0001_init.sql`. Run.
3. New query -> paste `supabase/0002_indexes.sql`. Run.
4. New query -> paste `supabase/0003_rls.sql`. Run.
5. Verify: Database -> Tables -> 9 tables visible.

### 3. Create GitHub repo (10 min)
1. New repo on github.com (private).
2. Name: `domaindispute-app`.
3. Push the codebase.
4. GitHub -> Settings -> Secrets and variables -> Actions -> New secret:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 4. Start wall-clock dependency clocks (60 min)

These have multi-day approvals. Start them today.

**4a. Stripe verification** - dashboard.stripe.com/register. Identity verification + business activation. Approval clears 1-3 business days.

**4b. Google Ads legal services category** - ads.google.com. Legal-services category review takes 5-10 business days. Describe DomainDispute as a "self-help legal information and document-preparation tool, not a law firm" - matches LegalZoom precedent.

**4c. Sender domain DKIM/SPF/DMARC (Brevo)** - Brevo dashboard -> add domaindispute.com. Add DNS records to Cloudflare:
- SPF (TXT): `v=spf1 include:spf.brevo.com ~all`
- DKIM: keys Brevo generates
- DMARC (TXT): `v=DMARC1; p=none; rua=mailto:dmarc@domaindispute.com;`

Sender warming requires 7-14 days propagation.

---

## Day 1 - Afternoon - Local dev (~2 hours)

### 5. Python environment
```bash
cd ~/projects/domaindispute-app
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### 6. Configure .env
```bash
cp .env.example .env
# fill in Supabase values from step 1
```

### 7. Smoke test WIPO scraper
```bash
python -m scrapers.wipo.scraper --year 2025 --max 5
```

Expected: 5 rows appear in Supabase `cases` table.

### 8. Smoke test Forum scraper
```bash
python -m scrapers.forum.scraper --max 5
```

---

## Day 2 - Backfill kickoff

### 9. WIPO 2024 backfill (24-48 hours)

**Option A - GitHub Actions:** Actions tab -> Scrapers workflow -> Run -> wipo_backfill_2024.

**Option B - local:**
```bash
nohup python -m scrapers.wipo.scraper --year 2024 > backfill_2024.log 2>&1 &
```

---

## Day 3 - Cron + observability

### 10. Verify scheduled GitHub Actions
- Daily WIPO at 06:00 UTC
- Weekly Forum at 07:00 UTC Mondays
- Hourly live-filings

### 11. Observability query
```sql
select scraper_name, status, cases_added, cases_updated,
       jsonb_array_length(coalesce(errors, '[]'::jsonb)) as error_count,
       started_at, completed_at - started_at as duration
  from scraper_runs
order by started_at desc
limit 50;
```

Run this every morning during Week 1.

---

## Days 4-7 - Site migration

Phase 1 Week 2 work (Next.js app reading from Supabase). Don't start until scrapers are reliable.

---

## End-of-Week-1 success criteria

- [ ] Supabase project live, all tables created
- [ ] WIPO 2024 backfill complete (~3,500-4,500 cases)
- [ ] WIPO 2025 backfill in progress
- [ ] Forum index scraped once
- [ ] GitHub Actions workflow has at least one successful run
- [ ] Stripe verification submitted
- [ ] Google Ads submitted for legal-services review
- [ ] Sender DKIM/SPF/DMARC propagated

---

## Troubleshooting

**"WIPO scraper found 0 cases"** - WIPO restructured the page. Update parse_index_page() selectors.

**"service_role key invalid"** - Check `.env` - use the SECRET service role key, not the anon public key.

**"GitHub Action times out at 60 min"** - Backfills exceed default. Use `wipo-backfill` job with timeout-minutes: 360.

**"Stripe approval slow"** - Normal for legal-services. Email support@stripe.com after 5 business days.

**"Google Ads asks if we are a law firm"** - Reply: "DomainDispute.com is a self-help research and document-preparation platform - not a law firm. UDRP Rules section 4(b) expressly permits self-representation. Similar to LegalZoom precedent."
