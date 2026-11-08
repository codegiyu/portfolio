import { SocialMediaLinkProps } from '@/sections/home/AboutSection';
import { ContactDisplayProps } from '@/sections/home/ContactSection';
import { Phone } from 'lucide-react';

export const socialMediaLinks: SocialMediaLinkProps[] = [
  {
    link: 'https://x.com/TheLonerider20',
    imgSrc: '/images/twitter.svg',
    alt: 'x',
  },
  {
    link: 'https://github.com/codegiyu',
    imgSrc: '/images/github.svg',
    alt: 'github',
  },
  {
    link: 'https://www.linkedin.com/in/edward-precious-omegbu',
    imgSrc: '/images/linkedin.svg',
    alt: 'linkedin',
  },
  {
    link: 'https://wa.me/2348140629487',
    imgSrc: '/images/whatsapp.svg',
    alt: 'whatsapp',
  },
];

export const contactInfo: ContactDisplayProps[] = [
  {
    Icon: Phone,
    text: '+234 814 062 9487',
    value: '+2348140629487',
  },
];

export const skillIcons = {
  HTML5: '/images/skills/html5.svg',
  CSS3: '/images/skills/css3.svg',
  Javascript: '/images/skills/javascript.svg',
  Typescript: '/images/skills/typescript.svg',
  SCSS: '/images/skills/scss.svg',
  'Bootstrap 5': '/images/skills/bootstrap.svg',
  TailwindCSS: '/images/skills/tailwindcss.svg',
  JQuery: '/images/skills/jquery.svg',
  React: '/images/skills/react.svg',
  'Next JS': '/images/skills/nextjs.svg',
  'Node.js': '/images/skills/nodejs.svg',
  'Express JS': '/images/skills/express.svg',
  'Mongo DB': '/images/skills/mongodb.svg',
  PostgreSQL: '/images/skills/postgresql.svg',
  Docker: '/images/skills/docker.svg',
  PHP: '/images/skills/php.svg',
  MySQL: '/images/skills/mysql.svg',
};

export type Skill = keyof typeof skillIcons;

export const SKILLS: { skill: Skill }[] = [
  { skill: 'HTML5' },
  { skill: 'CSS3' },
  { skill: 'Javascript' },
  { skill: 'Typescript' },
  { skill: 'SCSS' },
  // { skill: 'Bootstrap 5' },
  { skill: 'TailwindCSS' },
  // { skill: 'JQuery' },
  { skill: 'React' },
  { skill: 'Next JS' },
  { skill: 'Node.js' },
  { skill: 'Express JS' },
  { skill: 'Mongo DB' },
  { skill: 'PostgreSQL' },
  { skill: 'Docker' },
  // { skill: "PHP" },
  // { skill: "MySQL" },
];
