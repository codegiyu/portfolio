import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth/guard';
import { LOCAL_FALLBACKS } from '@/lib/settings';
import {
  contentErrorResponse,
  contentWriteFreezeResponse,
  getAdminSettings,
  getPublicSettings,
  parseJsonBody,
  parseExpectedVersion,
  updateSettings,
} from '@/lib/server/content';
import type { SettingsKey } from '@/lib/types/general';

const validKeys = new Set(Object.keys(LOCAL_FALLBACKS));

export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!validKeys.has(key))
    return NextResponse.json({ error: 'Unknown settings key' }, { status: 404 });
  try {
    if (request.nextUrl.searchParams.get('scope') === 'admin') {
      const denied = await requireAdmin(request);
      if (denied) return denied;
      return NextResponse.json(await getAdminSettings(key as SettingsKey), {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    const settings = await getPublicSettings();
    return NextResponse.json(settings[key as SettingsKey], { status: 200 });
  } catch (error) {
    return contentErrorResponse(error, `Failed to fetch setting "${key}"`);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;
  const frozen = contentWriteFreezeResponse();
  if (frozen) return frozen;
  const { key } = await params;
  if (!validKeys.has(key))
    return NextResponse.json({ error: 'Unknown settings key' }, { status: 404 });
  try {
    const body = await parseJsonBody(request);
    const value = { ...body };
    delete value.expectedVersion;
    const result = await updateSettings(key as SettingsKey, value, parseExpectedVersion(body));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return contentErrorResponse(error, `Failed to update setting "${key}"`);
  }
}
