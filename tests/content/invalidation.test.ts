import { beforeEach, describe, expect, it, vi } from 'vitest';

const revalidatePath = vi.fn();
const revalidateTag = vi.fn();

vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }));

describe('content invalidation', () => {
  beforeEach(() => {
    revalidatePath.mockClear();
    revalidateTag.mockClear();
  });

  it('invalidates all project surfaces', async () => {
    const { invalidateProject } = await import('@/lib/server/content/revalidate');
    invalidateProject('example-project');
    expect(revalidateTag).toHaveBeenCalledWith('projects', { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith('project:example-project', { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith('/projects/example-project');
    expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml');
  });

  it('invalidates all post and feed surfaces', async () => {
    const { invalidatePost } = await import('@/lib/server/content/revalidate');
    invalidatePost('example-post');
    expect(revalidateTag).toHaveBeenCalledWith('posts', { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith('/feed.xml');
    expect(revalidatePath).toHaveBeenCalledWith('/blog/example-post');
  });
});
