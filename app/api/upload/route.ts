import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth/guard';
import { uploadToR2 } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
]);

const MAX_SIZE_MB = 10;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed` },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `File exceeds ${MAX_SIZE_MB}MB limit` }, { status: 400 });
    }

    const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`;
    const key = `${folder}/${uuidv4()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const url = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({ url, key }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
