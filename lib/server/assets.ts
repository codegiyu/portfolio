import 'server-only';

import { deleteR2Urls } from '@/lib/r2';
import { logServerError } from '@/lib/server/logging';

export function assetUrls(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  return [];
}

export async function cleanupReplacedAssets(previous: string[], next: string[]): Promise<void> {
  const nextSet = new Set(next);
  const removed = previous.filter(url => !nextSet.has(url));
  if (removed.length === 0 || !process.env.R2_PUBLIC_URL) return;
  try {
    await deleteR2Urls(removed);
  } catch (error) {
    logServerError('ASSET_CLEANUP_FAILED', {
      count: removed.length,
      errorName: error instanceof Error ? error.name : 'unknown',
    });
  }
}
