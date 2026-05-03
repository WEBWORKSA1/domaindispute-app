-- =============================================================================
-- DomainDispute.com — Row Level Security
-- Migration: 0003_rls.sql
-- =============================================================================

-- CASES
alter table cases enable row level security;
create policy "Published cases are publicly readable" on cases for select using (is_published = true);
create policy "Service role has full access to cases" on cases for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- PANELISTS
alter table panelists enable row level security;
create policy "Panelists are publicly readable" on panelists for select using (true);
create policy "Service role has full access to panelists" on panelists for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- LIVE_FILINGS
alter table live_filings enable row level security;
create policy "Live filings are publicly readable" on live_filings for select using (true);
create policy "Service role has full access to live filings" on live_filings for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- CASE_CITATIONS
alter table case_citations enable row level security;
create policy "Case citations are publicly readable" on case_citations for select using (true);
create policy "Service role has full access to citations" on case_citations for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- PROFILES
alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can insert their own profile on signup" on profiles for insert with check (auth.uid() = id);

-- ANALYSES
alter table analyses enable row level security;
create policy "Users can view their own analyses" on analyses for select using (auth.uid() = user_id);
create policy "Users can create their own analyses" on analyses for insert with check (auth.uid() = user_id);
create policy "Service role has full access to analyses" on analyses for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- LEADS
alter table leads enable row level security;
create policy "Service role has full access to leads" on leads for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- EMAIL_SUBSCRIBERS
alter table email_subscribers enable row level security;
create policy "Service role has full access to subscribers" on email_subscribers for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- SCRAPER_RUNS
alter table scraper_runs enable row level security;
create policy "Service role has full access to scraper runs" on scraper_runs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
