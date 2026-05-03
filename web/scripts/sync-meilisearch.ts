#!/usr/bin/env node
/**
 * Meilisearch sync script.
 * Pulls all published cases from Supabase and indexes them in Meilisearch.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { adminClient, CASES_INDEX, CASES_INDEX_SETTINGS, type CaseSearchDocument } from '../lib/meilisearch/client';
import type { Database } from '../types/database';

const BATCH_SIZE = 500;

async function main() {
  console.log('Starting Meilisearch sync...');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceKey);
  const meili = adminClient();

  console.log('Configuring Meilisearch index...');
  try {
    await meili.createIndex(CASES_INDEX, { primaryKey: 'id' });
  } catch (e: unknown) {
    const error = e as { code?: string; httpStatus?: number };
    if (error?.code !== 'index_already_exists' && error?.httpStatus !== 409) {
      throw e;
    }
  }

  const index = meili.index(CASES_INDEX);
  const settingsTask = await index.updateSettings(CASES_INDEX_SETTINGS);
  await meili.waitForTask(settingsTask.taskUid);

  const { count: total, error: countError } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  if (countError) throw countError;
  console.log(`Found ${total ?? 0} published cases to index.`);

  if (!total || total === 0) {
    console.log('No cases to sync. Run scrapers first.');
    return;
  }

  let offset = 0;
  let totalIndexed = 0;
  const batchTasks: number[] = [];

  while (offset < total) {
    const { data: cases, error } = await supabase
      .from('cases')
      .select(
        'id, case_number, provider, decision_date, filing_date, outcome, domains, ' +
        'complainant_name, respondent_name, panelists, cluster_tag, decision_url, analysis_text',
      )
      .eq('is_published', true)
      .order('id')
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) throw error;
    if (!cases || cases.length === 0) break;

    const documents: CaseSearchDocument[] = cases.map((c) => ({
      id: c.id,
      case_number: c.case_number,
      provider: c.provider,
      decision_date: c.decision_date,
      filing_date: c.filing_date,
      outcome: c.outcome,
      domains: c.domains ?? [],
      domains_text: (c.domains ?? []).join(' '),
      complainant_name: c.complainant_name,
      respondent_name: c.respondent_name,
      panelists: c.panelists ?? [],
      cluster_tag: c.cluster_tag ?? [],
      decision_url: c.decision_url,
      analysis_text: c.analysis_text,
      decision_date_ts: c.decision_date
        ? Math.floor(new Date(c.decision_date).getTime() / 1000)
        : null,
    }));

    const task = await index.addDocuments(documents);
    batchTasks.push(task.taskUid);
    totalIndexed += documents.length;
    offset += BATCH_SIZE;

    console.log(`Queued ${totalIndexed} / ${total} cases`);
  }

  console.log(`Waiting for Meilisearch to process ${batchTasks.length} batches...`);
  for (const taskUid of batchTasks) {
    await meili.waitForTask(taskUid);
  }

  const stats = await index.getStats();
  console.log(`Sync complete. Documents in index: ${stats.numberOfDocuments}`);
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
