import { describe, expect, it } from 'vitest';
import {
  isLikelyBot,
  normalizeAnalyticsPath,
  normalizeReferrer,
  parseUserAgent,
} from '@/lib/tracking';

describe('privacy-safe analytics normalization', () => {
  it('normalizes paths and removes query strings', () => {
    expect(normalizeAnalyticsPath('/projects/demo?utm_source=test')).toBe('/projects/demo');
    expect(normalizeAnalyticsPath('https://example.com/secret')).toBe('/');
  });

  it('stores only a referrer hostname', () => {
    expect(normalizeReferrer('https://example.com/path?email=private@example.com')).toBe(
      'example.com'
    );
    expect(normalizeReferrer('not a url')).toBe('');
  });

  it('classifies browsers, devices, and bots without retaining the user agent', () => {
    expect(
      parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1')
    ).toMatchObject({
      browser: 'Safari',
      device: 'mobile',
      os: 'iOS',
    });
    expect(isLikelyBot('Googlebot/2.1 (+http://www.google.com/bot.html)')).toBe(true);
  });
});
