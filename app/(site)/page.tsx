import { AboutSection } from '@/sections/home/AboutSection';
import { ContactSection } from '@/sections/home/ContactSection';
import { ServicesSection } from '@/sections/home/ServicesSection';
import { WorksSection } from '@/sections/home/WorksSection';
import { ScrollToHash } from '@/components/general/ScrollToHash';
import { getPublicSettings, listFeaturedProjects } from '@/lib/server/content';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [settings, featuredProjects] = await Promise.all([
    getPublicSettings(),
    listFeaturedProjects(3),
  ]);

  return (
    <div className="w-full mt-1">
      <ScrollToHash />
      <AboutSection about={settings.about} social={settings.social.links} />
      <ServicesSection skills={settings.skills} specialties={settings.specialties.cards} />
      <WorksSection projects={featuredProjects} />
      <ContactSection contact={settings.contact.items} />
    </div>
  );
}
