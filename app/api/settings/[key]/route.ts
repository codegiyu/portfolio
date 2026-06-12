import { NextRequest, NextResponse } from 'next/server';
import { isValidMagicLinkToken } from '@/lib/firebase';
import { getSetting, LOCAL_FALLBACKS, type SettingsKey } from '@/lib/settings';

const VALID_KEYS = new Set<string>(Object.keys(LOCAL_FALLBACKS));

function requireAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  return !!token && isValidMagicLinkToken(token, process.env.MAGIC_LINK_SECRET || 'dev-secret');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
