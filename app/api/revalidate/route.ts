import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const VALID_TAGS = new Set(['projects', 'settings', 'posts']);

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Revalidation not configured' }, { status: 500 });
  }

  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tags: string[] = ['projects', 'settings'];
  try {
    const body = await request.json();
    if (Array.isArray(body.tags)) tags = body.tags;
  } catch {
    // no body — use defaults
  }

  const unknown = tags.filter(t => !VALID_TAGS.has(t));
  if (unknown.length) {
    return NextResponse.json({ error: `Unknown tags: ${unknown.join(', ')}` }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: tags, now: Date.now() }, { status: 200 });
}
