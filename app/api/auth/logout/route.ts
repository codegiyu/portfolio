import { NextRequest, NextResponse } from 'next/server';
import { ConfigError, getAuthConfig } from '@/lib/server/env';
import { isSameOrigin } from '@/lib/server/auth/http';
import { ADMIN_SESSION_COOKIE } from '@/lib/server/auth/constants';
import { revokeSession } from '@/lib/server/auth/store';
import { clearSessionCookies } from '@/lib/server/auth/cookies';

export async function POST(request: NextRequest) {
  let config;
  try {
    config = getAuthConfig();
  } catch (error) {
    const response = NextResponse.json(
      { error: 'Authentication is temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
    clearSessionCookies(response);
    if (error instanceof ConfigError)
      console.error('Authentication configuration unavailable:', error.code);
    return response;
  }

  if (!isSameOrigin(request, config.appUrl)) {
    return NextResponse.json({ error: 'Request origin rejected' }, { status: 403 });
  }

  const response = new NextResponse(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  });
  clearSessionCookies(response);
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  try {
    if (token) await revokeSession(token);
    return response;
  } catch {
    const unavailable = NextResponse.json(
      { error: 'Authentication is temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
    clearSessionCookies(unavailable);
    return unavailable;
  }
}
