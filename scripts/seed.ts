/**
 * Firestore seed script — run with:
 *   npx tsx scripts/seed.ts
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_JSON in your .env file.
 */

import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env var is not set');
    initializeApp({ credential: cert(JSON.parse(raw) as object) });
  }
  return getFirestore();
}

// ─── Projects ────────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: 'pinpoint-global',
    slug: 'pinpoint-global',
    title: 'Pinpoint Global Website',
    description:
      'Company website for a branding, marketing and packaging company with headquarters in Abuja',
    longDescription:
      'Built a modern, responsive company website for Pinpoint Global showcasing their services and portfolio.',
    image: 'https://static.pinpoint.ng/site-preview.png',
    gallery: [],
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    challenge:
      "Create a professional web presence that showcases Pinpoint Global's branding and marketing services while maintaining fast load times.",
    solution:
      'Built with Next.js for optimal performance, used Tailwind CSS for responsive design, and implemented image optimization for gallery-heavy content.',
    results:
      'Improved online presence, fast loading times with Core Web Vitals in the green, professional design aligned with brand identity.',
    liveLink: 'https://pinpoint.ng',
    sourceLink: '',
    featured: true,
    category: 'web-app',
  },
  {
    id: 'zedapp-website',
    slug: 'zedapp-website',
    title: 'ZedApp Website',
    description: 'Landing page and marketing website for ZedApp',
    longDescription:
      'Designed and built a compelling landing page for ZedApp that converts visitors and showcases product features.',
    image: '/images/projects/zed.png',
    gallery: [],
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    challenge:
      "Create an engaging landing page that highlights ZedApp's unique value proposition and drives sign-ups.",
    solution:
      'Implemented scroll animations, optimized CTAs, used compelling copy and visuals, integrated analytics for conversion tracking.',
    results:
      'High engagement metrics, improved conversion rate, strong SEO performance, fast page load times.',
    liveLink: 'https://zedapp.co',
    sourceLink: '',
    featured: true,
    category: 'landing',
  },
  {
    id: 'she-initiative',
    slug: 'she-initiative',
    title: 'The SHE Initiative Landing Page',
    description:
      'Landing page for The Solace Healing and Empowerment Initiative, a nonprofit focused on women empowerment in tech',
    longDescription:
      'Created a compelling landing page for a nonprofit organization dedicated to empowering women in technology.',
    image: 'https://static.thesolaceinitiative.org/images/site-preview.webp',
    gallery: [],
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    challenge:
      "Build a website that effectively communicates the organization's mission and encourages donations and volunteer sign-ups.",
    solution:
      'Focused on clear messaging, used testimonials and impact metrics, implemented donation integration, optimized for accessibility.',
    results:
      'Strong mission communication, improved volunteer engagement, easy donation flow, high accessibility score.',
    liveLink: 'https://thesolaceinitiative.org',
    sourceLink: '',
    featured: false,
    category: 'landing',
  },
  {
    id: 'lendsqr-dashboard',
    slug: 'lendsqr-dashboard',
    title: 'Lendsqr Users Dashboard',
    description: 'Mock admin dashboard for Lendsqr, featuring user management and analytics',
    longDescription:
      'Built a comprehensive admin dashboard with user filtering, pagination, and detailed user management capabilities.',
    image: '/images/projects/lendsqr.png',
    gallery: [],
    skills: ['React', 'TypeScript', 'SCSS', 'REST API'],
    challenge:
      'Create a complex data-heavy dashboard that displays user information with advanced filtering and sorting capabilities.',
    solution:
      'Implemented efficient state management, optimized data fetching, built reusable table components, added comprehensive filtering and pagination.',
    results:
      'Smooth user experience despite large datasets, fast sorting and filtering, clean UI that scales with data volume.',
    liveLink: 'https://edward-precious-omegbu-lendsqr-fe-test.vercel.app',
    sourceLink: 'https://github.com/codegiyu/lendsqr-fe-test',
    featured: true,
    category: 'dashboard',
  },
  {
    id: 'eyeconnect',
    slug: 'eyeconnect',
    title: 'EyeConnect Landing Page',
    description:
      'Landing page for the EyeConnect Initiative, connecting patients with eye care specialists',
    longDescription:
      'Built a healthcare-focused landing page that facilitates connections between patients and vision care specialists.',
    image: '/images/projects/eye-connect.png',
    gallery: [],
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    challenge:
      'Create a healthcare landing page that builds trust, clearly communicates services, and drives patient sign-ups.',
    solution:
      'Emphasized credibility with specialist profiles, integrated appointment booking, focused on accessibility for vision-impaired users.',
    results:
      'High trust signals, improved appointment booking rate, accessible to users with vision impairments, professional healthcare branding.',
    liveLink: 'https://www.eyeconnectglobal.com',
    sourceLink: '',
    featured: false,
    category: 'landing',
  },
];

