import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/server/auth/guard';
import {
  contentErrorResponse,
  contentWriteFreezeResponse,
  reorderProjects,
  parseJsonBody,
  invalidateProjects,
} from '@/lib/server/content';

const schema = z.object({ slugs: z.array(z.string().min(1)).min(1) });

export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;
  const frozen = contentWriteFreezeResponse();
  if (frozen) return frozen;
  try {
    const body = await parseJsonBody(request);
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await reorderProjects(result.data.slugs);
    invalidateProjects();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to reorder projects');
  }
}
