import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth/guard';
import { checkAnalyticsRateLimit, getTrustedClientIp } from '@/lib/server/auth/rate-limit';
import { getAnalyticsSummary, isLikelyBot, recordPageView } from '@/lib/tracking';
import { z } from 'zod';
import { logServerError } from '@/lib/server/logging';

const pageViewSchema = z.object({
  consent: z.literal(true),
  path: z.string().min(1).max(300),
  referrer: z.string().max(2048).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = pageViewSchema.safeParse(await request.json());
    if (!parsed.success)
      return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
    const ua = request.headers.get('user-agent') ?? '';
    if (isLikelyBot(ua))
      return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
    const limit = await checkAnalyticsRateLimit(getTrustedClientIp(request));
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, code: 'RATE_LIMITED' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      );
    }

    await recordPageView(request, parsed.data);

    return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    logServerError('ANALYTICS_RECORDING_FAILED');
    return NextResponse.json({ ok: false, code: 'ANALYTICS_UNAVAILABLE' }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const days = Number(request.nextUrl.searchParams.get('days') ?? 30);
    return NextResponse.json(await getAnalyticsSummary(Number.isFinite(days) ? days : 30), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Analytics unavailable' }, { status: 503 });
  }
}
