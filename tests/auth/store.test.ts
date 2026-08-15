import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeDb } from './fake-firestore';

const database = new FakeDb();
vi.mock('@/lib/firestore', () => ({ getDb: () => database }));

import {
  consumeMagicLinkAndCreateSession,
  consumeRateLimit,
  createMagicLink,
  getValidSession,
  revokeSession,
} from '@/lib/server/auth/store';
import { generateOpaqueToken, hashToken } from '@/lib/server/auth/crypto';

describe('Firestore-backed auth records', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores only a hash and accepts a valid link once', async () => {
    const token = generateOpaqueToken();
    const now = 1_700_000_000_000;
    await createMagicLink(token, now);

    expect(database.hasRawValue(token)).toBe(false);
    const session = await consumeMagicLinkAndCreateSession(token, now + 1_000);
    expect(session).toBeTruthy();
    expect(await getValidSession(session!, now + 1_000)).toBe(true);
    expect(await consumeMagicLinkAndCreateSession(token, now + 2_000)).toBeNull();
  });

  it('rejects unknown and expired links', async () => {
    expect(await consumeMagicLinkAndCreateSession(generateOpaqueToken())).toBeNull();

    const token = generateOpaqueToken();
    const now = 1_700_000_000_000;
    await createMagicLink(token, now - 16 * 60 * 1000);
    expect(await consumeMagicLinkAndCreateSession(token, now)).toBeNull();
  });

  it('allows only one concurrent verification to consume a link', async () => {
    const token = generateOpaqueToken();
    const now = 1_700_000_000_000;
    await createMagicLink(token, now);
    const results = await Promise.all([
      consumeMagicLinkAndCreateSession(token, now + 1),
      consumeMagicLinkAndCreateSession(token, now + 1),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('expires and revokes sessions and rejects tampered values', async () => {
    const token = generateOpaqueToken();
    const now = 1_700_000_000_000;
    await createMagicLink(token, now);
    const session = await consumeMagicLinkAndCreateSession(token, now);
    expect(await getValidSession(`${session}x`, now)).toBe(false);
    expect(await getValidSession(session!, now + 8 * 60 * 60 * 1000 + 1)).toBe(false);
    await revokeSession(session!);
    expect(await getValidSession(session!, now + 1_000)).toBe(false);
  });

  it('enforces fixed-window email/IP rate limits and resets in a new window', async () => {
    const bucket = { scope: 'email', key: 'admin@example.com', windowMs: 60_000, max: 2 };
    expect((await consumeRateLimit([bucket], 0)).allowed).toBe(true);
    expect((await consumeRateLimit([bucket], 1_000)).allowed).toBe(true);
    const blocked = await consumeRateLimit([bucket], 2_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect((await consumeRateLimit([bucket], 60_000)).allowed).toBe(true);
    expect(database.hasRawValue(hashToken('admin@example.com'))).toBe(false);
  });
});
