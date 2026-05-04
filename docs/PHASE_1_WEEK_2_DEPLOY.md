# Phase 1 Week 2 - Production Deployment Quick Guide

> Everything you click yourself. The code is already on GitHub. The scrapers already work. This guide gets you from "code on GitHub" to "site live at domaindispute.com" in ~90 minutes total.

---

## Stage A - Backfill (5 min click, 4 hours runtime in background)

Goal: populate Supabase `cases` table with 8,000+ real WIPO decisions before any user visits the site.

### A1. Run 2025 backfill

Browser -> https://github.com/webworksa1/domaindispute-app/actions

1. Click **Scrapers** in left sidebar
2. Click **Run workflow** (gray dropdown, top right)
3. Set:
   - Branch: `main`
   - Which scraper: **`wipo_current_year`**
   - Cap cases: **leave blank** (= unlimited)
4. Click green **Run workflow**

Walk away for ~30-45 minutes.

### A2. Run 2024 backfill

While A1 is running OR after, repeat:

1. **Run workflow** -> `wipo_backfill_2024` -> blank max_cases
2. Click green **Run workflow**

This runs ~3-4 hours on GitHub. Free runner minutes are plenty.

### A3. Verify after both complete

Supabase SQL editor: https://supabase.com/dashboard/project/toxrpdntuncdksvpgrqh/sql/new

```sql
SELECT 
  EXTRACT(YEAR FROM decision_date::date) AS year,
  COUNT(*) AS cases,
  COUNT(*) FILTER (WHERE outcome = 'TRANSFER') AS transferred,
  COUNT(*) FILTER (WHERE outcome = 'DENY') AS denied
FROM cases
WHERE provider = 'WIPO' AND decision_date IS NOT NULL
GROUP BY year ORDER BY year DESC;
```

Expected: ~3,000+ rows for 2025, ~5,300 for 2024.

---

## Stage B - Vercel deployment (15 min)

### B1. Sign up

vercel.com -> Sign up with GitHub (use the same `webworksa1` account)

Free Hobby plan is sufficient.

### B2. Import the project

1. Vercel dashboard -> **Add New** -> **Project**
2. Find `webworksa1/domaindispute-app` in the list -> **Import**
3. Configure project:
   - **Root Directory**: click "Edit" -> type `web` -> Save
   - Framework Preset: Next.js (auto-detected)
   - Build/Install/Output: leave defaults
4. **Environment Variables** - add three:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://toxrpdntuncdksvpgrqh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon key from Supabase dashboard, NOT service role) |
| `SUPABASE_SERVICE_ROLE_KEY` | (your service_role key) |

5. Click **Deploy**

Takes ~2-3 minutes. You get a URL like `domaindispute-app-XXX.vercel.app`.

### B3. Smoke-test the Vercel URL

Visit `https://domaindispute-app-XXX.vercel.app` - should show your homepage with live stats from Supabase.

---

## Stage C - Hetzner Meilisearch (30 min)

Optional for MVP launch but powers the search experience.

### C1. Sign up + provision

1. hetzner.com -> Sign up
2. Cloud -> Add Server:
   - Location: Falkenstein, Germany (cheapest)
   - Image: Ubuntu 22.04 LTS
   - Type: **CX22** (~5 EUR/month, 2 vCPU, 4GB RAM)
   - SSH Keys: add your public key (`cat ~/.ssh/id_rsa.pub` on Mac, paste)
   - Name: `meili-prod`
3. Click **Create & Buy now**

You get an IP address.

### C2. DNS in Cloudflare

Cloudflare DNS console for `domaindispute.com`:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `search` | `<your hetzner IP>` | DNS only (gray cloud) |

Important: gray cloud, NOT orange. Caddy needs direct port 443 access for TLS.

### C3. Run install script

SSH into the VPS:

```bash
ssh root@<your hetzner IP>
```

Then run:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/webworksa1/domaindispute-app/main/infra/hetzner-meilisearch-setup.sh)
```

Wait ~3 minutes. The script outputs **two keys** at the end:
- `MEILISEARCH_MASTER_KEY` (admin) - save to 1Password
- `SEARCH_KEY` (public, browser-safe) - also save

### C4. Add Meilisearch env vars to Vercel

Vercel project -> Settings -> Environment Variables. Add four:

| Name | Value |
|------|-------|
| `MEILISEARCH_HOST` | `https://search.domaindispute.com` |
| `MEILISEARCH_MASTER_KEY` | (master key from script) |
| `NEXT_PUBLIC_MEILISEARCH_HOST` | `https://search.domaindispute.com` |
| `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` | (search key from script) |

Vercel -> Deployments -> click latest -> **Redeploy** to pick up new vars.

### C5. Sync cases into Meilisearch

On your Mac in `~/projects/domaindispute-app/web`:

```bash
# Add to .env.local first:
echo "MEILISEARCH_HOST=https://search.domaindispute.com" >> .env.local
echo "MEILISEARCH_MASTER_KEY=<your-master-key>" >> .env.local

npm install
npm run meilisearch:sync
```

Takes 2-5 minutes depending on backfill size. Reports `Documents in index: 8000+` when done.

---

## Stage D - Domain (5 min)

### D1. Add Vercel domain

Vercel project -> Settings -> Domains -> Add `domaindispute.com`

Vercel shows you required DNS records.

### D2. DNS in Cloudflare

Cloudflare DNS for `domaindispute.com`:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `76.76.21.21` (Vercel's IP, may differ - use what Vercel shows) | DNS only |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only |

Wait 5-10 minutes for propagation + Vercel TLS issuance.

### D3. Visit https://domaindispute.com

Should load your homepage. Done.

---

## Done. What now?

You're live at `https://domaindispute.com` with:
- 8,000+ real WIPO cases in your database
- Full Next.js app deployed on Vercel
- Fast search via Meilisearch
- Auto-renewing TLS certificates
- Hourly scraper cron keeping data fresh
- Daily WIPO backfill via cron

Phase 1 Week 1+2 = done.

Phase 1 Week 3 = SEO content, Pre-Check funnel polish, daily email cron, Brevo setup. See `web/docs/WEEK_3_RUNBOOK.md`.

---

## Total cost so far

| Item | Monthly |
|------|---------|
| Supabase (Free tier - 500MB) | $0 |
| Vercel (Hobby plan) | $0 |
| Hetzner CX22 | ~$6 |
| Cloudflare DNS | $0 |
| GitHub Actions (private repo, 2000 min/month free) | $0 |
| Domain (already owned) | $0 amortized |
| **Total** | **~$6/month** |

Phase 2 starts adding Stripe + Brevo paid tier when you have customers.
