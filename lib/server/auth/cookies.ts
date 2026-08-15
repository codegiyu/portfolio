import type { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, LEGACY_SESSION_COOKIE } from './constants';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  priority: 'high' as const,
};

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: 8 * 60 * 60,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  clearLegacySessionCookie(response);
}

export function clearLegacySessionCookie(response: NextResponse): void {
  response.cookies.set(LEGACY_SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  // The legacy implementation omitted Path, so browsers may have scoped that
  // cookie to /api/auth. Expire both the new explicit root path and that legacy
  // default path during the migration window.
  response.cookies.set(LEGACY_SESSION_COOKIE, '', {
    ...cookieOptions,
    path: '/api/auth',
    maxAge: 0,
  });
}
