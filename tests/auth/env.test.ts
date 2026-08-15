import { generateKeyPairSync } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { ConfigError, getAuthConfig, getR2Config } from '@/lib/server/env';

const testPrivateKey = generateKeyPairSync('rsa', { modulusLength: 1024 })
  .privateKey.export({ type: 'pkcs8', format: 'pem' })
  .toString();

afterEach(() => {
  vi.unstubAllEnvs();
  for (const name of [
    'ADMIN_EMAIL',
    'NEXT_PUBLIC_APP_URL',
    'FIREBASE_SERVICE_ACCOUNT_JSON',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL',
  ])
    delete process.env[name];
});

describe('server environment validation', () => {
  it('parses valid auth configuration without returning secret values to errors', () => {
    process.env.ADMIN_EMAIL = 'ADMIN@example.com';
    process.env.NEXT_PUBLIC_APP_URL = 'https://portfolio.example.com/';
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      project_id: 'portfolio',
      client_email: 'firebase-adminsdk@example.com',
      private_key: testPrivateKey,
    });
    expect(getAuthConfig()).toMatchObject({
      adminEmail: 'admin@example.com',
      appUrl: 'https://portfolio.example.com',
    });
  });

  it('fails closed for malformed service-account JSON', () => {
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.NEXT_PUBLIC_APP_URL = 'https://portfolio.example.com';
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = 'not-json-secret';
    expect(() => getAuthConfig()).toThrow(ConfigError);
    try {
      getAuthConfig();
    } catch (error) {
      expect(String(error)).not.toContain('not-json-secret');
    }
  });

  it('fails closed for a malformed private key without echoing it', () => {
    const supplied = '-----BEGIN PRIVATE KEY-----not-a-key-----END PRIVATE KEY-----';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.NEXT_PUBLIC_APP_URL = 'https://portfolio.example.com';
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      project_id: 'portfolio',
      client_email: 'firebase-adminsdk@example.com',
      private_key: supplied,
    });
    expect(() => getAuthConfig()).toThrow(ConfigError);
    try {
      getAuthConfig();
    } catch (error) {
      expect(String(error)).not.toContain(supplied);
    }
  });

  it('validates R2 only when R2 is requested', () => {
    process.env.R2_ACCOUNT_ID = 'account';
    process.env.R2_ACCESS_KEY_ID = 'access';
    process.env.R2_SECRET_ACCESS_KEY = 'secret';
    process.env.R2_BUCKET_NAME = 'bucket';
    process.env.R2_PUBLIC_URL = 'https://static.example.com';
    expect(getR2Config().publicUrl).toBe('https://static.example.com');
  });

  it('requires HTTPS for the production application origin', () => {
    vi.stubEnv('NODE_ENV', 'production');
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.NEXT_PUBLIC_APP_URL = 'http://portfolio.example.com';
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      project_id: 'portfolio',
      client_email: 'firebase-adminsdk@example.com',
      private_key: testPrivateKey,
    });
    expect(() => getAuthConfig()).toThrow(ConfigError);
  });

  it('rejects application URLs with query or fragment components', () => {
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.NEXT_PUBLIC_APP_URL = 'https://portfolio.example.com/?next=/admin';
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      project_id: 'portfolio',
      client_email: 'firebase-adminsdk@example.com',
      private_key: testPrivateKey,
    });
    expect(() => getAuthConfig()).toThrow(ConfigError);
  });
});
