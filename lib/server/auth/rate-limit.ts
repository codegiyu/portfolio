import { consumeRateLimit, type RateLimitDecision } from './store';

function firstForwardedIp(value: string | null): string | null {
  return value?.split(',')[0]?.trim() || null;
}

export function getTrustedClientIp(request: Request): string {
  if (process.env.VERCEL === '1') {
    return firstForwardedIp(request.headers.get('x-vercel-forwarded-for')) ?? 'unknown';
  }
  if (process.env.NODE_ENV !== 'production') return '127.0.0.1';
  return 'unknown';
}

export function checkSendLinkRateLimit(email: string, ip: string): Promise<RateLimitDecision> {
  return consumeRateLimit([
    { scope: 'send-email', key: email, windowMs: 60 * 60 * 1000, max: 3 },
    { scope: 'send-ip', key: ip, windowMs: 15 * 60 * 1000, max: 10 },
  ]);
}

export function checkVerifyRateLimit(ip: string): Promise<RateLimitDecision> {
  return consumeRateLimit([{ scope: 'verify-ip', key: ip, windowMs: 15 * 60 * 1000, max: 20 }]);
}
