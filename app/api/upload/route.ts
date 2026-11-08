import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth/guard';
import { uploadToR2 } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';
import { logServerError } from '@/lib/server/logging';

const MEDIA_POLICY = {
  profile: new Set(['image/jpeg', 'image/png', 'image/webp']),
  cv: new Set(['application/pdf']),
  project: new Set(['image/jpeg', 'image/png', 'image/webp']),
  post: new Set(['image/jpeg', 'image/png', 'image/webp']),
} as const;

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 8000;

type Folder = keyof typeof MEDIA_POLICY;

function isFolder(value: FormDataEntryValue | null): value is Folder {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(MEDIA_POLICY, value);
}

function signatureMatches(buffer: Buffer, type: string): boolean {
  if (type === 'application/pdf') return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  if (type === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === 'image/png')
    return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === 'image/webp')
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  return false;
}

function dimensionsAreSafe(buffer: Buffer, type: string): boolean {
  if (type === 'image/png' && buffer.length >= 24) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return width > 0 && height > 0 && width <= MAX_DIMENSION && height <= MAX_DIMENSION;
  }
  if (
    type === 'image/webp' &&
    buffer.length >= 30 &&
    buffer.subarray(12, 16).toString('ascii') === 'VP8X'
  ) {
    const width = 1 + buffer[24] + (buffer[25] << 8) + (buffer[26] << 16);
    const height = 1 + buffer[27] + (buffer[28] << 8) + (buffer[29] << 16);
    return width <= MAX_DIMENSION && height <= MAX_DIMENSION;
  }
  return true;
}

function extensionFor(type: string): string {
  return type === 'application/pdf' ? 'pdf' : type.slice('image/'.length);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;

  try {
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > MAX_BYTES + 64 * 1024) {
      return NextResponse.json({ error: 'File exceeds the 5MB limit' }, { status: 400 });
    }
    const formData = await request.formData();
    const file = formData.get('file');
    const folderValue = formData.get('folder');
    if (!(file instanceof File))
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!isFolder(folderValue))
      return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 });
    if (!MEDIA_POLICY[folderValue].has(file.type)) {
      return NextResponse.json(
        { error: 'File type is not allowed for this asset' },
        { status: 400 }
      );
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds the 5MB limit' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!signatureMatches(buffer, file.type) || !dimensionsAreSafe(buffer, file.type)) {
      return NextResponse.json({ error: 'File content could not be verified' }, { status: 400 });
    }

    const key = `assets/${folderValue}/${uuidv4()}.${extensionFor(file.type)}`;
    const url = await uploadToR2(key, buffer, file.type);
    return NextResponse.json({ url, key, folder: folderValue }, { status: 201 });
  } catch (error) {
    logServerError('UPLOAD_FAILED', { errorName: error instanceof Error ? error.name : 'unknown' });
    return NextResponse.json({ error: 'Upload failed' }, { status: 503 });
  }
}
