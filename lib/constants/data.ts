import { SocialMediaLinkProps } from '@/sections/home/AboutSection';
import { ContactDisplayProps } from '@/sections/home/ContactSection';
import { SkillsBoxProps } from '@/sections/home/ServicesSection';
import { ProjectSingleProps } from '@/sections/home/WorksSection';
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
  PHP: '/images/skills/php.svg',
  MySQL: '/images/skills/mysql.svg',
};

export type Skill = keyof typeof skillIcons;

export const SKILLS: SkillsBoxProps[] = [
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
  // { skill: 'Express JS' },
  // { skill: 'Mongo DB' },
  // { skill: "PHP" },
  // { skill: "MySQL" },
];

const PROJECTS: ProjectSingleProps[] = [
  {
    img: '/images/projects/zed-web.png',
    title: 'ZedApp Web',
    description: 'MVP Web Counterpart Application for ZedApp Mobile App',
    skills: ['React', 'Next JS', 'Typescript', 'TailwindCSS'],
    liveLink: 'https://app.zedapp.co',
  },
  {
    img: 'https://static.pinpoint.ng/site-preview.png',
    title: 'Pinpoint Global Website',
    description:
      'Company website for Pinpoint Global, a branding, marketing and packaging company with headquarters in Abuja',
    skills: ['React', 'Next JS', 'Typescript', 'TailwindCSS'],
    liveLink: 'https://pinpoint.ng',
  },
  {
    img: '/images/projects/zed.png',
    title: 'ZedApp Website',
    description: 'Landing page for ZedApp',
    skills: ['React', 'Next JS', 'Typescript', 'TailwindCSS'],
    liveLink: 'https://zedapp.co',
  },
  {
    img: 'https://static.thesolaceinitiative.org/images/site-preview.webp',
    title: 'The SHE Initiative Landing Page',
    description: 'Landing page for The Solace Healing and Empowerment Initiative',
    skills: ['React', 'Next JS', 'Typescript', 'TailwindCSS'],
    liveLink: 'https://thesolaceinitiative.org',
  },
  {
    img: '/images/projects/lendsqr.png',
    title: 'Lendsqr Users Dashboard',
    description: 'Mock simple website for Lendsqr Users Dashboard',
    skills: ['React', 'Typescript', 'SCSS'],
    liveLink: 'https://edward-precious-omegbu-lensqr-fe-test.vercel.app',
  },
  {
    img: '/images/projects/eye-connect.png',
    title: 'EyeConnect Landing Page',
    description: 'Landing page for the EyeConnect Initiative',
    skills: ['React', 'Next JS', 'Typescript', 'TailwindCSS'],
    liveLink: 'https://www.eyeconnectglobal.com',
  },
];

export default PROJECTS;
