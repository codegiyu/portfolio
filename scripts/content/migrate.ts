import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Timestamp } from 'firebase-admin/firestore';
import { getContentDb } from './firestore';
import { projectToFirestore, postToFirestore } from '@/lib/server/content/adapters';
import {
  assertUniqueSlugs,
  parseLocalPosts,
  parseLocalProjects,
  type MigrationSource,
} from './parsers';
import type { PostInput, ProjectInput } from '@/lib/server/content/types';

type ReportKey = 'added' | 'updated' | 'skipped' | 'invalid' | 'conflicts' | 'missingAssets';
type Report = Record<ReportKey, string[]>;

const REQUIRED_FIELDS: Record<'project' | 'post', string[]> = {
  project: [
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
  post: [
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

const report: Report = {
  added: [],
  updated: [],
  skipped: [],
  invalid: [],
  conflicts: [],
  missingAssets: [],
};
const apply = process.argv.includes('--apply');
const force = process.argv.includes('--force');
const now = Timestamp.now();

function retryable(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  return code.includes('unavailable') || code.includes('deadline') || code.includes('aborted');
}

function isCanonical(data: FirebaseFirestore.DocumentData, kind: 'project' | 'post') {
  return REQUIRED_FIELDS[kind].every(field => field in data);
}

function reportMissingAssets(
  kind: 'project' | 'post',
  source: MigrationSource<ProjectInput | PostInput>
) {
  const input = source.input;
  const assets =
    kind === 'project'
      ? [(input as ProjectInput).image, ...(input as ProjectInput).gallery]
      : [(input as PostInput).coverImage];
  for (const asset of assets) {
    if (typeof asset !== 'string' || !asset.startsWith('/')) continue;
    const localPath = path.join(process.cwd(), 'public', asset.slice(1));
    if (!fs.existsSync(localPath)) report.missingAssets.push(`${kind}:${source.slug}:${asset}`);
  }
}

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!retryable(error) || attempt === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 100 * 2 ** attempt));
    }
  }
  throw lastError;
}

function sameProjectSource(
  existing: FirebaseFirestore.DocumentData,
  source: MigrationSource<ProjectInput>
) {
  return (
    existing.slug === source.input.slug &&
    existing.title === source.input.title &&
    existing.description === source.input.description &&
    existing.image === source.input.image
  );
}

function samePostSource(
  existing: FirebaseFirestore.DocumentData,
  source: MigrationSource<PostInput>
) {
  return (
    existing.slug === source.input.slug &&
    existing.title === source.input.title &&
    (existing.bodyMarkdown ?? existing.content) === source.input.bodyMarkdown
  );
}

