# Phase 1 - Week 2 - Founder Runbook

> **Goal:** By end of Week 2 Day 7, `domaindispute.com` is live on Vercel, dynamic case routes work, the live feed is updating hourly, and Meilisearch is indexing.

## Prerequisites

- [ ] Week 1 complete: scrapers populated at least 500 cases in Supabase
- [ ] Supabase project running with all 9 tables and RLS policies
- [ ] You have Cloudflare access to the `domaindispute.com` DNS zone
- [ ] You have a free Vercel account
- [ ] You can run `node 20+` locally

## Day 1 - Local dev environment (~90 min)

### 1. Set up the Next.js app

```bash
cd ~/projects/domaindispute-app/web
npm install
cp .env.local.example .env.local
# Edit .env.local with the same Supabase values you used for the scrapers
```

### 2. Run a Meilisearch instance locally

```bash
docker run -d \
  --name meili-dev \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=local-dev-key \
  getmeili/meilisearch:v1.10
```

### 3. Sync your case database into Meilisearch

```bash
npm run meilisearch:sync
```

If you get "Found 0 cases": your cases are scraped but not yet `is_published = true`. Run this SQL in Supabase to publish all cases temporarily:

```sql
update cases set is_published = true where is_published = false;
```

### 4. Start the Next.js dev server

```bash
npm run dev
```

Visit http://localhost:3000.

## Day 2 - Production Meilisearch on Hetzner

### 5. Provision the VPS

1. Sign up at hetzner.com
2. Create a CX22 instance (~5 EUR/mo, 2 vCPU, 4 GB RAM) Ubuntu 22.04 LTS
3. SSH in: `ssh root@<your-server-ip>`

### 6. Install Meilisearch on the VPS

```bash
curl -fsSL https://get.docker.com | sh

MEILI_KEY=$(openssl rand -hex 32)
echo "Master key: $MEILI_KEY"   # save to 1Password

mkdir -p /var/meili-data
docker run -d \
  --name meilisearch \
  --restart unless-stopped \
  -p 7700:7700 \
  -v /var/meili-data:/meili_data \
  -e MEILI_MASTER_KEY="$MEILI_KEY" \
  -e MEILI_ENV=production \
  getmeili/meilisearch:v1.10
```

### 7. Set up TLS with Caddy

```bash
apt install -y caddy
cat > /etc/caddy/Caddyfile <<EOF
search.domaindispute.com {
    reverse_proxy localhost:7700
}
EOF
systemctl reload caddy
```

In Cloudflare DNS: add `A search -> <vps-ip>` proxy off.

### 8. Generate browser-safe search-only API key

```bash
curl -X POST https://search.domaindispute.com/keys \
  -H "Authorization: Bearer $MEILI_KEY" \
  -H "Content-Type: application/json" \
  --data-binary '{"description": "Public search-only key", "actions": ["search"], "indexes": ["cases"], "expiresAt": null}'
```

Save the returned `key` value as `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY`.

## Day 3 - Vercel deployment

### 9-10. Connect Vercel

1. vercel.com -> Add New Project -> Import from GitHub
2. Root directory: `web/`
3. Add environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, SERVICE_ROLE_KEY, MEILISEARCH_HOST, etc.
4. Deploy

### 11. Connect the domain

1. Vercel -> Settings -> Domains -> add `domaindispute.com`
2. Add DNS records in Cloudflare (proxy: DNS only)

## Day 4 - Production Meilisearch sync

```bash
MEILISEARCH_HOST=https://search.domaindispute.com \
MEILISEARCH_MASTER_KEY=<vps-master-key> \
npm run meilisearch:sync
```

## Days 5-7 - Polish

### 14. Plausible Analytics
plausible.io -> 14-day trial -> add `domaindispute.com`

### 15. Sentry
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 16. Smoke-test production

- [ ] Homepage loads with live stats
- [ ] /cases index renders with pagination
- [ ] /cases/[caseNumber] resolves
- [ ] /live shows recent filings
- [ ] Lighthouse: 90+ Performance, 95+ SEO

## End-of-Week-2 success criteria

- [ ] `https://domaindispute.com` is publicly accessible
- [ ] Homepage shows live stats from Supabase
- [ ] /cases index page renders with pagination
- [ ] /cases/[caseNumber] dynamic routes resolve
- [ ] /live page shows real-time filings
- [ ] Meilisearch indexing on 6-hour cron
- [ ] Plausible tracking visits
- [ ] Sentry capturing errors

## Troubleshooting

**"Vercel build fails with Tailwind error"** - missing env var during build. Check build logs.

**"Cases page shows No cases match"** - check `is_published`. Run `update cases set is_published = true`.

**"Meilisearch sync hangs"** - `docker logs meilisearch` on VPS.

**"Supabase queries slow"** - verify indexes from 0002_indexes.sql were applied.
