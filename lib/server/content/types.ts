import type { Timestamp } from 'firebase-admin/firestore';
import type { BlogPost, Project, SiteSettings, SettingsKey } from '@/lib/types/general';

export type ContentStatus = 'draft' | 'published';

export type ProjectCategory = 'web-app' | 'landing' | 'dashboard' | 'mobile' | 'other';

export interface ProjectInput {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  skills: string[];
  challenge: string;
  solution: string;
  results: string;
  liveLink: string | null;
  sourceLink: string | null;
  featured: boolean;
  category: ProjectCategory;
  status: ContentStatus;
  publishAt: string | null;
  publishedAt: string | null;
  sortOrder: number;
}

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  bodyMarkdown: string;
  tags: string[];
  coverImage: string | null;
  author: string;
  status: ContentStatus;
  publishAt: string | null;
  publishedAt: string;
}

export interface ContentDocumentBase {
  id: string;
  slug: string;
  status: ContentStatus;
  publishAt: Timestamp | null;
  publishedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  schemaVersion: number;
  sourceHash: string | null;
  version: number;
}

export type ProjectRecord = Project & {
  status: ContentStatus;
  publishAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  version: number;
};

export type PostRecord = BlogPost & {
  id: string;
  status: ContentStatus;
  publishAt: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export interface AdminSettingsRecord {
  key: SettingsKey;
  value: SiteSettings[SettingsKey];
  version: number;
  updatedAt: string;
}

export interface ContentListOptions {
  query?: string;
  tag?: string;
  skill?: string;
  category?: ProjectCategory;
}

export interface ContentMutationOptions {
  expectedVersion?: number;
}
