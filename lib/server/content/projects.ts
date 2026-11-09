import 'server-only';

import { Timestamp, type DocumentSnapshot } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firestore';
import {
  ContentConflictError,
  ContentNotFoundError,
  ContentUnavailableError,
  ContentValidationError,
} from './errors';
import { cachedContent } from './cache';
import { isPubliclyVisible, projectFromSnapshot, projectToFirestore } from './adapters';
import { projectInputSchema, projectUpdateSchema } from './schemas';
import type { ContentListOptions, ProjectInput, ProjectRecord } from './types';
import { assetUrls, cleanupReplacedAssets } from '@/lib/server/assets';

const COLLECTION = 'projects';
const SLUG_COLLECTION = 'contentSlugs';

function slugRef(slug: string) {
  return getDb().collection(SLUG_COLLECTION).doc(`project:${slug}`);
}

function sortProjects(projects: ProjectRecord[]) {
  return projects.sort((a, b) => {
    if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    const created = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return created || a.id.localeCompare(b.id);
  });
}

async function listPublishedProjectsUncached(): Promise<ProjectRecord[]> {
  try {
    const snapshot = await getDb()
      .collection(COLLECTION)
      .where('status', '==', 'published')
      .orderBy('sortOrder', 'asc')
      .get();
    return sortProjects(
      snapshot.docs.map(projectFromSnapshot).filter(project => isPubliclyVisible(project))
    );
  } catch {
    throw new ContentUnavailableError();
  }
}

async function getPublishedProjectUncached(slug: string): Promise<ProjectRecord | null> {
  try {
    const snapshot = await getDb().collection(COLLECTION).where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return null;
    const project = projectFromSnapshot(snapshot.docs[0]);
    return isPubliclyVisible(project) ? project : null;
  } catch {
    throw new ContentUnavailableError();
  }
}

export async function listPublishedProjects(
  options: ContentListOptions = {}
): Promise<ProjectRecord[]> {
  const projects = await cachedContent(
    listPublishedProjectsUncached,
    ['content', 'projects', 'published'],
    ['projects']
  );
  const query = options.query?.trim().toLowerCase();
  return projects.filter(project => {
    if (options.category && project.category !== options.category) return false;
    if (
      options.skill &&
      !project.skills.some(skill => skill.toLowerCase() === options.skill?.toLowerCase())
    ) {
      return false;
    }
    if (!query) return true;
    return [project.title, project.description, ...project.skills].some(value =>
      value.toLowerCase().includes(query)
    );
  });
}

export async function listFeaturedProjects(limit = 3): Promise<ProjectRecord[]> {
  return (await listPublishedProjects()).filter(project => project.featured).slice(0, limit);
}

export async function getPublishedProjectBySlug(slug: string): Promise<ProjectRecord | null> {
  return cachedContent(
    () => getPublishedProjectUncached(slug),
    ['content', 'project', slug],
    ['projects', `project:${slug}`]
  );
}

async function listAdminProjectsUncached(): Promise<ProjectRecord[]> {
  try {
    const snapshot = await getDb().collection(COLLECTION).get();
    return sortProjects(snapshot.docs.map(projectFromSnapshot));
  } catch {
    throw new ContentUnavailableError();
  }
}

export async function listAdminProjects(): Promise<ProjectRecord[]> {
  return listAdminProjectsUncached();
}

export async function getAdminProjectBySlug(slug: string): Promise<ProjectRecord | null> {
  try {
    const snapshot = await getDb().collection(COLLECTION).where('slug', '==', slug).limit(1).get();
    return snapshot.empty ? null : projectFromSnapshot(snapshot.docs[0]);
  } catch {
    throw new ContentUnavailableError();
  }
}

function normalizeCreate(input: unknown): ProjectInput {
  const result = projectInputSchema.safeParse(input);
  if (!result.success)
    throw new ContentValidationError(result.error.issues.map(issue => issue.message).join('; '));
  return result.data;
}

export async function createProject(input: unknown): Promise<ProjectRecord> {
  const normalized = normalizeCreate(input);
  const db = getDb();
  const ref = db.collection(COLLECTION).doc();
  const reservation = db.collection(SLUG_COLLECTION).doc(`project:${normalized.slug}`);
  const now = Timestamp.now();

  try {
    await db.runTransaction(async transaction => {
      const existing = await transaction.get(reservation);
      if (existing.exists)
        throw new ContentConflictError('A project with this slug already exists');
      transaction.create(ref, projectToFirestore(normalized, ref.id, now, 1));
      transaction.create(reservation, {
        contentType: 'project',
        contentId: ref.id,
        slug: normalized.slug,
        createdAt: now,
      });
    });
    const created = await ref.get();
    return projectFromSnapshot(created);
  } catch (error) {
    if (error instanceof ContentConflictError) throw error;
    throw new ContentUnavailableError();
  }
}

