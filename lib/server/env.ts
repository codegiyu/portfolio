import 'server-only';
import { createPrivateKey } from 'node:crypto';
import { z } from 'zod';

export class ConfigError extends Error {
  constructor(
    public readonly code: string,
    public readonly variables: string[]
  ) {
    super(`Configuration error: ${code} (${variables.join(', ')})`);
    this.name = 'ConfigError';
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const emailSchema = z.string().trim().email();
const urlSchema = z
  .string()
  .trim()
  .url()
  .refine(value => ['http:', 'https:'].includes(new URL(value).protocol));

const serviceAccountSchema = z.object({
  project_id: z.string().min(1),
  client_email: emailSchema,
  private_key: z
    .string()
    .min(1)
    .refine(value => value.includes('PRIVATE KEY')),
});

export type ServiceAccount = z.infer<typeof serviceAccountSchema>;

function required(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) throw new ConfigError('MISSING_REQUIRED_VARIABLE', [name]);
  return value.trim();
}

function parseServiceAccount(): ServiceAccount {
  const raw = required('FIREBASE_SERVICE_ACCOUNT_JSON');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ConfigError('INVALID_FIREBASE_SERVICE_ACCOUNT_JSON', [
      'FIREBASE_SERVICE_ACCOUNT_JSON',
    ]);
  }

  const result = serviceAccountSchema.safeParse(parsed);
  if (!result.success) {
    throw new ConfigError('INVALID_FIREBASE_SERVICE_ACCOUNT_JSON', [
      'FIREBASE_SERVICE_ACCOUNT_JSON',
    ]);
  }
  try {
    createPrivateKey({ key: result.data.private_key, format: 'pem' });
  } catch {
    throw new ConfigError('INVALID_FIREBASE_SERVICE_ACCOUNT_JSON', [
      'FIREBASE_SERVICE_ACCOUNT_JSON',
    ]);
  }
  return result.data;
}

export type AuthConfig = {
  adminEmail: string;
  appUrl: string;
  serviceAccount: ServiceAccount;
};

export function getFirebaseServiceAccount(): ServiceAccount {
  return parseServiceAccount();
}

export function getAuthConfig(): AuthConfig {
  const adminEmailRaw = required('ADMIN_EMAIL');
  const appUrl = required('NEXT_PUBLIC_APP_URL');
  const adminEmailResult = emailSchema.safeParse(adminEmailRaw);
  const appUrlResult = urlSchema.safeParse(appUrl);

  if (!adminEmailResult.success) throw new ConfigError('INVALID_ADMIN_EMAIL', ['ADMIN_EMAIL']);
  if (!appUrlResult.success) throw new ConfigError('INVALID_APP_URL', ['NEXT_PUBLIC_APP_URL']);
  const parsedAppUrl = new URL(appUrlResult.data);
  if (
    parsedAppUrl.username ||
    parsedAppUrl.password ||
    parsedAppUrl.search ||
    parsedAppUrl.hash ||
    (process.env.NODE_ENV === 'production' && parsedAppUrl.protocol !== 'https:')
  ) {
    throw new ConfigError('INVALID_APP_URL', ['NEXT_PUBLIC_APP_URL']);
  }

  return {
    adminEmail: normalizeEmail(adminEmailResult.data),
    appUrl: `${parsedAppUrl.origin}${parsedAppUrl.pathname.replace(/\/+$/, '')}`,
    serviceAccount: getFirebaseServiceAccount(),
  };
}

export type SmtpConfig = {
  email: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
};

export function getSmtpConfig(): SmtpConfig {
  const email = required('NODEMAILER_EMAIL');
  const password = required('NODEMAILER_PASSWORD');
  const result = emailSchema.safeParse(email);
  if (!result.success) throw new ConfigError('INVALID_NODEMAILER_EMAIL', ['NODEMAILER_EMAIL']);
  const host = process.env.NODEMAILER_HOST?.trim() || 'smtp.zoho.com';
  const rawPort = process.env.NODEMAILER_PORT?.trim() || '465';
  const port = Number(rawPort);
  const secure = process.env.NODEMAILER_SECURE?.trim().toLowerCase() !== 'false';
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError('INVALID_NODEMAILER_TRANSPORT', [
      'NODEMAILER_HOST',
      'NODEMAILER_PORT',
      'NODEMAILER_SECURE',
    ]);
  }
  return { email: normalizeEmail(result.data), password, host, port, secure };
}

export type MailConfig = SmtpConfig & { adminEmail: string };

export function getMailConfig(): MailConfig {
  const adminEmailRaw = required('ADMIN_EMAIL');
  const adminEmailResult = emailSchema.safeParse(adminEmailRaw);
  if (!adminEmailResult.success) throw new ConfigError('INVALID_ADMIN_EMAIL', ['ADMIN_EMAIL']);
  return { ...getSmtpConfig(), adminEmail: normalizeEmail(adminEmailResult.data) };
}

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
};

export function getR2Config(): R2Config {
  const accountId = required('R2_ACCOUNT_ID');
  const accessKeyId = required('R2_ACCESS_KEY_ID');
  const secretAccessKey = required('R2_SECRET_ACCESS_KEY');
  const bucketName = required('R2_BUCKET_NAME');
  const publicUrl = required('R2_PUBLIC_URL');
  if (!urlSchema.safeParse(publicUrl).success) {
    throw new ConfigError('INVALID_R2_PUBLIC_URL', ['R2_PUBLIC_URL']);
  }
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl: publicUrl.replace(/\/$/, ''),
  };
}

export function getContactConfig(): MailConfig {
  return getMailConfig();
}
