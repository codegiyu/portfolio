/**
 * Firestore seed script — run with:
 *   npx tsx scripts/seed.ts
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_JSON in your .env file.
 */

import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

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
    id: 'crelyst',
    slug: 'crelyst',
    title: 'Crelyst Agency Website',
    description:
      'Full-stack website for Crelyst, a creative design and branding agency specialising in photography, brand design, and visual identity',
    longDescription:
      'Built a full-stack agency website with a comprehensive admin panel for managing services, projects, testimonials, and site settings — all without requiring client code deploys.',
    image: '',
    gallery: [],
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'MongoDB', 'Redis'],
    challenge:
      'Build a production-ready agency website with full content management capabilities, media storage, and performance at scale.',
    solution:
      'Implemented Next.js 16 with RSC for performance, MongoDB for flexible content storage, Redis for caching, Cloudflare R2 for media, and a full admin panel with JWT authentication.',
    results:
      'Zero-deploy content updates, fast page loads with Redis-cached responses, scalable media handling via R2, and a clean CMS the client operates independently.',
    liveLink: 'https://crelyst.com.ng',
    sourceLink: 'https://github.com/codegiyu/crelyst',
    featured: true,
    category: 'web-app',
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
    featured: false,
    category: 'dashboard',
  },
  {
    id: 'nafhcc',
    slug: 'nafhcc',
    title: 'NAFHCC Public Website',
    description:
      'Public website for the Nigerian Air Force Housing and Construction Company, showcasing residential estates and housing services nationwide',
    longDescription:
      'Built the public-facing website for NAFHCC, enabling prospective home owners to browse estates, search properties by location and type, and understand the path to home ownership.',
    image: '',
    gallery: [],
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    challenge:
      'Create a trustworthy, content-rich property showcase for a government-affiliated housing company with estates across multiple Nigerian states.',
    solution:
      'Built with Next.js for fast static and server-rendered pages, implemented property search and filtering, estate detail pages, and a clear four-step home ownership journey.',
    results:
      'Professional web presence for a national housing institution, fast property discovery with search and filters, and clear trust signals across service pages.',
    liveLink: 'https://nafhcc-demo.vercel.app',
    sourceLink: 'https://github.com/codegiyu/nafhcc-public',
    featured: false,
    category: 'web-app',
  },
  {
    id: 'mgcleaning',
    slug: 'mgcleaning',
    title: 'M&G Cleaning Services Website',
    description:
      'Customer-facing website for a professional cleaning services company covering homes, offices, upholstery, and post-construction spaces',
    longDescription:
      'Built the full customer-facing website for M&G Cleaning Services, with a focus on trust, clear service communication, and an easy enquiry flow — backed by a Hono API and deployed on Coolify.',
    image: '',
    gallery: [],
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Hono', 'Node.js'],
    challenge:
      'Build a professional service website that converts visitors into enquiries, communicates the M&G brand, and scales with business growth.',
    solution:
      'Implemented Next.js 16 frontend with a separate Hono backend, Playwright E2E tests, Docker containerisation, and a Coolify-based deployment pipeline.',
    results:
      'Clean, conversion-focused website with a 15-minute response promise, 24-hour follow-up system, and a fully automated deployment workflow.',
    liveLink: 'https://mgcleaningservices.com.ng',
    sourceLink: 'https://github.com/codegiyu/mgcleaning',
    featured: false,
    category: 'web-app',
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
      'Express JS',
      'Mongo DB',
      'PostgreSQL',
      'Docker',
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
      PostgreSQL: '/images/skills/postgresql.svg',
      Docker: '/images/skills/docker.svg',
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

type Seeder = (db: FirebaseFirestore.Firestore, replace: boolean) => Promise<void>;

async function seedProjects(db: FirebaseFirestore.Firestore, replace: boolean) {
  console.log(`Seeding projects (${replace ? 'replace' : 'additive'})...`);
  const now = Timestamp.now();
  let projectsToSeed = PROJECTS;

  if (!replace) {
    const snapshot = await db.collection('projects').get();
    const existingSlugs = new Set(snapshot.docs.map(d => d.id));
    projectsToSeed = PROJECTS.filter(p => !existingSlugs.has(p.slug));
    if (projectsToSeed.length === 0) {
      console.log('  ✓ no new projects to add');
      return;
    }
  }

  const batch = db.batch();
  for (const project of projectsToSeed) {
    const ref = db.collection('projects').doc(project.slug);
    batch.set(
      ref,
      {
        ...project,
        id: ref.id,
        status: 'published',
        publishAt: null,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        sortOrder: PROJECTS.indexOf(project),
        schemaVersion: 1,
        sourceHash: null,
        version: 1,
      },
      { merge: true }
    );
  }
  await batch.commit();
  console.log(`  ✓ ${projectsToSeed.length} project(s) seeded`);
}

async function seedAbout(db: FirebaseFirestore.Firestore, replace: boolean) {
  const ref = db.collection('settings').doc('about');
  const now = Timestamp.now();
  if (replace) {
    await ref.set({ ...SETTINGS.about, updatedAt: now, version: 1 }, { merge: true });
    console.log('  ✓ about replaced');
  } else {
    const existing = await ref.get();
    if (existing.exists) {
      console.log('  ✓ about already exists, skipped');
    } else {
      await ref.set({ ...SETTINGS.about, updatedAt: now, version: 1 });
      console.log('  ✓ about seeded');
    }
  }
}

async function seedSkills(db: FirebaseFirestore.Firestore, replace: boolean) {
  const ref = db.collection('settings').doc('skills');
  const now = Timestamp.now();
  if (replace) {
    await ref.set({ ...SETTINGS.skills, updatedAt: now, version: 1 }, { merge: true });
    console.log('  ✓ skills replaced');
  } else {
    const existing = await ref.get();
    const data = existing.data() ?? {};
    const existingActive: string[] = data.active ?? [];
    // Union: preserve existing order/items, append new ones from seed
    const mergedActive = [...new Set([...existingActive, ...SETTINGS.skills.active])];
    // Seed icon paths are authoritative; existing icons fill gaps for admin-added skills
    const mergedIcons = { ...(data.icons ?? {}), ...SETTINGS.skills.icons };
    await ref.set(
      {
        active: mergedActive,
        icons: mergedIcons,
        updatedAt: now,
        version: (data.version ?? 0) + 1,
      },
      { merge: true }
    );
    const added = SETTINGS.skills.active.filter(s => !existingActive.includes(s));
    console.log(
      added.length
        ? `  ✓ skills merged (+${added.length}: ${added.join(', ')})`
        : '  ✓ skills up to date'
    );
  }
}

async function seedSocial(db: FirebaseFirestore.Firestore, replace: boolean) {
  const ref = db.collection('settings').doc('social');
  const now = Timestamp.now();
  if (replace) {
    await ref.set({ links: SETTINGS.social, updatedAt: now, version: 1 }, { merge: true });
    console.log('  ✓ social replaced');
  } else {
    const existing = await ref.get();
    const data = existing.data() ?? {};
    const existingLinks: Array<{ platform: string }> = data.links ?? [];
    const existingPlatforms = new Set(existingLinks.map(l => l.platform));
    const newLinks = SETTINGS.social.filter(l => !existingPlatforms.has(l.platform));
    if (!newLinks.length) {
      console.log('  ✓ social up to date');
      return;
    }
    await ref.set(
      { links: [...existingLinks, ...newLinks], updatedAt: now, version: (data.version ?? 0) + 1 },
      { merge: true }
    );
    console.log(`  ✓ social merged (+${newLinks.length} platform(s))`);
  }
}

async function seedContact(db: FirebaseFirestore.Firestore, replace: boolean) {
  const ref = db.collection('settings').doc('contact');
  const now = Timestamp.now();
  if (replace) {
    await ref.set({ items: SETTINGS.contact, updatedAt: now, version: 1 }, { merge: true });
    console.log('  ✓ contact replaced');
  } else {
    const existing = await ref.get();
    const data = existing.data() ?? {};
    const existingItems: Array<{ type: string }> = data.items ?? [];
    const existingTypes = new Set(existingItems.map(i => i.type));
    const newItems = SETTINGS.contact.filter(i => !existingTypes.has(i.type));
    if (!newItems.length) {
      console.log('  ✓ contact up to date');
      return;
    }
    await ref.set(
      { items: [...existingItems, ...newItems], updatedAt: now, version: (data.version ?? 0) + 1 },
      { merge: true }
    );
    console.log(`  ✓ contact merged (+${newItems.length} item(s))`);
  }
}

async function seedSpecialties(db: FirebaseFirestore.Firestore, replace: boolean) {
  const ref = db.collection('settings').doc('specialties');
  const now = Timestamp.now();
  if (replace) {
    await ref.set({ cards: SETTINGS.specialties, updatedAt: now, version: 1 }, { merge: true });
    console.log('  ✓ specialties replaced');
  } else {
    const existing = await ref.get();
    const data = existing.data() ?? {};
    const existingCards: Array<{ label: string }> = data.cards ?? [];
    const existingLabels = new Set(existingCards.map(c => c.label));
    const newCards = SETTINGS.specialties.filter(c => !existingLabels.has(c.label));
    if (!newCards.length) {
      console.log('  ✓ specialties up to date');
      return;
    }
    await ref.set(
      { cards: [...existingCards, ...newCards], updatedAt: now, version: (data.version ?? 0) + 1 },
      { merge: true }
    );
    console.log(`  ✓ specialties merged (+${newCards.length} card(s))`);
  }
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

const SECTIONS: Record<string, Seeder> = {
  projects: seedProjects,
  about: seedAbout,
  skills: seedSkills,
  social: seedSocial,
  contact: seedContact,
  specialties: seedSpecialties,
};

type Section = keyof typeof SECTIONS;

// Tags that each section affects in the Next.js Data Cache
const SECTION_TAGS: Record<Section, string[]> = {
  projects: ['projects'],
  about: ['settings'],
  skills: ['settings'],
  social: ['settings'],
  contact: ['settings'],
  specialties: ['settings'],
};

async function revalidateCache(sections: Section[]) {
  // REVALIDATE_URL is the target app to bust (usually production).
  // Falls back to NEXT_PUBLIC_APP_URL, but that is typically http://localhost:3000
  // in .env.local, so set REVALIDATE_URL explicitly for cross-environment busting.
  const appUrl = process.env.REVALIDATE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!appUrl || !secret) {
    console.warn(
      '  ⚠ REVALIDATE_URL (or NEXT_PUBLIC_APP_URL) and REVALIDATE_SECRET must be set — skipping cache revalidation'
    );
    return;
  }
  const tags = [...new Set(sections.flatMap(s => SECTION_TAGS[s]))];
  const url = `${appUrl}/api/revalidate`;
  console.log(`\nRevalidating cache at ${appUrl} for tags: ${tags.join(', ')}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ tags }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      console.error(`  ✗ revalidation failed (${res.status}): ${text}`);
    } else {
      const json = (await res.json()) as { revalidated: string[] };
      console.log(`  ✓ revalidated: ${json.revalidated.join(', ')}`);
    }
  } catch (err) {
    console.error(`  ✗ revalidation request failed: ${err instanceof Error ? err.message : err}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const replace = args.includes('--replace') || args.includes('-r');
  const revalidate = args.includes('--revalidate');
  const requested = args.filter(a => !a.startsWith('-')) as Section[];
  const unknown = requested.filter(s => !(s in SECTIONS));
  if (unknown.length) {
    console.error(`Unknown section(s): ${unknown.join(', ')}`);
    console.error(`Valid sections: ${Object.keys(SECTIONS).join(', ')}`);
    process.exit(1);
  }

  const toRun: Section[] = requested.length ? requested : (Object.keys(SECTIONS) as Section[]);

  console.log(
    `Connecting to Firestore... [mode: ${replace ? 'replace' : 'additive'}${revalidate ? ', revalidate' : ''}]`
  );
  const db = getDb();

  for (const section of toRun) {
    await SECTIONS[section](db, replace);
  }

  if (revalidate) await revalidateCache(toRun);

  console.log('\nSeed complete.');
  process.exit(0);
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
