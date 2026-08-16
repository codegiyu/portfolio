import 'server-only';

import { Timestamp } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firestore';
import {
  ContentConflictError,
  ContentNotFoundError,
  ContentUnavailableError,
  ContentValidationError,
} from './errors';
import { cachedContent } from './cache';
import { isPubliclyVisible, postFromSnapshot, postToFirestore } from './adapters';
import { postInputSchema, postUpdateSchema } from './schemas';
import type { ContentListOptions, PostInput, PostRecord } from './types';

const COLLECTION = 'blog';
const SLUG_COLLECTION = 'contentSlugs';

function sortPosts(posts: PostRecord[]) {
  return posts.sort((a, b) => {
    const published = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    return published || a.id.localeCompare(b.id);
  });
}

async function listPublishedPostsUncached(): Promise<PostRecord[]> {
  try {
    const snapshot = await getDb()
      .collection(COLLECTION)
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .get();
    return sortPosts(snapshot.docs.map(postFromSnapshot).filter(post => isPubliclyVisible(post)));
  } catch (error) {
    throw new ContentUnavailableError(error instanceof Error ? error.message : undefined);
  }
}

async function getPublishedPostUncached(slug: string): Promise<PostRecord | null> {
  try {
    const snapshot = await getDb().collection(COLLECTION).where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return null;
    const post = postFromSnapshot(snapshot.docs[0]);
    return isPubliclyVisible(post) ? post : null;
  } catch (error) {
    throw new ContentUnavailableError(error instanceof Error ? error.message : undefined);
  }
}

export async function listPublishedPosts(options: ContentListOptions = {}): Promise<PostRecord[]> {
  const posts = await cachedContent(
    listPublishedPostsUncached,
    ['content', 'posts', 'published'],
    ['posts']
  );
  const query = options.query?.trim().toLowerCase();
  return posts.filter(post => {
    if (options.tag && !post.tags.some(tag => tag.toLowerCase() === options.tag?.toLowerCase()))
      return false;
    if (!query) return true;
    return [post.title, post.excerpt, ...post.tags].some(value =>
      value.toLowerCase().includes(query)
    );
  });
}

export async function listPublishedTags(): Promise<string[]> {
  const tags = new Set<string>();
  for (const post of await listPublishedPosts()) post.tags.forEach(tag => tags.add(tag));
  return Array.from(tags).sort();
}

export async function getPublishedPostBySlug(slug: string): Promise<PostRecord | null> {
  return cachedContent(
    () => getPublishedPostUncached(slug),
    ['content', 'post', slug],
    ['posts', `post:${slug}`]
  );
}

async function listAdminPostsUncached(): Promise<PostRecord[]> {
  try {
    const snapshot = await getDb().collection(COLLECTION).get();
    return sortPosts(snapshot.docs.map(postFromSnapshot));
  } catch (error) {
    throw new ContentUnavailableError(error instanceof Error ? error.message : undefined);
  }
}

export async function listAdminPosts(): Promise<PostRecord[]> {
  return listAdminPostsUncached();
}

export async function getAdminPostBySlug(slug: string): Promise<PostRecord | null> {
  try {
    const snapshot = await getDb().collection(COLLECTION).where('slug', '==', slug).limit(1).get();
    return snapshot.empty ? null : postFromSnapshot(snapshot.docs[0]);
  } catch (error) {
    throw new ContentUnavailableError(error instanceof Error ? error.message : undefined);
  }
}

function normalizeCreate(input: unknown): PostInput {
  const result = postInputSchema.safeParse(input);
  if (!result.success)
    throw new ContentValidationError(result.error.issues.map(issue => issue.message).join('; '));
  return result.data;
}

export async function createPost(input: unknown): Promise<PostRecord> {
  const normalized = normalizeCreate(input);
  const db = getDb();
  const ref = db.collection(COLLECTION).doc();
  const reservation = db.collection(SLUG_COLLECTION).doc(`post:${normalized.slug}`);
  const now = Timestamp.now();
  try {
    await db.runTransaction(async transaction => {
      const existing = await transaction.get(reservation);
      if (existing.exists) throw new ContentConflictError('A post with this slug already exists');
      transaction.create(ref, postToFirestore(normalized, ref.id, now, 1));
      transaction.create(reservation, {
        contentType: 'post',
        contentId: ref.id,
        slug: normalized.slug,
        createdAt: now,
      });
    });
    return postFromSnapshot(await ref.get());
  } catch (error) {
    if (error instanceof ContentConflictError) throw error;
    throw new ContentUnavailableError(error instanceof Error ? error.message : undefined);
  }
}

export async function updatePost(
  slug: string,
  input: unknown,
  expectedVersion?: number
): Promise<PostRecord> {
  const patch = postUpdateSchema.safeParse(input);
  if (!patch.success)
    throw new ContentValidationError(patch.error.issues.map(issue => issue.message).join('; '));
  const current = await getAdminPostBySlug(slug);
  if (!current) throw new ContentNotFoundError('Post not found');

  const merged = postInputSchema.safeParse({
    ...current,
    bodyMarkdown: current.content,
    publishedAt: current.publishedAt,
    ...patch.data,
    slug: current.slug,
    status: patch.data.status ?? current.status,
    publishAt: Object.prototype.hasOwnProperty.call(patch.data, 'publishAt')
      ? patch.data.publishAt
      : current.publishAt,
  });
  if (!merged.success)
    throw new ContentValidationError(merged.error.issues.map(issue => issue.message).join('; '));

  const db = getDb();
  const ref = db.collection(COLLECTION).doc(current.id);
  const now = Timestamp.now();
  try {
    await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new ContentNotFoundError('Post not found');
      const stored = postFromSnapshot(snapshot);
      if (expectedVersion !== undefined && stored.version !== expectedVersion) {
        throw new ContentConflictError('Post was changed by another request');
      }
      const next = postToFirestore(merged.data, stored.id, now, stored.version + 1);
      next.createdAt = Timestamp.fromDate(new Date(stored.createdAt));
      next.sourceHash = null;
      transaction.set(ref, next);
    });
    return postFromSnapshot(await ref.get());
  } catch (error) {
    if (error instanceof ContentConflictError || error instanceof ContentNotFoundError) throw error;
    throw new ContentUnavailableError(error instanceof Error ? error.message : undefined);
  }
}

export async function deletePost(slug: string): Promise<void> {
  const current = await getAdminPostBySlug(slug);
  if (!current) throw new ContentNotFoundError('Post not found');
  const db = getDb();
  try {
    await db.runTransaction(async transaction => {
      const ref = db.collection(COLLECTION).doc(current.id);
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new ContentNotFoundError('Post not found');
      transaction.delete(ref);
      transaction.delete(db.collection(SLUG_COLLECTION).doc(`post:${slug}`));
    });
  } catch (error) {
    if (error instanceof ContentNotFoundError) throw error;
    throw new ContentUnavailableError(error instanceof Error ? error.message : undefined);
  }
}

export function postRecordToInput(post: PostRecord): PostInput {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    bodyMarkdown: post.content,
    tags: post.tags,
    coverImage: post.coverImage || null,
    author: post.author || 'Edward-Precious Omegbu',
    status: post.status,
    publishAt: post.publishAt,
    publishedAt: post.publishedAt,
  };
}
