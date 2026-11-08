const FALLBACK_SITE_URL = 'https://portfolio-codegiyu.vercel.app';

export function getSiteUrl(): URL {
  const previewUrl =
    process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL.trim()}`
      : undefined;
  const raw = previewUrl || process.env.NEXT_PUBLIC_APP_URL?.trim() || FALLBACK_SITE_URL;
  try {
    const url = new URL(raw);
    url.search = '';
    url.hash = '';
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url;
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

export function siteOrigin(): string {
  return getSiteUrl().toString().replace(/\/$/, '');
}

export function isIndexableEnvironment(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    (process.env.VERCEL_ENV === undefined && process.env.NODE_ENV === 'production')
  );
}
