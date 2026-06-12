import { NextRequest, NextResponse } from 'next/server';
import { isValidMagicLinkToken } from '@/lib/firebase';
import {
  getClientIp,
  getCvDownloads,
  getGeo,
  getPageViews,
  parseUserAgent,
  recordPageView,
} from '@/lib/tracking';

function requireAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  return !!token && isValidMagicLinkToken(token, process.env.MAGIC_LINK_SECRET || 'dev-secret');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { path?: string; referrer?: string };
    const ua = request.headers.get('user-agent') ?? '';
    const ip = getClientIp(request);
    const geo = await getGeo(request);

    await recordPageView({
      timestamp: new Date().toISOString(),
      ip,
      ...geo,
      ...parseUserAgent(ua),
      path: body.path ?? '/',
      referrer: body.referrer ?? '',
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('Analytics recording error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [views, cvDownloads] = await Promise.all([getPageViews(), getCvDownloads()]);
  return NextResponse.json({ views, cvDownloads });
}
