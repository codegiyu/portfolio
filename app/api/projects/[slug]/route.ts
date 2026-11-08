import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth/guard';
import {
  contentErrorResponse,
  contentWriteFreezeResponse,
  deleteProject,
  getAdminProjectBySlug,
  getPublishedProjectBySlug,
  invalidateProject,
  parseJsonBody,
  parseExpectedVersion,
  updateProject,
} from '@/lib/server/content';

function projectPayload(body: Record<string, unknown>) {
  const { published, ...rest } = body;
  return {
    ...rest,
    status:
      rest.status ??
      (typeof published === 'boolean' ? (published ? 'published' : 'draft') : undefined),
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (request.nextUrl.searchParams.get('scope') === 'admin') {
      const denied = await requireAdmin(request);
      if (denied) return denied;
      const project = await getAdminProjectBySlug(slug);
      return project
        ? NextResponse.json(project, { status: 200, headers: { 'Cache-Control': 'no-store' } })
        : NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const project = await getPublishedProjectBySlug(slug);
    return project
      ? NextResponse.json(project, { status: 200 })
      : NextResponse.json({ error: 'Project not found' }, { status: 404 });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to fetch project');
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
    const project = await updateProject(slug, projectPayload(body), parseExpectedVersion(body));
    invalidateProject(slug);
    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to update project');
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
    await deleteProject(slug);
    invalidateProject(slug);
    return NextResponse.json({ message: 'Project deleted' }, { status: 200 });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to delete project');
  }
}
