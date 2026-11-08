import { getDb } from './firestore';
import type { AnalyticsSummary } from './types/general';

const COLLECTION = 'analyticsDaily';
const RETENTION_DAYS = 90;
const MAX_BUCKETS = 50;

type BucketMap = Record<string, number>;

type DailyAnalytics = {
  day: string;
  pageViews: number;
  cvDownloads: number;
  pages: BucketMap;
  referrers: BucketMap;
  countries: BucketMap;
  browsers: BucketMap;
  devices: BucketMap;
};

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
  if (/bot|crawler|spider|slurp|headless/.test(s)) browser = 'Bot';
  else if (/edg\//.test(s)) browser = 'Edge';
  else if (/opr\/|opera/.test(s)) browser = 'Opera';
  else if (/firefox/.test(s)) browser = 'Firefox';
  else if (/chrome/.test(s)) browser = 'Chrome';
  else if (/safari/.test(s)) browser = 'Safari';

  return { device, os, browser };
}

export function isLikelyBot(ua: string): boolean {
  return parseUserAgent(ua).browser === 'Bot';
}

export function normalizeAnalyticsPath(value: string): string {
  if (!value.startsWith('/')) return '/';
  const path = value.split('?')[0].split('#')[0];
  return path.length > 200 ? path.slice(0, 200) : path || '/';
}

export function normalizeReferrer(value: string): string {
  if (!value) return '';
  try {
    return new URL(value).hostname.slice(0, 120);
  } catch {
    return '';
  }
}

function countryFromRequest(request: Request): string {
  return (
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    'Unknown'
  )
    .slice(0, 2)
    .toUpperCase();
}

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function emptyDay(day: string): DailyAnalytics {
  return {
    day,
    pageViews: 0,
    cvDownloads: 0,
    pages: {},
    referrers: {},
    countries: {},
    browsers: {},
    devices: {},
  };
}

function incrementBucket(map: BucketMap, key: string) {
  if (!key) return;
  if (map[key] === undefined && Object.keys(map).length >= MAX_BUCKETS) return;
  map[key] = (map[key] ?? 0) + 1;
}

async function incrementDaily(
  request: Request,
  event: { type: 'pageView' | 'cvDownload'; path?: string; referrer?: string }
) {
  const day = dayKey();
  const db = getDb();
  const ref = db.collection(COLLECTION).doc(day);
  const ua = request.headers.get('user-agent') ?? '';
  const parsed = parseUserAgent(ua);
  if (isLikelyBot(ua)) return false;

  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists ? (snapshot.data() as Partial<DailyAnalytics>) : emptyDay(day);
    const next: DailyAnalytics = {
      ...emptyDay(day),
      ...current,
      pages: { ...(current.pages ?? {}) },
      referrers: { ...(current.referrers ?? {}) },
      countries: { ...(current.countries ?? {}) },
      browsers: { ...(current.browsers ?? {}) },
      devices: { ...(current.devices ?? {}) },
    };

    if (event.type === 'pageView') {
      next.pageViews += 1;
      incrementBucket(next.pages, normalizeAnalyticsPath(event.path ?? '/'));
      incrementBucket(next.referrers, normalizeReferrer(event.referrer ?? ''));
    } else {
      next.cvDownloads += 1;
    }
    incrementBucket(next.countries, countryFromRequest(request));
    incrementBucket(next.browsers, parsed.browser);
    incrementBucket(next.devices, parsed.device);
    transaction.set(ref, next);
  });
  return true;
}

export async function recordPageView(
  request: Request,
  entry: { path: string; referrer?: string }
): Promise<boolean> {
  return incrementDaily(request, { type: 'pageView', ...entry });
}

export async function recordCvDownload(request: Request): Promise<boolean> {
  return incrementDaily(request, { type: 'cvDownload' });
}

function mergeBuckets(target: BucketMap, source: BucketMap | undefined) {
  for (const [key, value] of Object.entries(source ?? {})) target[key] = (target[key] ?? 0) + value;
}

function topN(map: BucketMap, limit = 10) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const safeDays = Math.max(1, Math.min(RETENTION_DAYS, Math.floor(days)));
  const keys = Array.from({ length: safeDays }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - index);
    return dayKey(date);
  });
  const db = getDb();
  const snapshots = await Promise.all(keys.map(key => db.collection(COLLECTION).doc(key).get()));
  const result = emptyDay(dayKey());
  for (const snapshot of snapshots) {
    if (!snapshot.exists) continue;
    const data = snapshot.data() as Partial<DailyAnalytics>;
    result.pageViews += data.pageViews ?? 0;
    result.cvDownloads += data.cvDownloads ?? 0;
    mergeBuckets(result.pages, data.pages);
    mergeBuckets(result.referrers, data.referrers);
    mergeBuckets(result.countries, data.countries);
    mergeBuckets(result.browsers, data.browsers);
    mergeBuckets(result.devices, data.devices);
  }

  return {
    days: safeDays,
    pageViews: result.pageViews,
    cvDownloads: result.cvDownloads,
    topPages: topN(result.pages),
    topReferrers: topN(result.referrers),
    topCountries: topN(result.countries),
    browsers: topN(result.browsers),
    devices: topN(result.devices),
  };
}

export { RETENTION_DAYS };
