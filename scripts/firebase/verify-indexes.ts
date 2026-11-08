import 'dotenv/config';
import { getContentDb } from '../content/firestore';

type IndexCheck = {
  name: string;
  run: () => Promise<unknown>;
};

const checks: IndexCheck[] = [
  {
    name: 'projects: published ordered by sortOrder',
    run: () =>
      getContentDb()
        .collection('projects')
        .where('status', '==', 'published')
        .orderBy('sortOrder', 'asc')
        .limit(1)
        .get(),
  },
  {
    name: 'projects: published ordered by featured and sortOrder',
    run: () =>
      getContentDb()
        .collection('projects')
        .where('status', '==', 'published')
        .orderBy('featured', 'asc')
        .orderBy('sortOrder', 'asc')
        .limit(1)
        .get(),
  },
  {
    name: 'blog: published ordered by publishedAt',
    run: () =>
      getContentDb()
        .collection('blog')
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(1)
        .get(),
  },
];

async function main() {
  let failures = 0;

  for (const check of checks) {
    try {
      await check.run();
      console.log(`PASS ${check.name}`);
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : 'unknown error';
      console.error(`FAIL ${check.name}: ${message}`);
    }
  }

  if (failures > 0) {
    console.error(
      '\nFirestore index preflight failed. Deploy firestore.indexes.json, wait for indexes to become READY, and run this command again.'
    );
    process.exitCode = 1;
    return;
  }

  console.log('\nFirestore compound index preflight passed.');
}

main().catch(error => {
  console.error(
    'Firestore index preflight failed:',
    error instanceof Error ? error.message : 'unknown error'
  );
  process.exitCode = 1;
});
