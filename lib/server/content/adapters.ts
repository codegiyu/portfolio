import { Timestamp, type DocumentSnapshot } from 'firebase-admin/firestore';
import type { BlogPost, Project, SiteSettings, SettingsKey } from '@/lib/types/general';
import type { PostInput, PostRecord, ProjectInput, ProjectRecord } from './types';
import { isSafeAssetUrl, isSafeHttpUrl } from '@/lib/safe-url';

function asTimestamp(value: unknown, fallback = Timestamp.fromDate(new Date(0))): Timestamp {
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return Timestamp.fromDate(date);
  }
  return fallback;
}

function asIso(value: unknown, fallback = new Date(0).toISOString()): string {
  return asTimestamp(value, Timestamp.fromDate(new Date(fallback)))
    .toDate()
    .toISOString();
}

function asNullableIso(value: unknown): string | null {
  return value == null ? null : asIso(value);
}

function statusOf(data: Record<string, unknown>): 'draft' | 'published' {
  if (data.status === 'draft' || data.status === 'published') return data.status;
  return data.published === false ? 'draft' : 'published';
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function asAssetUrl(value: unknown): string {
  return typeof value === 'string' && isSafeAssetUrl(value) ? value : '';
}

function asHttpUrl(value: unknown): string | undefined {
  return typeof value === 'string' && isSafeHttpUrl(value) ? value : undefined;
}

export function projectFromSnapshot(snapshot: DocumentSnapshot): ProjectRecord {
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;
  const status = statusOf(data);
  const publishedAt = asNullableIso(
    data.publishedAt ?? (status === 'published' ? data.updatedAt : null)
  );
  return {
    id: snapshot.id,
    slug: asString(data.slug, snapshot.id),
    title: asString(data.title),
    description: asString(data.description),
    longDescription: asString(data.longDescription),
    image: asAssetUrl(data.image),
    gallery: asStringArray(data.gallery).filter(isSafeAssetUrl),
    skills: asStringArray(data.skills),
    challenge: asString(data.challenge),
    solution: asString(data.solution),
    results: asString(data.results),
    liveLink: asHttpUrl(data.liveLink),
    sourceLink: asHttpUrl(data.sourceLink),
    featured: data.featured === true,
    category:
      data.category === 'web-app' ||
      data.category === 'landing' ||
      data.category === 'dashboard' ||
      data.category === 'mobile' ||
      data.category === 'other'
        ? data.category
        : 'other',
    status,
    published: status === 'published',
    publishAt: asNullableIso(data.publishAt),
    publishedAt,
    createdAt: asIso(data.createdAt ?? snapshot.createTime),
    updatedAt: asIso(data.updatedAt ?? snapshot.updateTime),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    version: typeof data.version === 'number' ? data.version : 1,
  };
}

export function postFromSnapshot(snapshot: DocumentSnapshot): PostRecord {
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;
  const status = statusOf(data);
  const bodyMarkdown = asString(data.bodyMarkdown ?? data.content);
  const publishedAt = asIso(data.publishedAt ?? data.date ?? data.updatedAt);
  return {
    id: snapshot.id,
    slug: asString(data.slug, snapshot.id),
    title: asString(data.title),
    excerpt: asString(data.excerpt),
    content: bodyMarkdown,
    date: publishedAt.slice(0, 10),
    tags: asStringArray(data.tags),
    coverImage: asAssetUrl(data.coverImage),
    author: asString(data.author, 'Edward-Precious Omegbu'),
    readingTime: calculateReadingTime(bodyMarkdown),
    published: status === 'published',
    status,
    publishAt: asNullableIso(data.publishAt),
    publishedAt,
    createdAt: asIso(data.createdAt ?? snapshot.createTime),
    updatedAt: asIso(data.updatedAt ?? snapshot.updateTime),
    version: typeof data.version === 'number' ? data.version : 1,
  };
}

export function projectToFirestore(
  input: ProjectInput,
  id: string,
  now: Timestamp,
  version: number
) {
  const publishedAt =
    input.status === 'published'
      ? input.publishedAt
        ? Timestamp.fromDate(new Date(input.publishedAt))
        : now
      : null;
  return {
    id,
    slug: input.slug,
    title: input.title,
    description: input.description,
    longDescription: input.longDescription,
    image: input.image,
    gallery: input.gallery,
    skills: input.skills,
    challenge: input.challenge,
    solution: input.solution,
    results: input.results,
    liveLink: input.liveLink,
    sourceLink: input.sourceLink,
    featured: input.status === 'published' && input.featured,
    category: input.category,
    status: input.status,
    publishAt: input.publishAt ? Timestamp.fromDate(new Date(input.publishAt)) : null,
    publishedAt,
    createdAt: now,
    updatedAt: now,
    sortOrder: input.sortOrder,
    schemaVersion: 1,
    sourceHash: null,
    version,
  };
}

export function postToFirestore(input: PostInput, id: string, now: Timestamp, version: number) {
  const publishedAt =
    input.status === 'published' ? Timestamp.fromDate(new Date(input.publishedAt)) : null;
  return {
    id,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    bodyMarkdown: input.bodyMarkdown,
    tags: input.tags,
    coverImage: input.coverImage,
    author: input.author,
    status: input.status,
    publishAt: input.publishAt ? Timestamp.fromDate(new Date(input.publishAt)) : null,
    publishedAt,
    createdAt: now,
    updatedAt: now,
    schemaVersion: 1,
    sourceHash: null,
    version,
  };
}

export function calculateReadingTime(content: string): number {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function isPubliclyVisible(
  record: { status: string; publishAt: string | null },
  now = new Date()
): boolean {
  return (
    record.status === 'published' &&
    (!record.publishAt || new Date(record.publishAt).getTime() <= now.getTime())
  );
}

export type { BlogPost, Project, SiteSettings, SettingsKey };
