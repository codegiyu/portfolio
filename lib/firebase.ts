// Firebase config (for future Firebase SDK usage)
// Token helpers are in lib/auth.ts

export { isValidMagicLinkToken } from './auth';

export function generateMagicLinkToken(email: string): string {
  const secret = process.env.MAGIC_LINK_SECRET || 'dev-secret';
  const timestamp = Date.now().toString();
  const hash = Buffer.from(`${email}${timestamp}${secret}`).toString('base64');
  return `${email}|${timestamp}|${hash}`;
}
