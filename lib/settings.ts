import { socialMediaLinks, contactInfo, SKILLS, skillIcons } from './constants/data';
import type {
  SiteSettings,
  AboutSettings,
  SocialLink,
  ContactItem,
  SkillsSettings,
  SpecialtyCard,
  SettingsKey,
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

export type {
  AboutSettings,
  SocialLink,
  ContactItem,
  SkillsSettings,
  SpecialtyCard,
  SiteSettings,
  SettingsKey,
};
