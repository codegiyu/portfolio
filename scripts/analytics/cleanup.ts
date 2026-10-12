import { Timestamp } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firestore';

const RETENTION_DAYS = 90;
const shouldPurgeLegacy = process.argv.includes('--purge-legacy');
const applyChanges = process.argv.includes('--apply');

async function deleteRefs(refs: FirebaseFirestore.DocumentReference[]) {
  const db = getDb();
  for (let index = 0; index < refs.length; index += 400) {
    const batch = db.batch();
    refs.slice(index, index + 400).forEach(ref => batch.delete(ref));
    await batch.commit();
  }
}

async function main() {
  const db = getDb();
  const cutoff = Timestamp.fromMillis(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const aggregateSnapshot = await db.collection('analyticsDaily').get();
  const oldAggregates = aggregateSnapshot.docs
    .filter(doc => doc.id < cutoff.toDate().toISOString().slice(0, 10))
    .map(doc => doc.ref);
  if (applyChanges) await deleteRefs(oldAggregates);

  let legacyDeleted = 0;
  if (shouldPurgeLegacy) {
    for (const collection of ['analytics', 'cv-downloads']) {
      const snapshot = await db.collection(collection).get();
      if (applyChanges) await deleteRefs(snapshot.docs.map(doc => doc.ref));
      legacyDeleted += snapshot.size;
    }
  }

  const action = applyChanges ? 'Removed' : 'Would remove';
  console.log(`${action} ${oldAggregates.length} expired aggregate analytics documents.`);
  if (shouldPurgeLegacy) console.log(`${action} ${legacyDeleted} legacy raw analytics documents.`);
}

main().catch(error => {
  console.error(
    JSON.stringify({
      code: 'ANALYTICS_CLEANUP_FAILED',
      errorName: error instanceof Error ? error.name : 'unknown',
    })
  );
  process.exitCode = 1;
});
