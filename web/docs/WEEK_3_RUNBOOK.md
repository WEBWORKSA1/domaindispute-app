# Phase 1 - Week 3 - Founder Runbook

> **Goal:** By end of Week 3, the 12 SEO cluster pages are live, hourly live-filings scraper is populating data, Pre-Check funnel captures leads, daily email template is ready.

## Prerequisites

- [ ] Week 1 complete: scrapers running, ~4,000+ cases in Supabase
- [ ] Week 2 complete: Next.js site live on Vercel at domaindispute.com
- [ ] Subscribers table exists

## Day 1 - Pull Week 3 changes (~30 min)

### 1. Sync the codebase

```bash
cd ~/projects/domaindispute-app
git pull

cd web/
npm install
```

### 2. Verify new routes locally

```bash
npm run dev
```

- http://localhost:3000/patterns - 12 cluster cards
- http://localhost:3000/patterns/typosquatting - full pattern guide
- http://localhost:3000/start - Pre-Check intake form

### 3. Test API endpoints

```bash
# Pre-Check API
curl -X POST http://localhost:3000/api/precheck \
  -H "Content-Type: application/json" \
  -d '{"role":"COMPLAINANT","domain":"test.com","hasTrademark":true,"domainOlderThanTM":false,"hasOfferedToBuy":false}'

# Subscribe API
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Day 2 - Hourly live-filings scraper

### 4. Test the scraper locally

```bash
cd ~/projects/domaindispute-app
source .venv/bin/activate
python -m scrapers.live.scraper --max 5
```

Should populate `live_filings` table with 5 rows.

### 5. Schedule the scraper on GitHub Actions

The scrapers.yml workflow already includes hourly cron: `0 * * * *`. After pushing to GitHub, verify Actions tab shows the workflow.

## Day 3 - Pre-Check funnel deployment

### 6. Deploy to Vercel

Push the Week 3 codebase. Vercel auto-deploys.

### 7. Smoke-test in production

- [ ] /patterns loads with 12 cards
- [ ] /patterns/typosquatting loads full guide
- [ ] /start captures email and inserts to leads + email_subscribers
- [ ] /api/precheck returns valid result
- [ ] /api/subscribe creates rows

## Day 4 - Daily email template

### 8. Set up Brevo account

1. brevo.com -> sign up (free tier: 300 emails/day)
2. Add `domaindispute.com` as sender domain
3. Add DKIM/SPF/DMARC records to Cloudflare (from Week 1 step 4c)
4. Verify domain in Brevo dashboard

### 9. Test the email template

```bash
cd ~/projects/domaindispute-app/web
node -e "
const { renderDailyCaseAlert } = require('./lib/email/daily-alert');
const result = renderDailyCaseAlert({
  recipientEmail: 'test@example.com',
  unsubscribeUrl: 'https://domaindispute.com/unsubscribe?token=test',
  newFilings: [],
  newDecisions: [],
  dateLabel: 'Saturday, May 3, 2026',
});
console.log(result.html);
" > /tmp/test-email.html
open /tmp/test-email.html
```

Visual check the rendered email.

## Day 5 - Send daily alert cron

Add to GitHub Actions (or Vercel Cron):

```yaml
# .github/workflows/daily-email.yml
name: Daily Email Alert
on:
  schedule:
    - cron: '0 14 * * *'  # 14:00 UTC = 9am EST
  workflow_dispatch:

jobs:
  send-alert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci --prefix web
      - run: node web/scripts/send-daily-alert.ts
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          BREVO_API_KEY: ${{ secrets.BREVO_API_KEY }}
```

## Days 6-7 - Lead-gen content kickoff

### 10. Pre-Check funnel SEO

Submit sitemap to Google Search Console:
- https://domaindispute.com/sitemap.xml

Get Pattern pages indexed first - they're the SEO assets.

### 11. Outbound lead-gen test

Pick 10 recent UDRP filings from /live and:
- Find the respondent on LinkedIn
- Send brief note: "Saw you're facing a UDRP at WIPO. Free Pre-Check at domaindispute.com if useful."

This is the Phase 1 outbound test - validate that the funnel converts before scaling.

## End-of-Week-3 success criteria

- [ ] /patterns and all 12 /patterns/[slug] routes render
- [ ] /start Pre-Check funnel captures leads
- [ ] /api/precheck and /api/subscribe both work in production
- [ ] live_filings table has hourly updates
- [ ] Daily email template renders cleanly
- [ ] Brevo sender domain verified
- [ ] First 5-10 organic visitors have run Pre-Check (check leads table)
- [ ] Sitemap submitted to Google Search Console

## Troubleshooting

**"/api/precheck returns 500"** - Check Vercel logs. Most likely SUPABASE_SERVICE_ROLE_KEY missing or the leads/email_subscribers tables aren't accepting the insert (RLS policy issue).

**"Pattern pages 404"** - Verify generateStaticParams returns all 12 slugs. Build logs show what was generated.

**"Daily email skipped recipients"** - Brevo free tier caps at 300/day. After 300 subscribers, upgrade to paid plan or chunk sends.

**"Live feed scraper hits rate limit"** - The polite client uses 3s/request. WIPO's all-cases page has ~50 entries, so one full scrape takes ~150s. Within hourly window comfortably.

## What's NOT in Week 3 (deferred to Week 4+)

- Tier 1 Claude API analysis (Phase 3)
- Stripe checkout (Phase 2)
- Authentication (Phase 3)
- User dashboards (Phase 3)
- Citation Verifier sub-agent (Phase 3)

Week 3 is the funnel layer. Phase 2 begins paid SaaS infrastructure.
