-- =============================================================================
-- DomainDispute.com — Database Indexes
-- Migration: 0002_indexes.sql
-- =============================================================================

-- cases: lookup indexes
create index if not exists idx_cases_provider_number on cases (provider, case_number);
create index if not exists idx_cases_decision_date_desc on cases (decision_date desc nulls last);
create index if not exists idx_cases_outcome on cases (outcome);
create index if not exists idx_cases_published_recent on cases (is_published, decision_date desc) where is_published = true;
create index if not exists idx_cases_curated on cases (is_curated) where is_curated = true;

-- cluster_tag and domains arrays — GIN indexes for array operators
create index if not exists idx_cases_cluster_tag_gin on cases using gin (cluster_tag);
create index if not exists idx_cases_domains_gin on cases using gin (domains);

-- pgvector HNSW index for similarity search (the RAG foundation)
create index if not exists idx_cases_embedding_hnsw on cases using hnsw (analysis_embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64)
  where analysis_embedding is not null;

-- live_filings: newest first
create index if not exists idx_live_filings_recent on live_filings (scraped_at desc);
create index if not exists idx_live_filings_provider_date on live_filings (provider, filing_date desc);

-- analyses: user dashboard queries
create index if not exists idx_analyses_user on analyses (user_id, created_at desc);
create index if not exists idx_analyses_status on analyses (status) where status != 'DELIVERED';
create index if not exists idx_analyses_pending_review on analyses (created_at) where status = 'AWAITING_REVIEW';

-- leads: funnel stage queries
create index if not exists idx_leads_email on leads (email);
create index if not exists idx_leads_source_stage on leads (source, funnel_stage);

-- scraper_runs: most recent first
create index if not exists idx_scraper_runs_recent on scraper_runs (scraper_name, started_at desc);

-- citations: graph traversal
create index if not exists idx_citations_citing on case_citations (citing_case_id);
create index if not exists idx_citations_cited on case_citations (cited_case_id);
