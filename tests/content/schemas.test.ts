import { describe, expect, it } from 'vitest';
import { postInputSchema, projectInputSchema } from '@/lib/server/content/schemas';

describe('content schemas', () => {
  it('normalizes project arrays and publication state', () => {
    const project = projectInputSchema.parse({
      slug: 'example-project',
      title: 'Example',
      skills: ['React', 'React', ' TypeScript '],
      published: true,
      status: 'published',
    });
    expect(project.skills).toEqual(['React', 'TypeScript']);
    expect(project.status).toBe('published');
    expect(project.liveLink).toBeNull();
  });

  it('rejects invalid slugs and unsafe external URLs', () => {
    expect(() => projectInputSchema.parse({ slug: 'Bad Slug', title: 'Example' })).toThrow();
    expect(() =>
      projectInputSchema.parse({
        slug: 'valid-slug',
        title: 'Example',
        liveLink: 'javascript:alert(1)',
      })
    ).toThrow();
  });

  it('preserves Markdown and derives canonical post defaults', () => {
    const post = postInputSchema.parse({
      slug: 'markdown-post',
      title: 'Markdown',
      bodyMarkdown: '# Heading\n\nBody',
      tags: ['TypeScript', 'TypeScript'],
      publishedAt: '2026-03-05',
    });
    expect(post.bodyMarkdown).toContain('# Heading');
    expect(post.tags).toEqual(['TypeScript']);
    expect(post.author).toBe('Edward-Precious Omegbu');
  });
});
