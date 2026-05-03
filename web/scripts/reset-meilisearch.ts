#!/usr/bin/env node
/**
 * Reset Meilisearch index - destructive.
 */

import 'dotenv/config';
import { adminClient, CASES_INDEX } from '../lib/meilisearch/client';

async function main() {
  console.log(`Resetting Meilisearch index "${CASES_INDEX}"...`);
  const meili = adminClient();

  try {
    const task = await meili.deleteIndex(CASES_INDEX);
    await meili.waitForTask(task.taskUid);
    console.log('Index deleted. Run pnpm meilisearch:sync to rebuild.');
  } catch (e: unknown) {
    const error = e as { code?: string };
    if (error?.code === 'index_not_found') {
      console.log('Index did not exist - nothing to delete.');
    } else {
      throw e;
    }
  }
}

main().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
