import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createMagicLink: vi.fn().mockResolvedValue(undefined),
  invalidateMagicLink: vi.fn().mockResolvedValue(undefined),
  consumeMagicLinkAndCreateSession: vi.fn(),
}));

vi.mock('@/lib/server/env', () => ({
  ConfigError: class ConfigError extends Error {},
  getAuthConfig: () => ({
    adminEmail: 'admin@example.com',
    appUrl: 'https://portfolio.example.com',
    serviceAccount: {},
  }),
  getSmtpConfig: () => ({ email: 'mailer@example.com', password: 'test-password' }),
  normalizeEmail: (email: string) => email.trim().toLowerCase(),
}));
vi.mock('@/lib/server/auth/store', () => ({
  createMagicLink: mocks.createMagicLink,
  invalidateMagicLink: mocks.invalidateMagicLink,
  consumeMagicLinkAndCreateSession: mocks.consumeMagicLinkAndCreateSession,
}));

import { issueMagicLink, verifyMagicLink } from '@/lib/server/auth/service';

describe('magic-link service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createMagicLink.mockResolvedValue(undefined);
    mocks.invalidateMagicLink.mockResolvedValue(undefined);
    mocks.consumeMagicLinkAndCreateSession.mockReset();
  });

  it('does not create or send a link for a non-admin address', async () => {
    const deliver = vi.fn();
    const result = await issueMagicLink('other@example.com', deliver, 1_700_000_000_000);
    expect(result).toEqual({ accepted: true, delivered: false });
    expect(mocks.createMagicLink).not.toHaveBeenCalled();
    expect(deliver).not.toHaveBeenCalled();
  });

  it('creates and delivers a one-time link without exposing its secret', async () => {
    const deliver = vi.fn().mockResolvedValue(undefined);
    const result = await issueMagicLink(' ADMIN@example.com ', deliver, 1_700_000_000_000);
    expect(result.delivered).toBe(true);
    expect(mocks.createMagicLink).toHaveBeenCalledOnce();
    expect(deliver).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@example.com',
        appUrl: 'https://portfolio.example.com',
      })
    );
    const token = mocks.createMagicLink.mock.calls[0][0];
    expect(JSON.stringify(deliver.mock.calls)).not.toContain('admin@example.com|');
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('invalidates a link when delivery fails', async () => {
    const deliver = vi.fn().mockRejectedValue(new Error('smtp failure'));
    await expect(issueMagicLink('admin@example.com', deliver)).rejects.toThrow(
      'AUTH_EMAIL_DELIVERY_FAILED'
    );
    expect(mocks.invalidateMagicLink).toHaveBeenCalledOnce();
  });

  it('passes only a valid opaque token to the atomic verifier', async () => {
    mocks.consumeMagicLinkAndCreateSession.mockResolvedValueOnce('session-token');
    expect(await verifyMagicLink('not-a-token')).toBeNull();
    expect(mocks.consumeMagicLinkAndCreateSession).not.toHaveBeenCalled();
    const token = 'A'.repeat(43);
    expect(await verifyMagicLink(token)).toBe('session-token');
  });
});
