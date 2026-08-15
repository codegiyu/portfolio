import { describe, expect, it } from 'vitest';
import {
  equalSecrets,
  generateOpaqueToken,
  hashToken,
  isOpaqueToken,
} from '@/lib/server/auth/crypto';

describe('auth crypto primitives', () => {
  it('generates unpredictable opaque 256-bit tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateOpaqueToken()));
    expect(tokens.size).toBe(100);
    for (const token of tokens) {
      expect(isOpaqueToken(token)).toBe(true);
      expect(token).not.toContain('admin@example.com');
      expect(hashToken(token)).not.toBe(token);
    }
  });

  it('compares secrets without exposing a direct equality path', () => {
    expect(equalSecrets('admin@example.com', 'admin@example.com')).toBe(true);
    expect(equalSecrets('admin@example.com', 'other@example.com')).toBe(false);
  });
});
