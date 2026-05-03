/**
 * Database types matching the Supabase schema.
 * Source of truth: /supabase/0001_init.sql
 */

export type Provider = 'WIPO' | 'FORUM' | 'CAC' | 'ADNDRC' | 'CIIDRC' | 'ACDR' | 'OTHER';

export type Outcome =
  | 'TRANSFER'
  | 'DENY'
  | 'RDNH'
  | 'SUSPEND'
  | 'WITHDRAWN'
  | 'PENDING'
  | 'OTHER';

export type ClusterTag =
  | 'typosquatting'
  | 'famous-brand'
  | 'phishing'
  | 'celebrity'
  | 'ai-cctld'
  | 'generic-word'
  | 'acronym'
  | 'rdnh'
  | 'foundational'
  | 'urs'
  | 'cctld'
  | 'aged-domain';

export type SourceQuality = 'PRIMARY' | 'AGGREGATOR' | 'COMMENTARY';
export type Tier = 1 | 2 | 3;

export type AnalysisStatus =
  | 'INTAKE'
  | 'PROCESSING'
  | 'AWAITING_REVIEW'
  | 'DELIVERED'
  | 'REFUNDED'
  | 'BLOCKED';

export type FunnelStage =
  | 'EMAIL_CAPTURED'
  | 'PRE_CHECK_DONE'
  | 'TIER_1_PURCHASED'
  | 'TIER_2_PURCHASED'
  | 'TIER_3_PURCHASED'
  | 'CHURNED';

export type LeadSource =
  | 'ORGANIC'
  | 'PAID_GOOGLE'
  | 'PAID_LINKEDIN'
  | 'OUTBOUND'
  | 'REFERRAL'
  | 'EMAIL_MAGNET'
  | 'OTHER';

export interface CaseRow {
  id: string;
  provider: Provider;
  case_number: string;
  decision_url: string;
  raw_html_s3_key: string | null;
  filing_date: string | null;
  decision_date: string | null;
  scraped_at: string;
  complainant_name: string | null;
  complainant_country: string | null;
  respondent_name: string | null;
  respondent_country: string | null;
  domains: string[];
  domain_count: number;
  panelists: string[];
  panel_size: 1 | 3 | null;
  language: string;
  outcome: Outcome | null;
  analysis_text: string | null;
  analysis_embedding: number[] | null;
  cluster_tag: ClusterTag[];
  is_curated: boolean;
  is_published: boolean;
  source_quality: SourceQuality | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LiveFilingRow {
  id: string;
  provider: Provider;
  case_number: string;
  filing_date: string | null;
  domains: string[];
  complainant: string | null;
  status: 'FILED' | 'PENDING' | 'DECIDED';
  filing_url: string | null;
  scraped_at: string;
  promoted_to_case_id: string | null;
}

export interface ProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  jurisdiction_country: string | null;
  jurisdiction_region: string | null;
  is_quebec_blocked: boolean;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRow {
  id: string;
  user_id: string;
  tier: Tier;
  stripe_payment_intent_id: string | null;
  stripe_amount_cents: number | null;
  paid_at: string | null;
  case_facts: Record<string, unknown>;
  user_role: 'COMPLAINANT' | 'RESPONDENT' | 'COUNSEL' | null;
  disputed_domains: string[] | null;
  analysis_output: Record<string, unknown> | null;
  prepared_filing_md: string | null;
  similar_cases: string[];
  citation_verifier_pass: boolean | null;
  disclaimer_acknowledged: boolean;
  disclaimer_ack_at: string | null;
  disclaimer_ack_ip: string | null;
  disclaimer_ack_ua: string | null;
  status: AnalysisStatus;
  delivered_at: string | null;
  refunded_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadRow {
  id: string;
  email: string;
  source: LeadSource | null;
  case_facts_summary: Record<string, unknown> | null;
  user_role: string | null;
  funnel_stage: FunnelStage;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  last_touch_at: string | null;
  created_at: string;
}

export interface ScraperRunRow {
  id: string;
  scraper_name: string;
  started_at: string;
  completed_at: string | null;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
  cases_added: number;
  cases_updated: number;
  errors: Array<{ url: string; type: string; message: string }> | null;
  notes: string | null;
}

export interface Database {
  public: {
    Tables: {
      cases: {
        Row: CaseRow;
        Insert: Partial<CaseRow> & { provider: Provider; case_number: string; decision_url: string };
        Update: Partial<CaseRow>;
      };
      live_filings: {
        Row: LiveFilingRow;
        Insert: Partial<LiveFilingRow> & { provider: Provider; case_number: string };
        Update: Partial<LiveFilingRow>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: { id: string; email: string } & Partial<ProfileRow>;
        Update: Partial<ProfileRow>;
      };
      analyses: {
        Row: AnalysisRow;
        Insert: Pick<AnalysisRow, 'user_id' | 'tier' | 'case_facts'> & Partial<AnalysisRow>;
        Update: Partial<AnalysisRow>;
      };
      leads: {
        Row: LeadRow;
        Insert: { email: string } & Partial<LeadRow>;
        Update: Partial<LeadRow>;
      };
      scraper_runs: {
        Row: ScraperRunRow;
        Insert: { scraper_name: string } & Partial<ScraperRunRow>;
        Update: Partial<ScraperRunRow>;
      };
    };
  };
}
