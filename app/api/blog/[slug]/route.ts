import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth/guard';
import {
  contentErrorResponse,
  contentWriteFreezeResponse,
  deletePost,
  getAdminPostBySlug,
  getPublishedPostBySlug,
  invalidatePost,
  parseJsonBody,
  parseExpectedVersion,
  updatePost,
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (request.nextUrl.searchParams.get('scope') === 'admin') {
      const denied = await requireAdmin(request);
      if (denied) return denied;
      const post = await getAdminPostBySlug(slug);
      return post
        ? NextResponse.json(post, { status: 200, headers: { 'Cache-Control': 'no-store' } })
        : NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    const post = await getPublishedPostBySlug(slug);
    return post
      ? NextResponse.json(post, { status: 200 })
      : NextResponse.json({ error: 'Post not found' }, { status: 404 });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to fetch post');
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;
  const frozen = contentWriteFreezeResponse();
  if (frozen) return frozen;
  try {
    const { slug } = await params;
    const body = await parseJsonBody(request);
    if (typeof body.slug === 'string' && body.slug !== slug)
      return NextResponse.json({ error: 'Slugs are immutable' }, { status: 400 });
    const post = await updatePost(slug, postPayload(body), parseExpectedVersion(body));
    invalidatePost(slug);
    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to update post');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;
  const frozen = contentWriteFreezeResponse();
  if (frozen) return frozen;
  try {
    const { slug } = await params;
    await deletePost(slug);
    invalidatePost(slug);
    return NextResponse.json({ message: 'Post deleted' }, { status: 200 });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to delete post');
  }
}
