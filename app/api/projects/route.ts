import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth/guard';
import {
  contentErrorResponse,
  contentWriteFreezeResponse,
  createProject,
  invalidateProject,
  listAdminProjects,
  listPublishedProjects,
  parseJsonBody,
} from '@/lib/server/content';
import { projectCategorySchema } from '@/lib/server/content/schemas';

function projectPayload(body: Record<string, unknown>) {
  const { published, ...rest } = body;
  return {
    ...rest,
    status:
      rest.status ??
      (typeof published === 'boolean' ? (published ? 'published' : 'draft') : undefined),
  };
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    if (params.get('scope') === 'admin') {
      const denied = await requireAdmin(request);
      if (denied) return denied;
      return NextResponse.json(await listAdminProjects(), {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    const rawCategory = params.get('category');
    const category = rawCategory ? projectCategorySchema.safeParse(rawCategory) : null;
    if (category && !category.success) {
      return NextResponse.json({ error: 'Invalid project category' }, { status: 400 });
    }
    return NextResponse.json(
      await listPublishedProjects({
        query: params.get('q') ?? undefined,
        skill: params.get('skill') ?? undefined,
        category: category?.success ? category.data : undefined,
      }),
      { status: 200 }
    );
  } catch (error) {
    return contentErrorResponse(error, 'Failed to fetch projects');
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;
  const frozen = contentWriteFreezeResponse();
  if (frozen) return frozen;
  try {
    const project = await createProject(projectPayload(await parseJsonBody(request)));
    invalidateProject(project.slug);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to create project');
  }
}
