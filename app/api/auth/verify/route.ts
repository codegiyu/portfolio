import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ConfigError, getAuthConfig } from '@/lib/server/env';
import { checkVerifyRateLimit, getTrustedClientIp } from '@/lib/server/auth/rate-limit';
import { isSameOrigin } from '@/lib/server/auth/http';
import { verifyMagicLink } from '@/lib/server/auth/service';
import { setSessionCookie, clearLegacySessionCookie } from '@/lib/server/auth/cookies';

const requestSchema = z.object({ token: z.string().max(512) });

export async function POST(request: NextRequest) {
  let config;
  try {
    config = getAuthConfig();
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error('Authentication configuration unavailable:', error.code);
    }
    return NextResponse.json(
      { error: 'Authentication is temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!isSameOrigin(request, config.appUrl)) {
    return NextResponse.json(
      { error: 'Request origin rejected' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const limit = await checkVerifyRateLimit(getTrustedClientIp(request));
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfterSeconds),
            'Cache-Control': 'no-store',
          },
        }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Authentication is temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid or expired sign-in link' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid or expired sign-in link' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const sessionToken = await verifyMagicLink(parsed.data.token);
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Invalid or expired sign-in link' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const response = new NextResponse(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    });
    setSessionCookie(response, sessionToken);
    clearLegacySessionCookie(response);
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Authentication is temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
