import { describe, expect, it } from 'vitest';
import { parseSettingsValue } from '@/lib/server/content/schemas';

describe('settings schemas', () => {
  it('rejects unsafe public links and image paths', () => {
    expect(() =>
      parseSettingsValue('social', {
        links: [
          {
            platform: 'other',
            url: 'javascript:alert(1)',
            icon: '/images/icon.svg',
            alt: 'Unsafe',
          },
        ],
      })
    ).toThrow();

    expect(() =>
      parseSettingsValue('about', {
        greeting: 'Hi',
        name: 'Edward',
        role: 'Engineer',
        bio: 'Bio',
        profileImage: '//attacker.example/image.jpg',
        cvUrl: '',
      })
    ).toThrow();
  });

  it('accepts the supported public settings shape', () => {
    expect(
      parseSettingsValue('contact', {
        items: [{ type: 'email', text: 'Email', value: 'hello@example.com' }],
      })
    ).toEqual({ items: [{ type: 'email', text: 'Email', value: 'hello@example.com' }] });
  });
});
