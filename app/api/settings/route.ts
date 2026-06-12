import { NextRequest, NextResponse } from 'next/server';
import { isValidMagicLinkToken } from '@/lib/firebase';
import { getAllSettings } from '@/lib/settings';

function requireAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  return !!token && isValidMagicLinkToken(token, process.env.MAGIC_LINK_SECRET || 'dev-secret');
}

export async function GET() {
  try {
    const settings = await getAllSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Bulk update — body is a partial SiteSettings object
  try {
    const { getDb } = await import('@/lib/firestore');
    const updates = await request.json();
    const db = getDb();

    const batch = db.batch();
    for (const [key, value] of Object.entries(updates)) {
      batch.set(db.collection('settings').doc(key), value as object, { merge: true });
    }
    await batch.commit();

    return NextResponse.json({ message: 'Settings updated' }, { status: 200 });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
