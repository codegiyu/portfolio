import { ConfigError, getAuthConfig, getSmtpConfig, normalizeEmail } from '@/lib/server/env';
import { equalSecrets, generateOpaqueToken, isOpaqueToken } from './crypto';
import { createMagicLink, invalidateMagicLink, consumeMagicLinkAndCreateSession } from './store';
import { MAGIC_LINK_TTL_MS } from './constants';

export type MagicLinkDelivery = (input: {
  token: string;
  email: string;
  appUrl: string;
}) => Promise<void>;

export async function issueMagicLink(
  email: string,
  deliver: MagicLinkDelivery,
  nowMs = Date.now()
): Promise<{ accepted: true; delivered: boolean }> {
  const config = getAuthConfig();
  getSmtpConfig();
  const normalizedEmail = normalizeEmail(email);

  if (!equalSecrets(normalizedEmail, config.adminEmail)) {
    await delay(250 + Math.floor(Math.random() * 250));
    return { accepted: true, delivered: false };
  }

  const token = generateOpaqueToken();
  await createMagicLink(token, nowMs);
  try {
    await deliver({ token, email: normalizedEmail, appUrl: config.appUrl });
    return { accepted: true, delivered: true };
  } catch (error) {
    await invalidateMagicLink(token);
    throw new Error('AUTH_EMAIL_DELIVERY_FAILED', { cause: error });
  }
}

export async function verifyMagicLink(token: string, nowMs = Date.now()): Promise<string | null> {
  getAuthConfig();
  if (!isOpaqueToken(token)) return null;
  return consumeMagicLinkAndCreateSession(token, nowMs);
}

export function isConfigurationError(error: unknown): boolean {
  return error instanceof ConfigError;
}

async function delay(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export { MAGIC_LINK_TTL_MS };
