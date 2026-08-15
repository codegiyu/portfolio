import { getDb } from './firestore';
import { socialMediaLinks, contactInfo, SKILLS, skillIcons } from './constants/data';
import type {
  SiteSettings,
  AboutSettings,
  SocialLink,
  ContactItem,
  SkillsSettings,
  SpecialtyCard,
} from './types/general';

export const LOCAL_FALLBACKS: SiteSettings = {
  about: {
    greeting: "Hi, I'm Edward",
    name: 'Edward',
    role: 'Fullstack Product Engineer',
    bio: 'I build scalable products end-to-end — mobile apps with React Native & Expo, backends with Node.js, and web platforms with Next.js. I care about architecture, developer experience, and shipping things that actually work.',
    profileImage: '/images/eddy-profile.jpg',
    cvUrl: 'https://drive.google.com/file/d/1xOXjqKNRdTGmKQvdp0KMO6kFHD9LYITb/view?usp=sharing',
  },
  social: {
    links: socialMediaLinks.map(({ link, imgSrc, alt }) => ({
      platform: alt,
      url: link,
      icon: imgSrc,
      alt,
    })),
  },
  contact: {
    items: contactInfo.map(item => ({
      type: 'phone',
      text: item.text,
      value: item.value,
    })),
  },
  skills: {
    active: SKILLS.map(s => s.skill),
    icons: skillIcons,
  },
  specialties: {
    cards: [
      {
        label: 'Mobile',
        description: 'React Native & Expo apps for iOS and Android, from MVP to production.',
      },
      {
        label: 'Backend',
        description: 'Node.js APIs and services with Express, Hono, or Fastify — built to scale.',
      },
      {
        label: 'Web',
        description:
          'Next.js web platforms and marketing sites with performance as a first-class concern.',
      },
    ],
  },
};

export type SettingsKey = keyof SiteSettings;

export async function getSetting<K extends SettingsKey>(key: K): Promise<SiteSettings[K]> {
  try {
    const db = getDb();
    const doc = await db.collection('settings').doc(key).get();
    if (doc.exists && doc.data()) {
      return doc.data() as SiteSettings[K];
    }
  } catch {
    // Firestore unavailable or doc missing — fall through to local
  }
  return LOCAL_FALLBACKS[key];
}

export async function getAllSettings(): Promise<SiteSettings> {
  try {
    const db = getDb();
    const keys = Object.keys(LOCAL_FALLBACKS) as SettingsKey[];
    const results = await Promise.allSettled(keys.map(k => db.collection('settings').doc(k).get()));

    const merged = { ...LOCAL_FALLBACKS };
    results.forEach((res, i) => {
      if (res.status === 'fulfilled' && res.value.exists && res.value.data()) {
        const key = keys[i];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (merged as any)[key] = res.value.data();
      }
    });
    return merged;
  } catch {
    return LOCAL_FALLBACKS;
  }
}

export type { AboutSettings, SocialLink, ContactItem, SkillsSettings, SpecialtyCard, SiteSettings };
