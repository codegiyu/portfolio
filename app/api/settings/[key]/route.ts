import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth/guard';
import { getSetting, LOCAL_FALLBACKS, type SettingsKey } from '@/lib/settings';

const VALID_KEYS = new Set<string>(Object.keys(LOCAL_FALLBACKS));

export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  if (!VALID_KEYS.has(key)) {
    return NextResponse.json({ error: 'Unknown settings key' }, { status: 404 });
  }

  try {
    const data = await getSetting(key as SettingsKey);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Error fetching setting "${key}":`, error);
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;

  const { key } = await params;

  if (!VALID_KEYS.has(key)) {
    return NextResponse.json({ error: 'Unknown settings key' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { getDb } = await import('@/lib/firestore');
    const db = getDb();
    await db.collection('settings').doc(key).set(body, { merge: true });

    return NextResponse.json({ message: `Setting "${key}" updated` }, { status: 200 });
  } catch (error) {
    console.error(`Error updating setting "${key}":`, error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