async function migrateOne<T extends ProjectInput | PostInput>(
  kind: 'project' | 'post',
  source: MigrationSource<T>
) {
  const db = getContentDb();
  const collection = kind === 'project' ? 'projects' : 'blog';
  const slugReservation = db.collection('contentSlugs').doc(`${kind}:${source.slug}`);
  const snapshot = await db.collection(collection).where('slug', '==', source.slug).limit(1).get();
  const existing = snapshot.empty ? null : snapshot.docs[0];
  if (existing) {
    const data = existing.data();
    const reservation = await slugReservation.get();
    const reservationIsCanonical =
      reservation.exists && reservation.data()?.contentId === existing.id;
    const needsBackfill = !isCanonical(data, kind) || !reservationIsCanonical;
    if (data.sourceHash === source.sourceHash && !needsBackfill) {
      report.skipped.push(`${kind}:${source.slug}`);
      return;
    }
    const sourceMatches =
      kind === 'project'
        ? sameProjectSource(data, source as MigrationSource<ProjectInput>)
        : samePostSource(data, source as MigrationSource<PostInput>);
    if (data.sourceHash !== source.sourceHash && !sourceMatches && !force) {
      report.conflicts.push(`${kind}:${source.slug}`);
      return;
    }
    report.updated.push(`${kind}:${source.slug}`);
    if (!apply) return;
    await withRetry(() =>
      db.runTransaction(async transaction => {
        const current = await transaction.get(existing.ref);
        const currentData = current.data() ?? {};
        const stableNow = current.updateTime ?? now;
        const canonical =
          kind === 'project'
            ? {
                ...projectToFirestore(
                  source.input as ProjectInput,
                  existing.id,
                  stableNow,
                  typeof currentData.version === 'number' ? currentData.version + 1 : 1
                ),
                ...currentData,
                status: currentData.status ?? 'published',
                publishedAt:
                  currentData.publishedAt ?? (currentData.status === 'draft' ? null : now),
                sortOrder: currentData.sortOrder ?? 0,
                schemaVersion: currentData.schemaVersion ?? 1,
                version: currentData.version ?? 1,
                id: existing.id,
              }
            : {
                ...postToFirestore(
                  source.input as PostInput,
                  existing.id,
                  stableNow,
                  typeof currentData.version === 'number' ? currentData.version + 1 : 1
                ),
                ...currentData,
                status: currentData.status ?? (source.input as PostInput).status,
                publishedAt:
                  currentData.publishedAt ??
                  ((currentData.status ?? (source.input as PostInput).status) === 'published'
                    ? Timestamp.fromDate(new Date((source.input as PostInput).publishedAt))
                    : null),
                schemaVersion: currentData.schemaVersion ?? 1,
                version: currentData.version ?? 1,
                id: existing.id,
              };
        if (force) {
          Object.assign(
            canonical,
            kind === 'project'
              ? projectToFirestore(
                  source.input as ProjectInput,
                  existing.id,
                  stableNow,
                  (currentData.version ?? 1) + 1
                )
              : postToFirestore(
                  source.input as PostInput,
                  existing.id,
                  stableNow,
                  (currentData.version ?? 1) + 1
                )
          );
          if (currentData.createdAt) canonical.createdAt = currentData.createdAt;
        }
        transaction.set(
          existing.ref,
          { ...canonical, sourceHash: source.sourceHash, updatedAt: now },
          { merge: true }
        );
        transaction.set(
          slugReservation,
          { contentType: kind, contentId: existing.id, slug: source.slug, createdAt: stableNow },
          { merge: true }
        );
      })
    );
    return;
  }
  report.added.push(`${kind}:${source.slug}`);
  if (!apply) return;
  const ref = db.collection(collection).doc();
  await withRetry(() =>
    db.runTransaction(async transaction => {
      const reservation = await transaction.get(slugReservation);
      if (reservation.exists) throw new Error(`Slug reservation conflict: ${kind}:${source.slug}`);
      const data =
        kind === 'project'
          ? projectToFirestore(source.input as ProjectInput, ref.id, now, 1)
          : postToFirestore(source.input as PostInput, ref.id, now, 1);
      transaction.create(ref, { ...data, sourceHash: source.sourceHash });
      transaction.create(slugReservation, {
        contentType: kind,
        contentId: ref.id,
        slug: source.slug,
        createdAt: now,
      });
    })
  );
}

async function main() {
  let projects: MigrationSource<ProjectInput>[] = [];
  let posts: MigrationSource<PostInput>[] = [];
  try {
    projects = parseLocalProjects();
  } catch (error) {
    report.invalid.push(`projects: ${error instanceof Error ? error.message : 'invalid input'}`);
  }
  try {
    posts = parseLocalPosts();
  } catch (error) {
    report.invalid.push(`blog: ${error instanceof Error ? error.message : 'invalid input'}`);
  }
  try {
    if (projects.length) assertUniqueSlugs(projects);
    if (posts.length) assertUniqueSlugs(posts);
  } catch (error) {
    report.invalid.push(error instanceof Error ? error.message : 'duplicate slug');
  }
  if (report.invalid.length) {
    console.log('Input validation failed; no writes performed');
    console.log(`invalid: ${report.invalid.length}`);
    process.exitCode = 2;
    return;
  }
  for (const source of projects) reportMissingAssets('project', source);
  for (const source of posts) reportMissingAssets('post', source);
  if (report.missingAssets.length) {
    console.warn('Missing local assets:');
    for (const asset of report.missingAssets) console.warn(`  ${asset}`);
  }
  for (const source of projects) await migrateOne('project', source);
  for (const source of posts) await migrateOne('post', source);
  console.log(apply ? 'Migration applied' : 'Dry run only; no writes performed');
  for (const key of Object.keys(report) as ReportKey[])
    console.log(`${key}: ${report[key].length}`);
  if (report.invalid.length || report.conflicts.length) process.exitCode = 2;
}

main().catch(error => {
  console.error('Migration failed:', error instanceof Error ? error.message : 'unknown error');
  process.exitCode = 1;
});
