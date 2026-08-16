import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth/guard';
import { LOCAL_FALLBACKS } from '@/lib/settings';
import {
  contentErrorResponse,
  contentWriteFreezeResponse,
  getPublicSettings,
  parseJsonBody,
  updateSettings,
} from '@/lib/server/content';
import type { SettingsKey } from '@/lib/types/general';

const validKeys = new Set(Object.keys(LOCAL_FALLBACKS));

export async function GET() {
  try {
    return NextResponse.json(await getPublicSettings(), { status: 200 });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to fetch settings');
  }
}

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;
  const frozen = contentWriteFreezeResponse();
  if (frozen) return frozen;
  try {
    const updates = await parseJsonBody(request);
    const entries = Object.entries(updates);
    if (entries.some(([key]) => !validKeys.has(key))) {
      return NextResponse.json({ error: 'Unknown settings key' }, { status: 400 });
    }
    await Promise.all(entries.map(([key, value]) => updateSettings(key as SettingsKey, value)));
    return NextResponse.json({ message: 'Settings updated' }, { status: 200 });
  } catch (error) {
    return contentErrorResponse(error, 'Failed to update settings');
  }
}
