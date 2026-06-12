import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, getGeo, parseUserAgent, recordCvDownload } from '@/lib/tracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { timezone?: string; screenWidth?: number; screenHeight?: number };
    const ua = request.headers.get('user-agent') ?? '';
    const ip = getClientIp(request);
    const geo = await getGeo(request);

    await recordCvDownload({
      timestamp: new Date().toISOString(),
      ip,
      ...geo,
      ...parseUserAgent(ua),
      timezone: body.timezone ?? '',
      screenWidth: Number(body.screenWidth) || 0,
      screenHeight: Number(body.screenHeight) || 0,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('CV download tracking error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
