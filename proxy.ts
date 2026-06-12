import { NextRequest, NextResponse } from 'next/server';
import { isValidMagicLinkToken } from './lib/auth';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard admin sub-pages; login and verify pages are public
  if (
    pathname.startsWith('/admin') &&
    pathname !== '/admin' &&
    !pathname.startsWith('/admin/verify')
  ) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token || !isValidMagicLinkToken(token)) {
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
