import { z } from 'zod';
import type { PostInput, ProjectInput } from './types';
import { isSafeAssetUrl, isSafeHttpUrl } from '@/lib/safe-url';
import type { SettingsKey, SiteSettings } from '@/lib/types/general';
import { ContentValidationError } from './error-types';

const assetUrl = z
  .string()
  .trim()
  .refine(isSafeAssetUrl, {
    message: 'Must be an http(s) URL or a local asset path',
  })
  .transform(value => value || '');

const externalUrl = z
  .string()
  .trim()
  .refine(value => value === '' || isSafeHttpUrl(value), {
    message: 'Must be an http(s) URL',
  })
  .transform(value => value || null);

const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain lowercase letters, numbers, and hyphens');

const stringArray = z
  .array(z.string().trim().min(1))
  .transform(values => Array.from(new Set(values.filter(Boolean))));

const isoDate = z
  .string()
  .trim()
  .refine(value => !Number.isNaN(Date.parse(value)), 'Must be a valid date')
  .transform(value => new Date(value).toISOString());
const nullableExternalUrl = z.union([externalUrl, z.null()]).default(null);
const nullableDate = z.union([isoDate, z.null()]).default(null);
const status = z.enum(['draft', 'published']);

export const projectCategorySchema = z.enum(['web-app', 'landing', 'dashboard', 'mobile', 'other']);

export const projectInputSchema = z.object({
  slug,
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).default(''),
  longDescription: z.string().trim().max(10000).default(''),
  image: assetUrl.default(''),
  gallery: z
    .array(assetUrl)
    .default([])
    .transform(values => values.filter(Boolean)),
  skills: stringArray.default([]),
  challenge: z.string().trim().max(10000).default(''),
  solution: z.string().trim().max(10000).default(''),
  results: z.string().trim().max(10000).default(''),
  liveLink: nullableExternalUrl,
  sourceLink: nullableExternalUrl,
  featured: z.boolean().default(false),
  category: projectCategorySchema.default('other'),
  status: status.default('draft'),
  publishAt: nullableDate,
  publishedAt: nullableDate,
  sortOrder: z.number().int().min(0).max(100000).default(0),
});

export const postInputSchema = z.object({
  slug,
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(3000).default(''),
  bodyMarkdown: z.string().min(1).max(500000),
  tags: stringArray.default([]),
  coverImage: z.union([assetUrl, z.null()]).default(null),
  author: z.string().trim().min(1).max(160).default('Edward-Precious Omegbu'),
  status: status.default('draft'),
  publishAt: nullableDate,
  publishedAt: isoDate.optional().default(new Date(0).toISOString()),
});

export const projectUpdateSchema = projectInputSchema.omit({ slug: true }).partial();
export const postUpdateSchema = postInputSchema.omit({ slug: true }).partial();

const settingsText = (max: number) => z.string().trim().max(max);
const settingsAsset = z.string().trim().refine(isSafeAssetUrl, {
  message: 'Must be an http(s) URL or a local asset path',
});
const requiredSettingsAsset = z.string().trim().min(1).refine(isSafeAssetUrl, {
  message: 'Must be an http(s) URL or a local asset path',
});
const settingsExternal = z.string().trim().refine(isSafeHttpUrl, {
  message: 'Must be a safe http(s) URL',
});

export const settingsSchemas = {
  about: z.object({
    greeting: settingsText(160),
    name: settingsText(160),
    role: settingsText(160),
    bio: settingsText(5000),
    profileImage: requiredSettingsAsset,
    cvUrl: settingsAsset,
  }),
  social: z.object({
    links: z
      .array(
        z.object({
          platform: settingsText(40).min(1),
          url: settingsExternal,
          icon: requiredSettingsAsset,
          alt: settingsText(160).min(1),
        })
      )
      .max(20),
  }),
  contact: z.object({
    items: z
      .array(
        z.object({
          type: z.enum(['phone', 'email', 'whatsapp', 'message', 'other']),
          text: settingsText(160),
          value: settingsText(500),
        })
      )
      .max(20),
  }),
  skills: z.object({
    active: z.array(settingsText(80).min(1)).max(100),
    icons: z.record(settingsAsset),
  }),
  specialties: z.object({
    cards: z
      .array(
        z.object({
          label: settingsText(80).min(1),
          description: settingsText(1000),
        })
      )
      .max(20),
  }),
} as const;

export function parseSettingsValue<K extends SettingsKey>(key: K, value: unknown): SiteSettings[K] {
  const result = settingsSchemas[key].safeParse(value);
  if (!result.success) {
    throw new ContentValidationError(
      result.error.issues
        .map(issue => `${issue.path.join('.') || key}: ${issue.message}`)
        .join('; ')
    );
  }
  return result.data as SiteSettings[K];
}

export function normalizeProjectInput(input: unknown): ProjectInput {
  const result = projectInputSchema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues.map(issue => issue.message).join('; '));
  return result.data;
}

export function normalizePostInput(input: unknown): PostInput {
  const result = postInputSchema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues.map(issue => issue.message).join('; '));
  return result.data;
}
