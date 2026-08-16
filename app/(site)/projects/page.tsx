import type { Metadata } from 'next';
import { listPublishedProjects } from '@/lib/server/content';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { ScrollReveal } from '@/components/general/ScrollReveal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Projects | Codegiyu',
  description: "A collection of products I've built and shipped.",
};

export default async function ProjectsPage() {
  const projects = await listPublishedProjects();
  return (
    <div className="w-full">
      <div className="border-b border-white/[0.06] py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <p className="text-ash text-xs font-semibold uppercase tracking-widest mb-3">Work</p>
            <h1 className="font-montserrat font-black text-4xl md:text-5xl lg:text-6xl text-light mb-4 leading-[1.1]">
              Projects
            </h1>
            <div className="w-12 h-[3px] bg-red mb-6" />
            <p className="text-ash text-lg max-w-2xl leading-relaxed">
              A selection of products I&apos;ve built and shipped — technical execution meets
              product thinking.
            </p>
          </ScrollReveal>
        </div>
      </div>
      <div className="container py-16">
        <ProjectGrid projects={projects} />
        <ScrollReveal className="border-t border-white/[0.06] mt-16 pt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="font-montserrat font-black text-4xl text-red mb-2">{projects.length}+</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-ash/50">
              Projects Shipped
            </p>
          </div>
          <div>
            <p className="font-montserrat font-black text-4xl text-red mb-2">3+</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-ash/50">
              Years Building
            </p>
          </div>
          <div>
            <p className="font-montserrat font-black text-4xl text-red mb-2">∞</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-ash/50">
              Lines Written
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
