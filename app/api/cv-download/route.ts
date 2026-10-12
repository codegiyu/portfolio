import { NextRequest, NextResponse } from 'next/server';
import { checkAnalyticsRateLimit, getTrustedClientIp } from '@/lib/server/auth/rate-limit';
import { isLikelyBot, recordCvDownload } from '@/lib/tracking';
import { z } from 'zod';
import { logServerError } from '@/lib/server/logging';

const downloadSchema = z.object({ consent: z.literal(true) });
const noContent = () =>
  new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get('user-agent') ?? '';
    const parsed = downloadSchema.safeParse(await request.json());
    if (!parsed.success || isLikelyBot(ua)) return noContent();
    const limit = await checkAnalyticsRateLimit(getTrustedClientIp(request));
    if (!limit.allowed) return noContent();

    await recordCvDownload(request);

    return noContent();
  } catch {
    logServerError('CV_TRACKING_FAILED');
    return noContent();
  }
}
