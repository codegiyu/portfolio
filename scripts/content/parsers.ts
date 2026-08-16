import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import { normalizePostInput, normalizeProjectInput } from '@/lib/server/content/schemas';
import type { PostInput, ProjectInput } from '@/lib/server/content/types';

export interface MigrationSource<T> {
  input: T;
  slug: string;
  sourcePath: string;
  sourceHash: string;
}

function hash(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function assertSupportedMarkdown(body: string, sourcePath: string) {
  let inFence = false;
  const outsideCode = body
    .split(/\r?\n/)
    .filter(line => {
      if (/^\s{0,3}(```|~~~)/.test(line)) {
        inFence = !inFence;
        return false;
      }
      return !inFence;
    })
    .join('\n');

  if (/<\/?[A-Z][A-Za-z0-9.]*(?:\s[^>\n]*)?\/?>/.test(outsideCode)) {
    throw new Error(`Unsupported JSX/MDX syntax in ${sourcePath}`);
  }
}

export function parseLocalProjects(root = process.cwd()): MigrationSource<ProjectInput>[] {
  const sourcePath = path.join(root, 'content', 'projects.json');
  const raw = fs.readFileSync(sourcePath, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('content/projects.json must contain an array');
  return parsed.map((project, index) => {
    const input = normalizeProjectInput({
      ...(project as object),
      status: 'published',
      sortOrder: (project as { sortOrder?: number }).sortOrder ?? index,
    });
    return { input, slug: input.slug, sourcePath, sourceHash: hash(JSON.stringify(project)) };
  });
}

export function parseLocalPosts(root = process.cwd()): MigrationSource<PostInput>[] {
  const directory = path.join(root, 'content', 'blog');
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter(file => file.endsWith('.mdx'))
    .map(file => {
      const sourcePath = path.join(directory, file);
      const raw = fs.readFileSync(sourcePath, 'utf8');
      const parsed = matter(raw);
      assertSupportedMarkdown(parsed.content, sourcePath);
      const input = normalizePostInput({
        ...parsed.data,
        slug: file.replace(/\.mdx?$/, ''),
        bodyMarkdown: parsed.content,
        status: parsed.data.published === false ? 'draft' : 'published',
        publishedAt: parsed.data.date,
      });
      return { input, slug: input.slug, sourcePath, sourceHash: hash(raw) };
    });
}

export function assertUniqueSlugs(sources: MigrationSource<unknown>[]) {
  const seen = new Set<string>();
  for (const source of sources) {
    if (seen.has(source.slug)) throw new Error(`Duplicate slug in local sources: ${source.slug}`);
    seen.add(source.slug);
  }
}
