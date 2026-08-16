import 'dotenv/config';
import { getContentDb } from './firestore';
import { LOCAL_FALLBACKS } from '@/lib/settings';

const requiredByCollection: Record<'projects' | 'blog', string[]> = {
  projects: [
    'id',
    'slug',
    'title',
    'description',
    'longDescription',
    'image',
    'gallery',
    'skills',
    'challenge',
    'solution',
    'results',
    'liveLink',
    'sourceLink',
    'featured',
    'category',
    'status',
    'publishAt',
    'publishedAt',
    'sortOrder',
    'createdAt',
    'updatedAt',
    'schemaVersion',
    'sourceHash',
    'version',
  ],
  blog: [
    'id',
    'slug',
    'title',
    'excerpt',
    'bodyMarkdown',
    'tags',
    'coverImage',
    'author',
    'publishedAt',
    'status',
    'publishAt',
    'createdAt',
    'updatedAt',
    'schemaVersion',
    'sourceHash',
    'version',
  ],
};

async function main() {
  let failures = 0;
  for (const collection of ['projects', 'blog']) {
    const snapshot = await getContentDb().collection(collection).get();
    const slugs = new Set<string>();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      for (const field of requiredByCollection[collection as 'projects' | 'blog'])
        if (!(field in data)) {
          console.error(`${collection}/${doc.id}: missing ${field}`);
          failures += 1;
        }
      if (slugs.has(String(data.slug))) {
        console.error(`${collection}: duplicate slug ${data.slug}`);
        failures += 1;
      }
      slugs.add(String(data.slug));
      const reservation = await getContentDb()
        .collection('contentSlugs')
        .doc(`${collection === 'projects' ? 'project' : 'post'}:${data.slug}`)
        .get();
      if (!reservation.exists || reservation.data()?.contentId !== doc.id) {
        console.error(`${collection}/${doc.id}: missing or incorrect slug reservation`);
        failures += 1;
      }
    }
    console.log(`${collection}: ${snapshot.size} documents verified`);
  }
  for (const key of Object.keys(LOCAL_FALLBACKS)) {
    const snapshot = await getContentDb().collection('settings').doc(key).get();
    if (!snapshot.exists) {
      console.error(`settings/${key}: missing settings document`);
      failures += 1;
      continue;
    }
    const data = snapshot.data() ?? {};
    if (!('version' in data) || !('updatedAt' in data)) {
      console.error(`settings/${key}: missing version or updatedAt`);
      failures += 1;
    }
  }
  if (failures) process.exitCode = 1;
}

main().catch(error => {
  console.error('Verification failed:', error instanceof Error ? error.message : 'unknown error');
  process.exitCode = 1;
});
