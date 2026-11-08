import { describe, expect, it } from 'vitest';
import { assertUniqueSlugs, parseLocalPosts, parseLocalProjects } from '@/scripts/content/parsers';

describe('content migration inputs', () => {
  it('parses all current project and Markdown sources', () => {
    const projects = parseLocalProjects(process.cwd());
    const posts = parseLocalPosts(process.cwd());
    expect(projects.length).toBeGreaterThan(0);
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0].input.bodyMarkdown).toBeTruthy();
  });

  it('detects duplicate source slugs', () => {
    expect(() =>
      assertUniqueSlugs([{ slug: 'duplicate' }, { slug: 'duplicate' }] as never)
    ).toThrow('Duplicate slug');
  });
});
