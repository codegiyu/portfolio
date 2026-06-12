export function isValidMagicLinkToken(token: string, secret: string): boolean {
  if (!token || typeof token !== 'string') return false;
  try {
    const parts = token.split('|');
    if (parts.length !== 3) return false;
    const [email, timestampStr, hash] = parts;
    const tokenTime = parseInt(timestampStr);
    if (isNaN(tokenTime)) return false;
    if (Date.now() - tokenTime >= 24 * 60 * 60 * 1000) return false;
    const expectedHash = btoa(`${email}${timestampStr}${secret}`);
    return hash === expectedHash;
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