export async function updateProject(
  slug: string,
  input: unknown,
  expectedVersion?: number
): Promise<ProjectRecord> {
  const patch = projectUpdateSchema.safeParse(input);
  if (!patch.success)
    throw new ContentValidationError(patch.error.issues.map(issue => issue.message).join('; '));
  const current = await getAdminProjectBySlug(slug);
  if (!current) throw new ContentNotFoundError('Project not found');

  const merged = projectInputSchema.safeParse({
    ...current,
    ...patch.data,
    slug: current.slug,
    status: patch.data.status ?? current.status,
    publishedAt: Object.prototype.hasOwnProperty.call(patch.data, 'publishedAt')
      ? patch.data.publishedAt
      : current.publishedAt,
    publishAt: Object.prototype.hasOwnProperty.call(patch.data, 'publishAt')
      ? patch.data.publishAt
      : current.publishAt,
  });
  if (!merged.success)
    throw new ContentValidationError(merged.error.issues.map(issue => issue.message).join('; '));

  const previousAssets = [...assetUrls(current.image), ...assetUrls(current.gallery)];

  const db = getDb();
  const ref = db.collection(COLLECTION).doc(current.id);
  const now = Timestamp.now();
  try {
    await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new ContentNotFoundError('Project not found');
      const stored = projectFromSnapshot(snapshot);
      if (expectedVersion !== undefined && stored.version !== expectedVersion) {
        throw new ContentConflictError('Project was changed by another request');
      }
      const next = projectToFirestore(merged.data, stored.id, now, stored.version + 1);
      next.createdAt = Timestamp.fromDate(new Date(stored.createdAt));
      next.sourceHash = null;
      transaction.set(ref, next);
    });
    const updated = await ref.get();
    const result = projectFromSnapshot(updated);
    await cleanupReplacedAssets(previousAssets, [
      ...assetUrls(result.image),
      ...assetUrls(result.gallery),
    ]);
    return result;
  } catch (error) {
    if (error instanceof ContentConflictError || error instanceof ContentNotFoundError) throw error;
    throw new ContentUnavailableError();
  }
}

export async function reorderProjects(slugsInOrder: string[]): Promise<void> {
  const db = getDb();
  try {
    const snapshot = await db.collection(COLLECTION).get();
    const slugToRef = new Map(
      snapshot.docs
        .filter(doc => typeof (doc.data() as { slug?: unknown }).slug === 'string')
        .map(doc => [(doc.data() as { slug: string }).slug, doc.ref])
    );
    const batch = db.batch();
    slugsInOrder.forEach((slug, index) => {
      const ref = slugToRef.get(slug);
      if (ref) batch.update(ref, { sortOrder: index });
    });
    await batch.commit();
  } catch {
    throw new ContentUnavailableError();
  }
}

export async function deleteProject(slug: string): Promise<void> {
  const current = await getAdminProjectBySlug(slug);
  if (!current) throw new ContentNotFoundError('Project not found');
  const previousAssets = [...assetUrls(current.image), ...assetUrls(current.gallery)];
  const db = getDb();
  try {
    await db.runTransaction(async transaction => {
      const ref = db.collection(COLLECTION).doc(current.id);
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new ContentNotFoundError('Project not found');
      transaction.delete(ref);
      transaction.delete(slugRef(slug));
    });
    await cleanupReplacedAssets(previousAssets, []);
  } catch (error) {
    if (error instanceof ContentNotFoundError) throw error;
    throw new ContentUnavailableError();
  }
}

export function projectRecordToInput(project: ProjectRecord): ProjectInput {
  return {
    slug: project.slug,
    title: project.title,
    description: project.description,
    longDescription: project.longDescription ?? '',
    image: project.image || '',
    gallery: project.gallery ?? [],
    skills: project.skills ?? [],
    challenge: project.challenge ?? '',
    solution: project.solution ?? '',
    results: project.results ?? '',
    liveLink: project.liveLink ?? null,
    sourceLink: project.sourceLink ?? null,
    featured: project.featured,
    category: project.category ?? 'other',
    status: project.status,
    publishAt: project.publishAt ?? null,
    publishedAt: project.publishedAt ?? null,
    sortOrder: project.sortOrder ?? 0,
  };
}

export type { DocumentSnapshot };
