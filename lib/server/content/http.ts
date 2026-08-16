import 'server-only';

import { NextResponse } from 'next/server';
import { ContentError, ContentValidationError } from './errors';

export async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ContentValidationError('Request body must be valid JSON');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ContentValidationError('Request body must be a JSON object');
  }
  return body as Record<string, unknown>;
}

export function parseExpectedVersion(body: Record<string, unknown>): number | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, 'expectedVersion')) return undefined;
  const value = body.expectedVersion;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new ContentValidationError('expectedVersion must be a positive integer');
  }
  return value;
}

export function contentErrorResponse(error: unknown, fallback = 'Content request failed') {
  if (error instanceof ContentError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback, code: 'CONTENT_REQUEST_FAILED' }, { status: 503 });
}

export function contentWriteFreezeResponse() {
  if (process.env.CONTENT_WRITES_FROZEN !== 'true') return null;
  return NextResponse.json(
    { error: 'Content writes are temporarily paused', code: 'CONTENT_WRITES_FROZEN' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
