-- =============================================================================
-- DomainDispute.com — Database Schema v1.0
-- Migration: 0001_init.sql
-- =============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";
create extension if not exists "pg_trgm";

-- CORE TABLE: cases
create table cases (
  id                   uuid primary key default uuid_generate_v4(),
  provider             text not null check (provider in ('WIPO', 'FORUM', 'CAC', 'ADNDRC', 'CIIDRC', 'ACDR', 'OTHER')),
  case_number          text not null,
  decision_url         text not null,
  raw_html_s3_key      text,
  filing_date          date,
  decision_date        date,
  scraped_at           timestamptz not null default now(),
  complainant_name     text,
  complainant_country  text,
  respondent_name      text,
  respondent_country   text,
  domains              text[] not null default '{}',
  domain_count         integer generated always as (cardinality(domains)) stored,
  panelists            text[] default '{}',
  panel_size           integer check (panel_size in (1, 3)),
  language             text default 'en',
  outcome              text check (outcome in ('TRANSFER', 'DENY', 'RDNH', 'SUSPEND', 'WITHDRAWN', 'PENDING', 'OTHER')),
  analysis_text        text,
  analysis_embedding   vector(1536),
  cluster_tag          text[] default '{}',
  is_curated           boolean not null default false,
  is_published         boolean not null default false,
  source_quality       text check (source_quality in ('PRIMARY', 'AGGREGATOR', 'COMMENTARY')),
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (provider, case_number)
);

create table case_citations (
  id              uuid primary key default uuid_generate_v4(),
  citing_case_id  uuid not null references cases(id) on delete cascade,
  cited_case_id   uuid not null references cases(id) on delete cascade,
  context         text,
  created_at      timestamptz not null default now(),
  unique (citing_case_id, cited_case_id)
);

create table panelists (
  id            uuid primary key default uuid_generate_v4(),
  full_name     text not null unique,
  country       text,
  providers     text[] default '{}',
  case_count    integer default 0,
  transfer_rate numeric(5,4),
  rdnh_rate     numeric(5,4),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table live_filings (
  id              uuid primary key default uuid_generate_v4(),
  provider        text not null,
  case_number     text not null,
  filing_date     date,
  domains         text[] default '{}',
  complainant     text,
  status          text default 'FILED' check (status in ('FILED', 'PENDING', 'DECIDED')),
  filing_url      text,
  scraped_at      timestamptz not null default now(),
  promoted_to_case_id uuid references cases(id),
  unique (provider, case_number)
);

create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  display_name          text,
  jurisdiction_country  text,
  jurisdiction_region   text,
  is_quebec_blocked     boolean generated always as (
    jurisdiction_country = 'CA' and jurisdiction_region = 'QC'
  ) stored,
  marketing_opt_in      boolean default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table analyses (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid not null references auth.users(id) on delete restrict,
  tier                     integer not null check (tier in (1, 2, 3)),
  stripe_payment_intent_id text,
  stripe_amount_cents      integer,
  paid_at                  timestamptz,
  case_facts               jsonb not null,
  user_role                text check (user_role in ('COMPLAINANT', 'RESPONDENT', 'COUNSEL')),
  disputed_domains         text[],
  analysis_output          jsonb,
  prepared_filing_md       text,
  similar_cases            uuid[] default '{}',
  citation_verifier_pass   boolean,
  disclaimer_acknowledged  boolean default false,
  disclaimer_ack_at        timestamptz,
  disclaimer_ack_ip        inet,
  disclaimer_ack_ua        text,
  status                   text not null default 'INTAKE' check (status in (
    'INTAKE', 'PROCESSING', 'AWAITING_REVIEW', 'DELIVERED', 'REFUNDED', 'BLOCKED'
  )),
  delivered_at             timestamptz,
  refunded_at              timestamptz,
  reviewed_by              uuid references auth.users(id),
  reviewed_at              timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create table leads (
  id                 uuid primary key default uuid_generate_v4(),
  email              text not null,
  source             text check (source in ('ORGANIC', 'PAID_GOOGLE', 'PAID_LINKEDIN', 'OUTBOUND', 'REFERRAL', 'EMAIL_MAGNET', 'OTHER')),
  case_facts_summary jsonb,
  user_role          text,
  funnel_stage       text default 'EMAIL_CAPTURED' check (funnel_stage in (
    'EMAIL_CAPTURED', 'PRE_CHECK_DONE', 'TIER_1_PURCHASED', 'TIER_2_PURCHASED', 'TIER_3_PURCHASED', 'CHURNED'
  )),
  utm_source         text,
  utm_medium         text,
  utm_campaign       text,
  last_touch_at      timestamptz default now(),
  created_at         timestamptz not null default now()
);

create table email_subscribers (
  id              uuid primary key default uuid_generate_v4(),
  email           text not null unique,
  is_verified     boolean default false,
  verified_at     timestamptz,
  source          text,
  jurisdiction    text,
  unsubscribed_at timestamptz,
  created_at      timestamptz not null default now()
);

create table scraper_runs (
  id              uuid primary key default uuid_generate_v4(),
  scraper_name    text not null,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  status          text not null default 'RUNNING' check (status in ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL')),
  cases_added     integer default 0,
  cases_updated   integer default 0,
  errors          jsonb,
  notes           text
);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_cases_updated before update on cases
  for each row execute function update_updated_at();

create trigger trg_panelists_updated before update on panelists
  for each row execute function update_updated_at();

create trigger trg_profiles_updated before update on profiles
  for each row execute function update_updated_at();

create trigger trg_analyses_updated before update on analyses
  for each row execute function update_updated_at();
