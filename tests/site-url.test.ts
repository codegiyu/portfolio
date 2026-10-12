import { afterEach, describe, expect, it } from 'vitest';
import { getSiteUrl, isIndexableEnvironment, siteOrigin } from '@/lib/site-url';

const originalUrl = process.env.NEXT_PUBLIC_APP_URL;
const originalVercelEnv = process.env.VERCEL_ENV;
const originalVercelUrl = process.env.VERCEL_URL;
const originalNodeEnv = process.env.NODE_ENV;
const env = process.env as Record<string, string | undefined>;

afterEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = originalUrl;
  process.env.VERCEL_ENV = originalVercelEnv;
  process.env.VERCEL_URL = originalVercelUrl;
  env.NODE_ENV = originalNodeEnv;
});

describe('site URL policy', () => {
  it('normalizes the configured origin', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com///';
    expect(getSiteUrl().toString()).toBe('https://example.com/');
    expect(siteOrigin()).toBe('https://example.com');
  });

  it('only allows indexing in production', () => {
    process.env.VERCEL_ENV = 'preview';
    expect(isIndexableEnvironment()).toBe(false);
    process.env.VERCEL_ENV = 'production';
    expect(isIndexableEnvironment()).toBe(true);
  });

  it('uses the deployment hostname for preview metadata', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.VERCEL_URL = 'portfolio-preview.example.vercel.app';
    process.env.NEXT_PUBLIC_APP_URL = 'https://portfolio-codegiyu.vercel.app';
    expect(siteOrigin()).toBe('https://portfolio-preview.example.vercel.app');
  });
});
