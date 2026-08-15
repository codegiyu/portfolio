'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types/general';
import { StaggerReveal } from '@/components/general/ScrollReveal';
import { ExternalLinkIcon, ArrowRightIcon } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  'web-app': 'Web App',
  landing: 'Landing Page',
  dashboard: 'Dashboard',
  mobile: 'Mobile',
  other: 'Other',
};

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!activeCategory) return projects;
    return projects.filter(p => p.category === activeCategory);
  }, [projects, activeCategory]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-12 flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-ash/40 mr-2 self-center">
          Filter:
        </span>
        <FilterButton active={activeCategory === null} onClick={() => setActiveCategory(null)}>
          All
          <span className="ml-1.5 text-[10px] opacity-60">({projects.length})</span>
        </FilterButton>
        {categories.map(cat => {
          const count = projects.filter(p => p.category === cat).length;
          return (
            <FilterButton
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}>
              {CATEGORY_LABELS[cat] ?? cat}
              <span className="ml-1.5 text-[10px] opacity-60">({count})</span>
            </FilterButton>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ash">No projects in this category.</p>
          <button
            onClick={() => setActiveCategory(null)}
            className="mt-4 text-sm text-red hover:underline underline-offset-4">
            Show all
          </button>
        </div>
      ) : (
        <StaggerReveal
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          stagger={0.08}
          y={16}>
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold font-montserrat transition-all flex items-center ${
        active
          ? 'bg-red text-light border border-red'
          : 'border border-white/10 text-ash hover:border-red/50 hover:text-red'
      }`}>
      {children}
    </button>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group border border-white/[0.06] bg-dark overflow-hidden hover:border-red/40 transition-all duration-300 hover:translate-y-[-3px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col">
      {/* Image */}
      <div
        className="w-full aspect-video bg-cover bg-center bg-dark/80 border-b border-white/[0.06] flex-shrink-0"
        style={{ backgroundImage: project.image ? `url(${project.image})` : undefined }}
      />

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {project.category && (
          <span className="text-[10px] font-black uppercase tracking-widest text-ash/40">
            {CATEGORY_LABELS[project.category] ?? project.category}
          </span>
        )}

        <h3 className="font-montserrat font-bold text-lg text-light group-hover:text-red transition-colors leading-tight line-clamp-2">
          {project.title}
        </h3>

        <p className="text-sm text-ash leading-relaxed line-clamp-2 flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-1">
          {project.skills.slice(0, 4).map(skill => (
            <span
              key={skill}
              className="text-[10px] font-semibold uppercase tracking-wider text-ash/50 border border-white/[0.06] px-2 py-1">
              {skill}
            </span>
          ))}
          {project.skills.length > 4 && (
            <span className="text-[10px] font-semibold text-ash/30 px-1 py-1">
              +{project.skills.length - 4}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06] mt-auto">
          <Link
            href={`/projects/${project.slug}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-ash hover:text-red transition-colors">
            Case Study <ArrowRightIcon className="size-3" />
          </Link>
          {project.liveLink && (
            <a
              href={project.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-ash hover:text-red transition-colors ml-auto">
              Live <ExternalLinkIcon className="size-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
