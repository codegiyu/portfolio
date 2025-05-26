import { SocialMediaLinkProps } from '@/sections/home/AboutSection';
import { SkillsBoxProps } from '@/sections/home/ServicesSection';
import { ProjectSingleProps } from '@/sections/home/WorksSection';

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
    link: 'https://wa.me/2349123850193',
    imgSrc: '/images/whatsapp.svg',
    alt: 'whatsapp',
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
  { skill: 'Bootstrap 5' },
  { skill: 'TailwindCSS' },
  { skill: 'JQuery' },
  { skill: 'React' },
  { skill: 'Next JS' },
  { skill: 'Node.js' },
  { skill: 'Express JS' },
  { skill: 'Mongo DB' },
  // { skill: "PHP" },
  // { skill: "MySQL" },
];

const PROJECTS: ProjectSingleProps[] = [
  {
    img: '/images/projects/zed-web.png',
    title: 'ZedApp Web',
    description: 'Web Application for ZedApp',
    skills: ['React', 'Next JS', 'Typescript', 'TailwindCSS'],
    liveLink: 'https://app.zedapp.co',
  },
  {
    img: '/images/projects/zed.png',
    title: 'ZedApp Website',
    description: 'Landing page for ZedApp',
    skills: ['React', 'Next JS', 'Typescript', 'TailwindCSS'],
    liveLink: 'https://zedapp.co',
  },
  {
    img: '/images/projects/lendsqr.png',
    title: 'Lendsqr Users Dashboard',
    description: 'Mock simple website for Lendsqr Users Dashboard',
    skills: ['React', 'Typescript', 'SCSS'],
    liveLink: 'https://edward-precious-omegbu-lensqr-fe-test.vercel.app',
  },
  {
    img: '/images/projects/mentro.png',
    title: 'Mentro',
    description: 'Mentro mentors picture carousel with neat transitions',
    skills: ['React', 'SCSS'],
    liveLink: 'https://mentro-challenge.vercel.app',
  },
  // {
  //   img: '/images/projects/debt-management.png',
  //   title: 'Debt Management',
  //   description: 'Mock simple website for Debt Management Office Nigeria',
  //   skills: ['React', 'TailwindCSS', 'Node.js', 'Express JS', 'TailwindCSS'],
  //   liveLink: 'https://debt-management.vercel.app',
  // },
  // {
  //   img: '/images/projects/musica.png',
  //   title: 'Musica',
  //   description: 'Music streaming website with Spotify API',
  //   skills: ['React', 'TailwindCSS', 'Javascript'],
  //   liveLink: 'https://musica-challenge.vercel.app',
  // },
  // {
  //   img: '/images/projects/trivia.PNG',
  //   title: 'Trivia Quiz',
  //   description: 'Multichoice tivia quiz with different categories and questions fetched online',
  //   skills: ['HTML5', 'CSS3', 'Javascript', 'Bootstrap 5'],
  //   liveLink: 'https://codegiyu.github.io/games/trivia.html',
  // },
  // {
  //   img: '/images/projects/omorofan.jpg',
  //   title: 'Omorofan',
  //   description: 'Company website for Omorofan EMT Nig Ltd',
  //   skills: ['HTML5', 'CSS3', 'Javascript', 'JQuery', 'PHP'],
  //   liveLink: 'http://omorofan.com.ng',
  // },
];

export default PROJECTS;
