import { NextResponse } from 'next/server';
import { authorizeAdminRequest } from './http';

export async function requireAdmin(
  request: Request,
  options: { requireSameOrigin?: boolean } = {}
): Promise<NextResponse | null> {
  const result = await authorizeAdminRequest(request, options);
  if (result.ok) return null;
  return NextResponse.json(
    { error: result.status === 503 ? 'Authentication is temporarily unavailable' : 'Unauthorized' },
    { status: result.status, headers: { 'Cache-Control': 'no-store' } }
  );
}