// ─── Settings ─────────────────────────────────────────────────────────────────

const SETTINGS = {
  about: {
    greeting: "Hi, I'm Edward",
    name: 'Edward',
    role: 'Fullstack Product Engineer',
    bio: 'I build scalable products end-to-end — mobile apps with React Native & Expo, backends with Node.js, and web platforms with Next.js. I care about architecture, developer experience, and shipping things that actually work.',
    profileImage: '/images/eddy-profile.jpg',
    cvUrl: 'https://drive.google.com/file/d/1xOXjqKNRdTGmKQvdp0KMO6kFHD9LYITb/view?usp=sharing',
  },
  social: [
    {
      platform: 'twitter',
      url: 'https://x.com/TheLonerider20',
      icon: '/images/twitter.svg',
      alt: 'x',
    },
    {
      platform: 'github',
      url: 'https://github.com/codegiyu',
      icon: '/images/github.svg',
      alt: 'github',
    },
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/in/edward-precious-omegbu',
      icon: '/images/linkedin.svg',
      alt: 'linkedin',
    },
    {
      platform: 'whatsapp',
      url: 'https://wa.me/2348140629487',
      icon: '/images/whatsapp.svg',
      alt: 'whatsapp',
    },
  ],
  contact: [{ type: 'phone', text: '+234 814 062 9487', value: '+2348140629487' }],
  skills: {
    active: [
      'HTML5',
      'CSS3',
      'Javascript',
      'Typescript',
      'SCSS',
      'TailwindCSS',
      'React',
      'Next JS',
      'Node.js',
    ],
    icons: {
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
    },
  },
  specialties: [
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
};

// ─── Runner ───────────────────────────────────────────────────────────────────

async function seedProjects(db: FirebaseFirestore.Firestore) {
  console.log('Seeding projects...');
  const batch = db.batch();
  for (const project of PROJECTS) {
    const ref = db.collection('projects').doc(project.slug);
    batch.set(ref, project, { merge: true });
  }
  await batch.commit();
  console.log(`  ✓ ${PROJECTS.length} projects seeded`);
}

async function seedSettings(db: FirebaseFirestore.Firestore) {
  console.log('Seeding settings...');
  const batch = db.batch();

  // about, skills, specialties — stored as flat document fields
  batch.set(db.collection('settings').doc('about'), SETTINGS.about, { merge: true });
  batch.set(db.collection('settings').doc('skills'), SETTINGS.skills, { merge: true });

  // social, contact — stored with array wrapper so Firestore can handle them
  batch.set(db.collection('settings').doc('social'), { links: SETTINGS.social }, { merge: true });
  batch.set(db.collection('settings').doc('contact'), { items: SETTINGS.contact }, { merge: true });
  batch.set(
    db.collection('settings').doc('specialties'),
    { cards: SETTINGS.specialties },
    { merge: true }
  );

  await batch.commit();
  console.log('  ✓ settings seeded (about, social, contact, skills, specialties)');
}

async function main() {
  console.log('Connecting to Firestore...');
  const db = getDb();

  await seedProjects(db);
  await seedSettings(db);

  console.log('\nSeed complete.');
  process.exit(0);
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
