import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from './lib/server/auth/constants';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard admin sub-pages; login and verify pages are public
  if (
    (pathname === '/admin' || pathname.startsWith('/admin/')) &&
    pathname !== '/admin' &&
    pathname !== '/admin/verify'
  ) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin';
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
