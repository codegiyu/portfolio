import { describe, expect, it } from 'vitest';
import { escapeCssUrl, isSafeAssetUrl, isSafeHttpUrl } from '@/lib/safe-url';

describe('safe URL boundaries', () => {
  it('accepts http(s) URLs and rejects executable or credentialed URLs', () => {
    expect(isSafeHttpUrl('https://example.com/assets/image.webp')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('https://user:pass@example.com/image.webp')).toBe(false);
  });

  it('accepts local asset paths but rejects protocol-relative and CSS-injection paths', () => {
    expect(isSafeAssetUrl('/images/profile.jpg')).toBe(true);
    expect(isSafeAssetUrl('//attacker.example/image.jpg')).toBe(false);
    expect(isSafeAssetUrl('/images/" onerror="alert(1)')).toBe(false);
  });

  it('escapes CSS URL delimiters', () => {
    expect(escapeCssUrl('https://example.com/a")')).toBe('https://example.com/a\\"\\)');
  });
});
