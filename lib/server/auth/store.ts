import { Timestamp } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firestore';
import { hashKey, hashToken, generateOpaqueToken, isOpaqueToken } from './crypto';
import { AUTH_COLLECTIONS, MAGIC_LINK_TTL_MS, SESSION_TTL_MS } from './constants';

type TimestampLike = Timestamp | Date | { toMillis?: () => number } | undefined;

function millis(value: TimestampLike): number | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.getTime();
  if (value instanceof Timestamp) return value.toMillis();
  return value.toMillis?.();
}

function timestamp(ms: number): Timestamp {
  return Timestamp.fromMillis(ms);
}

export type RateLimitBucket = {
  scope: string;
  key: string;
  windowMs: number;
  max: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export async function consumeRateLimit(
  buckets: RateLimitBucket[],
  nowMs = Date.now()
): Promise<RateLimitDecision> {
  const db = getDb();
  const windows = buckets.map(bucket => {
    const windowStart = Math.floor(nowMs / bucket.windowMs) * bucket.windowMs;
    return {
      bucket,
      windowStart,
      windowEnd: windowStart + bucket.windowMs,
      ref: db
        .collection(AUTH_COLLECTIONS.rateLimits)
        .doc(hashKey(`${bucket.scope}:${bucket.key}:${windowStart}`)),
    };
  });

  return db.runTransaction(async transaction => {
    const snapshots = await Promise.all(windows.map(({ ref }) => transaction.get(ref)));
    const exceeded = windows.some(({ bucket }, index) => {
      const data = snapshots[index].data() as { count?: number } | undefined;
      return (data?.count ?? 0) >= bucket.max;
    });

    if (exceeded) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil(Math.max(...windows.map(({ windowEnd }) => windowEnd - nowMs)) / 1000)
      );
      return { allowed: false, retryAfterSeconds };
    }

    windows.forEach(({ bucket, windowStart, windowEnd, ref }, index) => {
      const data = snapshots[index].data() as { count?: number } | undefined;
      transaction.set(
        ref,
        {
          scope: bucket.scope,
          windowStart: timestamp(windowStart),
          count: (data?.count ?? 0) + 1,
          expiresAt: timestamp(windowEnd),
        },
        { merge: true }
      );
    });

    return { allowed: true, retryAfterSeconds: 0 };
  });
}

export async function createMagicLink(token: string, nowMs = Date.now()): Promise<void> {
  if (!isOpaqueToken(token)) throw new Error('Invalid magic-link token');
  await getDb()
    .collection(AUTH_COLLECTIONS.links)
    .doc(hashToken(token))
    .create({
      principal: 'admin',
      createdAt: timestamp(nowMs),
      expiresAt: timestamp(nowMs + MAGIC_LINK_TTL_MS),
      consumedAt: null,
    });
}

export async function invalidateMagicLink(token: string): Promise<void> {
  if (!isOpaqueToken(token)) return;
  await getDb()
    .collection(AUTH_COLLECTIONS.links)
    .doc(hashToken(token))
    .update({ consumedAt: timestamp(Date.now()) })
    .catch(() => undefined);
}

export async function consumeMagicLinkAndCreateSession(
  token: string,
  nowMs = Date.now()
): Promise<string | null> {
  if (!isOpaqueToken(token)) return null;
  const db = getDb();
  const linkRef = db.collection(AUTH_COLLECTIONS.links).doc(hashToken(token));
  const sessionToken = generateOpaqueToken();
  const sessionRef = db.collection(AUTH_COLLECTIONS.sessions).doc(hashToken(sessionToken));

  const consumed = await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(linkRef);
    if (!snapshot.exists) return false;

    const data = snapshot.data() as {
      principal?: string;
      expiresAt?: TimestampLike;
      consumedAt?: TimestampLike;
    };
    const expiresAt = millis(data.expiresAt);
    if (data.principal !== 'admin' || !expiresAt || expiresAt <= nowMs || data.consumedAt) {
      return false;
    }

    transaction.update(linkRef, { consumedAt: timestamp(nowMs) });
    transaction.create(sessionRef, {
      principal: 'admin',
      createdAt: timestamp(nowMs),
      expiresAt: timestamp(nowMs + SESSION_TTL_MS),
      revokedAt: null,
    });
    return true;
  });

  return consumed ? sessionToken : null;
}

export async function getValidSession(token: string, nowMs = Date.now()): Promise<boolean> {
  if (!isOpaqueToken(token)) return false;
  const snapshot = await getDb().collection(AUTH_COLLECTIONS.sessions).doc(hashToken(token)).get();
  if (!snapshot.exists) return false;
  const data = snapshot.data() as {
    principal?: string;
    expiresAt?: TimestampLike;
    revokedAt?: TimestampLike;
  };
  const expiresAt = millis(data.expiresAt);
  return data.principal === 'admin' && !!expiresAt && expiresAt > nowMs && !data.revokedAt;
}

export async function revokeSession(token: string): Promise<void> {
  if (!isOpaqueToken(token)) return;
  const ref = getDb().collection(AUTH_COLLECTIONS.sessions).doc(hashToken(token));
  const snapshot = await ref.get();
  if (snapshot.exists) await ref.update({ revokedAt: timestamp(Date.now()) });
}
