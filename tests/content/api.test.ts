import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const requireAdmin = vi.hoisted(() => vi.fn().mockResolvedValue(null));
const createProject = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server/auth/guard', () => ({ requireAdmin }));
vi.mock('@/lib/server/content', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/server/content')>('@/lib/server/content');
  return { ...actual, createProject };
});

describe('content API contracts', () => {
  beforeEach(() => {
    requireAdmin.mockResolvedValue(null);
    createProject.mockReset();
  });

  it('returns 400 for malformed JSON instead of treating it as an outage', async () => {
    const { POST } = await import('@/app/api/projects/route');
    const response = await POST(
      new NextRequest('http://localhost/api/projects', {
        method: 'POST',
        body: '{ malformed',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    expect(response.status).toBe(400);
    expect(createProject).not.toHaveBeenCalled();
  });

  it('rejects invalid project category filters', async () => {
    const { GET } = await import('@/app/api/projects/route');
    const response = await GET(
      new NextRequest('http://localhost/api/projects?category=not-a-category')
    );

    expect(response.status).toBe(400);
  });
});
