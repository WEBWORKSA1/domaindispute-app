# Phase 2 — Research Service (Similar Case Matcher)

> Captured 2026-05-04 from customer conversations. Build *after* Phase 1 ships and validates with first 5 paying customers.

---

## The pitch

> "Paste your domain dispute facts. We find the 12 most similar past UDRP/URS cases, show you how the panel ruled, and explain why."

Pre-Check Plus tier — sits between current $99 (DIY checklist) and $499 (full case prep). Target price: **$199–$299**.

---

## Why now (later)

**Customer signal:** in conversations with target customers, the recurring question wasn't "how do I file?" — it was **"will I win?"**. They want pattern certainty before committing time/money.

**What current product does:** static Case Library + 12 cluster patterns (good for browsing).
**What this adds:** *active* case-by-case matching against the customer's specific facts.

---

## Architecture sketch

### Data layer (already exists or trivial)
- `cases` table in Supabase with all WIPO/Forum decisions (have ~8K, growing daily)
- `pgvector` extension already enabled (Architecture §4 Track A)

### Embedding pipeline (one-time backfill + ongoing)
- For each case, generate embedding from `(complainant_name + respondent_name + domain + outcome + extracted_reasoning_summary)`
- Store as `cases.embedding vector(1536)` column (OpenAI ada-002 or text-embedding-3-small)
- One-time cost: ~$0.80 for 8,000 cases via `text-embedding-3-small`
- Ongoing: ~$0.0001 per new case scraped

### Reasoning extraction (one-time backfill + ongoing)
- For each case decision URL, fetch the full HTML, send to Claude/GPT
- Extract: panel reasoning, key precedents cited, outcome justification, complainant theory, respondent defense
- Store as JSON in `cases.panel_reasoning` jsonb column
- One-time cost: ~$400 for 8,000 cases via Claude Haiku
- Ongoing: ~$0.05 per new case

### Customer query flow
1. Customer fills form: domain in dispute, complainant name, key facts (3–5 fields)
2. Generate embedding from customer's input
3. pgvector cosine similarity → top 50 cases
4. Re-rank top 50 with Claude/GPT considering jurisdictional fit + recency
5. Return top 12 with: outcome, panel reasoning summary, "why this matches your case"
6. Bonus: predicted outcome probability + confidence interval

---

## Pricing model

| Tier | Price | What they get |
|------|-------|---------------|
| Pre-Check (current) | $99 | DIY checklist + pattern library access |
| **Pre-Check Plus (new)** | **$199–$299** | All of above + similar case match + reasoning |
| Pre-Check Pro (current $499) | $499 | All above + 1-on-1 strategy review |
| Full Case Prep (current $1,499) | $1,499 | Filed-ready document package |

Pre-Check Plus is the natural upgrade for tier-1 customers who want more confidence before paying tier-3 prices.

---

## Defensibility

1. **Data moat** — 2–3 years of indexed decisions before competitors notice
2. **Quality moat** — once panel reasoning extraction is tuned, hard to replicate
3. **Brand moat** — "DomainDispute is where you check before filing" becomes default

---

## Risks

1. **Hallucination risk.** If the matcher returns a "wrong" similar case to a lawyer-grade audience, credibility collapses. Mitigation: always show source URL + panel name + decision date so customers can verify.

2. **Quality of reasoning extraction.** Panel decisions are dense legal text. Extracting clean structured reasoning is non-trivial. Mitigation: human review of first 100 extractions before going live.

3. **Regulatory ambiguity.** "We predict outcomes" sounds like legal advice. Mitigation: frame as "find similar cases," not "predict your outcome." Disclaimer-heavy.

4. **Scope creep risk.** Building this *before* Phase 1 ships is the founder trap. Don't.

---

## Sequencing

**Don't build until:**
- Phase 1 site is fully functional (current sprint)
- Custom domain pointing
- 5+ paying tier-1 customers ($99 each)
- Customer interviews confirm willingness to pay $199–299 for this specific feature

**Then build:**
- Sprint 1 (1 week): embedding backfill + pgvector similarity query API
- Sprint 2 (2 weeks): reasoning extraction backfill (Claude Haiku batch)
- Sprint 3 (1 week): customer-facing query UI on `/research` route
- Sprint 4 (1 week): pricing/checkout for new tier
- Total: ~5 weeks dedicated

**Don't fall in love with the idea before validation.** If first 5 customers say "I just want the checklist," ignore this doc.

---

## Open questions

- Should this be exposed publicly (free preview, paywall on full match) or fully gated?
- Does it work for ccTLD disputes (less data) or only gTLD?
- Could this be sold B2B to law firms ("research subscription, $499/mo")?

Park these for customer validation conversations.
