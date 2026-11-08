import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth/guard';
import {
  contentErrorResponse,
  contentWriteFreezeResponse,
  createPost,
  invalidatePost,
  listAdminPosts,
  listPublishedPosts,
  parseJsonBody,
} from '@/lib/server/content';

function postPayload(body: Record<string, unknown>) {
  const { published, content, ...rest } = body;
  return {
    ...rest,
    bodyMarkdown: rest.bodyMarkdown ?? content,
    status:
      rest.status ??
      (typeof published === 'boolean' ? (published ? 'published' : 'draft') : undefined),
    publishedAt: rest.publishedAt ?? rest.date,
  };
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    if (params.get('scope') === 'admin') {
      const denied = await requireAdmin(request);
      if (denied) return denied;
      return NextResponse.json(await listAdminPosts(), {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    return NextResponse.json(
      await listPublishedPosts({
        query: params.get('q') ?? undefined,
        tag: params.get('tag') ?? undefined,
      }),
      { status: 200 }
    );
  } catch (error) {
    return contentErrorResponse(error, 'Failed to fetch posts');
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;
  const frozen = contentWriteFreezeResponse();
  if (frozen) return frozen;
  try {
    const post = await createPost(postPayload(await parseJsonBody(request)));
    invalidatePost(post.slug);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to create post');
  }
}
