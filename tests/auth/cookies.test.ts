import { describe, expect, it } from 'vitest';
import { NextResponse } from 'next/server';
import { clearSessionCookies } from '@/lib/server/auth/cookies';

describe('authentication cookie migration', () => {
  it('expires both root and legacy default-path cookies', () => {
    const response = NextResponse.json({});
    clearSessionCookies(response);
    const header = response.headers.get('set-cookie') ?? '';

    expect(header).toContain('admin_session=');
    expect(header).toContain('admin_token=');
    expect(header).toContain('Path=/');
    expect(header).toContain('Path=/api/auth');
  });
});
