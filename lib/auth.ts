// Pure token helpers — no Node.js or Firebase SDK, safe for Edge runtime

export function isValidMagicLinkToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  try {
    const parts = token.split('|');
    if (parts.length !== 3) return false;
    const tokenTime = parseInt(parts[1]);
    if (isNaN(tokenTime)) return false;
    return Date.now() - tokenTime < 24 * 60 * 60 * 1000; // 24 h
  } catch {
    return false;
  }
}

export function generateMagicLinkToken(email: string, secret: string): string {
  const timestamp = Date.now().toString();
  const raw = `${email}${timestamp}${secret}`;
  const hash = Buffer.from(raw).toString('base64');
  return `${email}|${timestamp}|${hash}`;
}
