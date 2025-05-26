import { Footer } from '@/layout/Footer';
import { Header } from '@/layout/Header';
import { AboutSection } from '@/sections/home/AboutSection';
import { ContactSection } from '@/sections/home/ContactSection';
import { ServicesSection } from '@/sections/home/ServicesSection';
import { WorksSection } from '@/sections/home/WorksSection';

export default function Home() {
  return (
    <>
      <Header />

      <main className="w-full z-[1] mt-1">
        <AboutSection />
        <ServicesSection />
        <WorksSection />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
