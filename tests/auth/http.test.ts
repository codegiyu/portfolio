import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/env', () => ({
  ConfigError: class ConfigError extends Error {},
  getAuthConfig: () => ({
    adminEmail: 'admin@example.com',
    appUrl: 'https://portfolio.example.com',
    serviceAccount: {},
  }),
}));
vi.mock('@/lib/server/auth/store', () => ({
  getValidSession: vi.fn(async (token: string) => token === 'valid-session-token'),
}));

import { authorizeAdminRequest, isSameOrigin } from '@/lib/server/auth/http';

describe('central authorization policy', () => {
  it('requires a valid session and rejects tampered/unknown cookies', async () => {
    const missing = await authorizeAdminRequest(
      new Request('https://portfolio.example.com/api/private')
    );
    expect(missing).toMatchObject({ ok: false, status: 401 });

    const invalid = await authorizeAdminRequest(
      new Request('https://portfolio.example.com/api/private', {
        headers: { cookie: 'admin_session=unknown' },
      })
    );
    expect(invalid).toMatchObject({ ok: false, status: 401 });

    const valid = await authorizeAdminRequest(
      new Request('https://portfolio.example.com/api/private', {
        headers: { cookie: 'admin_session=valid-session-token' },
      })
    );
    expect(valid).toMatchObject({ ok: true });
  });

  it('requires exact same-origin requests for mutations', async () => {
    expect(
      isSameOrigin(
        new Request('https://portfolio.example.com/api'),
        'https://portfolio.example.com'
      )
    ).toBe(false);
    const rejected = await authorizeAdminRequest(
      new Request('https://portfolio.example.com/api/private', {
        method: 'POST',
        headers: {
          cookie: 'admin_session=valid-session-token',
          origin: 'https://attacker.example.com',
        },
      }),
      { requireSameOrigin: true }
    );
    expect(rejected).toMatchObject({ ok: false, status: 403 });
  });
});
