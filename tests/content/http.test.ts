import { describe, expect, it } from 'vitest';
import { contentErrorResponse } from '@/lib/server/content/http';

describe('content error boundary', () => {
  it('does not expose internal storage error messages', async () => {
    const response = contentErrorResponse(new Error('secret Firestore project details'));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'Content request failed',
      code: 'CONTENT_REQUEST_FAILED',
    });
  });
});
