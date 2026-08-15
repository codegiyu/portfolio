import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  checkVerifyRateLimit: vi.fn(),
  getTrustedClientIp: vi.fn(() => '127.0.0.1'),
  verifyMagicLink: vi.fn(),
}));

vi.mock('@/lib/server/env', () => ({
  ConfigError: class ConfigError extends Error {},
  getAuthConfig: () => ({
    adminEmail: 'admin@example.com',
    appUrl: 'https://portfolio.example.com',
    serviceAccount: {},
  }),
}));
vi.mock('@/lib/server/auth/rate-limit', () => ({
  checkVerifyRateLimit: mocks.checkVerifyRateLimit,
  getTrustedClientIp: mocks.getTrustedClientIp,
}));
vi.mock('@/lib/server/auth/service', () => ({ verifyMagicLink: mocks.verifyMagicLink }));

import { POST } from '@/app/api/auth/verify/route';

function request(body: unknown): NextRequest {
  return new NextRequest('https://portfolio.example.com/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://portfolio.example.com',
    },
    body: JSON.stringify(body),
  });
}

describe('verify route contract', () => {
  it('rate-limits malformed attempts before parsing the token body', async () => {
    mocks.checkVerifyRateLimit.mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 });
    const response = await POST(request({ nope: true }));

    expect(response.status).toBe(401);
    expect(mocks.checkVerifyRateLimit).toHaveBeenCalledWith('127.0.0.1');
  });

  it('returns 429 with Retry-After when the verify bucket is exhausted', async () => {
    mocks.checkVerifyRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 42 });
    const response = await POST(request({ token: 'A'.repeat(43) }));

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('42');
    expect(mocks.verifyMagicLink).not.toHaveBeenCalled();
  });

  it('creates a session cookie only after successful atomic verification', async () => {
    mocks.checkVerifyRateLimit.mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 });
    mocks.verifyMagicLink.mockResolvedValueOnce('A'.repeat(43));
    const response = await POST(request({ token: 'B'.repeat(43) }));

    expect(response.status).toBe(204);
    expect(response.headers.get('set-cookie')).toContain('admin_session=');
    expect(response.headers.get('set-cookie')).toContain('admin_token=');
  });
});
