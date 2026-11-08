'use client';

import Link from 'next/link';
import { Project } from '@/lib/types/general';
import { ScrollReveal, StaggerReveal } from '@/components/general/ScrollReveal';
import { ExternalLinkIcon } from 'lucide-react';
import { escapeCssUrl } from '@/lib/safe-url';

interface WorksSectionProps {
  projects: Project[];
}

export const WorksSection = ({ projects }: WorksSectionProps) => {
  return (
    <section id="works" className="w-full py-20 lg:py-28">
      <div className="container grid gap-12">
        {/* Header */}
        <ScrollReveal className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-ash text-xs font-semibold uppercase tracking-widest">
              Selected work
            </p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl text-light">
              Recent Projects
            </h2>
            <div className="w-12 h-[3px] bg-red mt-1" />
          </div>
          <Link
            href="/projects"
            className="hidden sm:inline-flex text-sm font-semibold text-ash hover:text-red transition-colors whitespace-nowrap pb-1">
            View all →
          </Link>
        </ScrollReveal>

        {/* Grid */}
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 gap-5" stagger={0.1}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </StaggerReveal>

        {/* Mobile CTA */}
        <div className="flex sm:hidden justify-center pt-2">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ash hover:text-red transition-colors border border-white/10 hover:border-red/40 px-5 py-3">
            View all projects →
          </Link>
        </div>
      </div>
    </section>
  );
};

function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.liveLink || `/projects/${project.slug}`}
      target={project.liveLink ? '_blank' : undefined}
      rel={project.liveLink ? 'noopener noreferrer' : undefined}
      className="group flex flex-col bg-dark border border-white/[0.06] overflow-hidden hover:border-red/40 transition-all duration-300 hover:translate-y-[-3px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      {/* Image */}
      <div
        className="w-full aspect-video bg-cover bg-center overflow-hidden border-b border-white/[0.06]"
        style={{
          backgroundImage: project.image ? `url("${escapeCssUrl(project.image)}")` : undefined,
        }}>
        <div className="w-full h-full bg-darkBg/10 group-hover:bg-darkBg/0 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3 className="font-montserrat font-bold text-light text-lg group-hover:text-red transition-colors duration-200 line-clamp-1">
          {project.title}
        </h3>
        <p className="text-ash text-sm leading-relaxed line-clamp-2 flex-1">
          {project.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.06]">
          <div className="flex flex-wrap gap-1.5">
            {project.skills.slice(0, 3).map(skill => (
              <span
                key={skill}
                className="text-[10px] font-semibold uppercase tracking-wider text-ash/40 border border-white/[0.06] px-1.5 py-0.5">
                {skill}
              </span>
            ))}
          </div>
          {project.liveLink && (
            <ExternalLinkIcon className="size-3.5 text-ash/30 group-hover:text-red transition-colors flex-shrink-0" />
          )}
        </div>
      </div>
    </a>
  );
}
