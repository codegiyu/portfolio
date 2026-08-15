import { getDb } from './firestore';
import type { CvDownload, PageView } from './types/general';

// ─── User-Agent parsing ───────────────────────────────────────────────────────

export function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  const s = ua.toLowerCase();

  const device = /ipad|tablet/.test(s)
    ? 'tablet'
    : /mobile|android|iphone|ipod/.test(s)
      ? 'mobile'
      : 'desktop';

  let os = 'Unknown';
  if (/android/.test(s)) os = 'Android';
  else if (/iphone|ipad|ipod/.test(s)) os = 'iOS';
  else if (/windows/.test(s)) os = 'Windows';
  else if (/mac os/.test(s)) os = 'macOS';
  else if (/linux/.test(s)) os = 'Linux';

  let browser = 'Unknown';
  if (/edg\//.test(s)) browser = 'Edge';
  else if (/opr\/|opera/.test(s)) browser = 'Opera';
  else if (/firefox/.test(s)) browser = 'Firefox';
  else if (/chrome/.test(s)) browser = 'Chrome';
  else if (/safari/.test(s)) browser = 'Safari';

  return { device, os, browser };
}

// ─── IP & geo ─────────────────────────────────────────────────────────────────

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

const LOCAL_IP = /^(127\.|192\.168\.|10\.|::1|unknown)/;

export async function getGeo(request: Request): Promise<{ country?: string; city?: string }> {
  // Platform-injected headers (Vercel, Cloudflare) — zero latency
  const country =
    request.headers.get('x-vercel-ip-country') ?? request.headers.get('cf-ipcountry') ?? null;
  const city = request.headers.get('x-vercel-ip-city') ?? request.headers.get('cf-ipcity') ?? null;
  if (country) return { country, city: city ?? undefined };

  // Fall back to ip-api.com (free, no key required)
  const ip = getClientIp(request);
  if (LOCAL_IP.test(ip)) return {};

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const data = (await res.json()) as { status: string; country?: string; city?: string };
    if (data.status === 'success') return { country: data.country, city: data.city };
  } catch {
    // geo unavailable
  }
  return {};
}

// ─── CV downloads ─────────────────────────────────────────────────────────────

export async function recordCvDownload(entry: Omit<CvDownload, 'id'>): Promise<void> {
  const db = getDb();
  await db.collection('cv-downloads').add(entry);
}

export async function getCvDownloads(): Promise<CvDownload[]> {
  const db = getDb();
  const snap = await db.collection('cv-downloads').orderBy('timestamp', 'desc').limit(500).get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CvDownload);
}

// ─── Page views ───────────────────────────────────────────────────────────────

export async function recordPageView(entry: Omit<PageView, 'id'>): Promise<void> {
  const db = getDb();
  await db.collection('analytics').add(entry);
}

export async function getPageViews(): Promise<PageView[]> {
  const db = getDb();
  const snap = await db.collection('analytics').orderBy('timestamp', 'desc').limit(1000).get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as PageView);
}
