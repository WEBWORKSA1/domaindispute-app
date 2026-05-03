import { MeiliSearch } from 'meilisearch';

export const CASES_INDEX = 'cases';

export function adminClient() {
  const host = process.env.MEILISEARCH_HOST;
  const apiKey = process.env.MEILISEARCH_MASTER_KEY;
  if (!host || !apiKey) {
    throw new Error('Missing MEILISEARCH_HOST or MEILISEARCH_MASTER_KEY');
  }
  return new MeiliSearch({ host, apiKey });
}

export function searchClient() {
  const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST;
  const apiKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY;
  if (!host || !apiKey) {
    throw new Error('Missing MEILISEARCH search env vars');
  }
  return new MeiliSearch({ host, apiKey });
}

export interface CaseSearchDocument {
  id: string;
  case_number: string;
  provider: string;
  decision_date: string | null;
  filing_date: string | null;
  outcome: string | null;
  domains: string[];
  domains_text: string;
  complainant_name: string | null;
  respondent_name: string | null;
  panelists: string[];
  cluster_tag: string[];
  decision_url: string;
  analysis_text: string | null;
  decision_date_ts: number | null;
}

export const CASES_INDEX_SETTINGS = {
  searchableAttributes: [
    'domains_text',
    'case_number',
    'complainant_name',
    'respondent_name',
    'analysis_text',
    'panelists',
    'cluster_tag',
  ],
  filterableAttributes: ['provider', 'outcome', 'cluster_tag', 'panelists'],
  sortableAttributes: ['decision_date_ts', 'case_number'],
  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness',
    'decision_date_ts:desc',
  ],
  pagination: {
    maxTotalHits: 5000,
  },
};
