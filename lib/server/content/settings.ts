import 'server-only';

import { Timestamp } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firestore';
import { LOCAL_FALLBACKS } from '@/lib/settings';
import {
  ContentConflictError,
  ContentNotFoundError,
  ContentUnavailableError,
  ContentValidationError,
} from './errors';
import { cachedContent } from './cache';
import { invalidateSettings } from './revalidate';
import { parseSettingsValue } from './schemas';
import type { AdminSettingsRecord } from './types';
import type { SettingsKey, SiteSettings } from '@/lib/types/general';
import { assetUrls, cleanupReplacedAssets } from '@/lib/server/assets';

const keys = Object.keys(LOCAL_FALLBACKS) as SettingsKey[];

function fixtureMode() {
  return process.env.NODE_ENV !== 'production' && process.env.CONTENT_FIXTURE_MODE === 'true';
}

async function readSettings(): Promise<SiteSettings> {
  try {
    const db = getDb();
    const snapshots = await Promise.all(keys.map(key => db.collection('settings').doc(key).get()));
    const missing = snapshots.some(snapshot => !snapshot.exists);
    if (missing) {
      if (fixtureMode()) return LOCAL_FALLBACKS;
      throw new ContentNotFoundError('Required settings are not initialized');
    }
    const result = {} as SiteSettings;
    snapshots.forEach((snapshot, index) => {
      const key = keys[index];
      (result as unknown as Record<string, unknown>)[key] = parseSettingsValue(
        key,
        snapshot.data()
      );
    });
    return result;
  } catch (error) {
    if (error instanceof ContentNotFoundError) throw error;
    if (error instanceof ContentValidationError) throw error;
    if (fixtureMode()) return LOCAL_FALLBACKS;
    throw new ContentUnavailableError();
  }
}

export async function getPublicSettings(): Promise<SiteSettings> {
  return cachedContent(readSettings, ['content', 'settings'], ['settings']);
}

export async function getAdminSettings(key: SettingsKey): Promise<AdminSettingsRecord> {
  try {
    const snapshot = await getDb().collection('settings').doc(key).get();
    if (!snapshot.exists) throw new ContentNotFoundError('Settings not found');
    const raw = snapshot.data() ?? {};
    const data = parseSettingsValue(key, raw);
    return {
      key,
      value: data as SiteSettings[SettingsKey],
      version: typeof raw.version === 'number' ? raw.version : 1,
      updatedAt:
        raw.updatedAt instanceof Timestamp
          ? raw.updatedAt.toDate().toISOString()
          : new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof ContentNotFoundError) throw error;
    if (error instanceof ContentValidationError) throw error;
    throw new ContentUnavailableError();
  }
}

export async function updateSettings(
  key: SettingsKey,
  value: unknown,
  expectedVersion?: number
): Promise<AdminSettingsRecord> {
  const normalized = parseSettingsValue(key, value);
  const db = getDb();
  const ref = db.collection('settings').doc(key);
  const now = Timestamp.now();
  let previousAssets: string[] = [];
  try {
    await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(ref);
      const current = snapshot.data() ?? {};
      if (key === 'about') {
        previousAssets = [...assetUrls(current.profileImage), ...assetUrls(current.cvUrl)];
      }
      const version = typeof current.version === 'number' ? current.version : 1;
      if (expectedVersion !== undefined && version !== expectedVersion) {
        throw new ContentConflictError('Settings were changed by another request');
      }
      transaction.set(
        ref,
        { ...normalized, version: version + 1, updatedAt: now },
        { merge: true }
      );
    });
    const updated = await getAdminSettings(key);
    if (key === 'about') {
      const value = updated.value as SiteSettings['about'];
      await cleanupReplacedAssets(previousAssets, [
        ...assetUrls(value.profileImage),
        ...assetUrls(value.cvUrl),
      ]);
    }
    invalidateSettings();
    return updated;
  } catch (error) {
    if (error instanceof ContentValidationError || error instanceof ContentConflictError)
      throw error;
    if (error instanceof ContentNotFoundError) throw error;
    throw new ContentUnavailableError();
  }
}
