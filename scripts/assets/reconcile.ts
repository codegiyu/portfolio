import { getDb } from '@/lib/firestore';
import { listR2Keys, r2KeyFromUrl } from '@/lib/r2';

function collectStrings(value: unknown, output: Set<string>) {
  if (typeof value === 'string') {
    const key = r2KeyFromUrl(value);
    if (key) output.add(key);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectStrings(item, output));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach(item => collectStrings(item, output));
  }
}

async function main() {
  const referenced = new Set<string>();
  const db = getDb();
  for (const collection of ['projects', 'blog', 'settings']) {
    const snapshot = await db.collection(collection).get();
    snapshot.docs.forEach(doc => collectStrings(doc.data(), referenced));
  }

  const objects = await listR2Keys();
  const orphaned = objects.filter(key => !referenced.has(key));
  console.log(`R2 assets: ${objects.length}`);
  console.log(`Referenced assets: ${referenced.size}`);
  console.log(`Potential orphans: ${orphaned.length}`);
  orphaned.forEach(key => console.log(key));
  console.log(
    'No objects were deleted. Review the list and remove only confirmed orphans manually.'
  );
}

main().catch(error => {
  console.error(
    JSON.stringify({
      code: 'ASSET_RECONCILIATION_FAILED',
      errorName: error instanceof Error ? error.name : 'unknown',
    })
  );
  process.exitCode = 1;
});
