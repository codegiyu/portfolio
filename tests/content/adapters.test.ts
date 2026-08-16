import { describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase-admin/firestore';
import {
  postFromSnapshot,
  projectFromSnapshot,
  isPubliclyVisible,
} from '@/lib/server/content/adapters';

function snapshot(id: string, data: Record<string, unknown>) {
  return {
    id,
    data: () => data,
    createTime: Timestamp.now(),
    updateTime: Timestamp.now(),
  } as never;
}

describe('Firestore content adapters', () => {
  it('maps legacy project documents to domain fields', () => {
    const project = projectFromSnapshot(
      snapshot('legacy-id', { slug: 'legacy-project', title: 'Legacy', featured: true })
    );
    expect(project.id).toBe('legacy-id');
    expect(project.status).toBe('published');
    expect(project.featured).toBe(true);
    expect(project.sortOrder).toBe(0);
  });

  it('maps Markdown posts and derives reading time', () => {
    const post = postFromSnapshot(
      snapshot('post-id', {
        slug: 'post',
        title: 'Post',
        bodyMarkdown: 'one two three',
        status: 'published',
        date: '2026-03-05',
      })
    );
    expect(post.content).toBe('one two three');
    expect(post.readingTime).toBe(1);
    expect(post.date).toContain('2026-03-05');
  });

  it('hides drafts and future content from public visibility', () => {
    expect(isPubliclyVisible({ status: 'draft', publishAt: null })).toBe(false);
    expect(
      isPubliclyVisible(
        { status: 'published', publishAt: '2999-01-01T00:00:00.000Z' },
        new Date('2026-01-01')
      )
    ).toBe(false);
    expect(isPubliclyVisible({ status: 'published', publishAt: null })).toBe(true);
  });
});
