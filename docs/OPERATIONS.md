# Operations: how the site stays fresh

## Automatic refresh (GitHub Actions, `.github/workflows/scrapers.yml`)

| Job | When | What it does |
|---|---|---|
| Live docket | Hourly | Reads WIPO's filed-case list (casesx), upserts the newest ranges into `live_filings` with commencement date and status (FILED = compliance review, PENDING = commenced, DECIDED = closed). Every 6th hour it widens to the last 8 ranges so older open cases close out. Also pulls the newest decisions for the current year into `cases`. |
| Decisions | Daily 06:00 UTC | `--year 2025` plus the current year automatically (and the previous year in Jan–Feb). Every range is rescanned (~30 requests per year); only new or changed rows are written, so gaps heal themselves. |
| Backfill | Manual | `--year 2024` (plus the current year). Pass more years locally with repeated `--year`. |
| Forum | Weekly | Forum (ADR Forum) decisions. |

Every run writes an audit row to `scraper_runs` (status, rows added/updated, errors).

The site reads the database through cached pages: home and live docket every 15 minutes, daily brief hourly, statistics every 6 hours, case pages on first visit then every 6 hours, sitemap daily. No redeploy is needed for new data.

## Environment variables (Vercel project → Settings → Environment Variables)

Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Optional:

- `NEXT_PUBLIC_SITE_URL` (default `https://domainsdispute.com`)
- `CONTACT_FORWARD_EMAIL` - inbox that receives form submissions (a built-in default is used when unset; it is never sent to the browser)
- `NEXT_PUBLIC_ADSENSE_SLOT_INLINE`, `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR`, `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` - ad unit IDs; slots stay hidden until set (Auto ads work without them)
- `NEXT_PUBLIC_DONATE_CARD_URL`, `NEXT_PUBLIC_DONATE_PAYPAL_URL`, `NEXT_PUBLIC_DONATE_COFFEE_URL` - payment links on /support; without them the page collects pledges through the form

## Forms

Every form posts to `/api/forms`. Submissions are stored in `leads` and forwarded by email through FormSubmit. The first submission triggers a one-time "Activate form" email to the receiving inbox; click it once. Spam controls: honeypot field, minimum fill time, per-IP rate limit.

## AdSense checklist

- `ads.txt` is served at `/ads.txt`; the site meta tag and the AdSense script are in every page head.
- In AdSense, turn on Privacy & messaging → European regulations message (Google-certified CMP) before serving in the EEA/UK.
- Policy pages: /legal/privacy, /legal/terms, /legal/cookies, /legal/disclaimer, /legal/copyright, /about, /contact.
