import { AboutSection } from '@/sections/home/AboutSection';
import { ContactSection } from '@/sections/home/ContactSection';
import { ServicesSection } from '@/sections/home/ServicesSection';
import { WorksSection } from '@/sections/home/WorksSection';
import { getFeaturedProjects } from '@/lib/projects';

export default function Home() {
  const featuredProjects = getFeaturedProjects(3);

  return (
    <div className="w-full mt-1">
      <AboutSection />
      <ServicesSection />
      <WorksSection projects={featuredProjects} />
      <ContactSection />
    </div>
  );
}
