import { AboutSection } from '@/sections/home/AboutSection';
import { ContactSection } from '@/sections/home/ContactSection';
import { ServicesSection } from '@/sections/home/ServicesSection';
import { WorksSection } from '@/sections/home/WorksSection';
import { getAllSettings } from '@/lib/settings';
import { getDb } from '@/lib/firestore';
import { getFeaturedProjects } from '@/lib/projects';
import { Project } from '@/lib/types/general';

async function getFeaturedProjectsWithFallback(count: number): Promise<Project[]> {
  try {
    const db = getDb();
    const snapshot = await db.collection('projects').where('featured', '==', true).get();
    if (!snapshot.empty) {
      return snapshot.docs.map(d => d.data() as Project).slice(0, count);
    }
  } catch {
    // Firestore unavailable
  }
  return getFeaturedProjects(count);
}

export default async function Home() {
  const [settings, featuredProjects] = await Promise.all([
    getAllSettings(),
    getFeaturedProjectsWithFallback(3),
  ]);

  return (
    <div className="w-full mt-1">
      <AboutSection about={settings.about} social={settings.social.links} />
      <ServicesSection skills={settings.skills} specialties={settings.specialties.cards} />
      <WorksSection projects={featuredProjects} />
      <ContactSection contact={settings.contact.items} />
    </div>
  );
}
