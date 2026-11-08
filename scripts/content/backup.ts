import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { getContentDb } from './firestore';

const collections = ['projects', 'blog', 'settings', 'contentSlugs'];
const timestampMarker = '__firestoreTimestamp';

function serializable(value: unknown): unknown {
  if (value instanceof Timestamp) return { [timestampMarker]: value.toDate().toISOString() };
  if (Array.isArray(value)) return value.map(serializable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializable(item)])
    );
  }
  return value;
}

async function main() {
  const output =
    process.argv[2] ||
    path.join(process.cwd(), 'backups', new Date().toISOString().replace(/[:.]/g, '-'));
  fs.mkdirSync(output, { recursive: true });
  const manifest: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    collections: {},
  };
  for (const collection of collections) {
    const snapshot = await getContentDb().collection(collection).get();
    const records = snapshot.docs.map(doc => ({ id: doc.id, data: serializable(doc.data()) }));
    const file = path.join(output, `${collection}.json`);
    fs.writeFileSync(file, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
    const checksum = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    (manifest.collections as Record<string, unknown>)[collection] = {
      count: records.length,
      file: path.basename(file),
      sha256: checksum,
    };
    console.log(`${collection}: ${records.length}`);
  }
  fs.writeFileSync(
    path.join(output, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  );
  console.log(`Backup written to ${output}`);
}

main().catch(error => {
  console.error('Backup failed:', error instanceof Error ? error.message : 'unknown error');
  process.exitCode = 1;
});
