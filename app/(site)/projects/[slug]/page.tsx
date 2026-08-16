import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon, ExternalLinkIcon, GithubIcon } from 'lucide-react';
import { getPublishedProjectBySlug } from '@/lib/server/content';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  return project ? { title: `${project.title} | Codegiyu`, description: project.description } : {};
}

const CATEGORY_LABELS: Record<string, string> = {
  'web-app': 'Web App',
  landing: 'Landing Page',
  dashboard: 'Dashboard',
  mobile: 'Mobile',
  other: 'Other',
};

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();
  return (
    <div className="w-full">
      <div className="container py-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-ash hover:text-red transition-colors font-semibold">
          <ArrowLeftIcon className="size-4" />
          Back to Projects
        </Link>
      </div>
      <div className="border-b border-white/[0.06] pb-12">
        <div className="container max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {project.category && (
              <span className="text-[10px] font-black uppercase tracking-widest text-ash/50 border border-white/[0.06] px-2 py-1">
                {CATEGORY_LABELS[project.category] ?? project.category}
              </span>
            )}
            {project.featured && (
              <span className="text-[10px] font-black uppercase tracking-widest text-red border border-red/30 px-2 py-1">
                Featured
              </span>
            )}
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-4xl lg:text-5xl text-light leading-[1.2] mb-5">
            {project.title}
          </h1>
          <p className="text-ash text-lg leading-relaxed mb-8 max-w-2xl">{project.description}</p>
          <div className="flex flex-wrap items-center gap-4">
            {project.liveLink && (
              <a
                href={project.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all">
                View Live <ExternalLinkIcon className="size-4" />
              </a>
            )}
            {project.sourceLink && (
              <a
                href={project.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-ash text-sm font-semibold font-montserrat hover:border-red/60 hover:text-red transition-all">
                Source Code <GithubIcon className="size-4" />
              </a>
            )}
          </div>
        </div>
      </div>
      {project.image && (
        <div className="border-b border-white/[0.06]">
          <div className="container max-w-5xl py-10">
            <div
              className="w-full aspect-video bg-cover bg-center bg-dark border border-white/[0.06]"
              style={{ backgroundImage: `url(${project.image})` }}
            />
          </div>
        </div>
      )}
      <div className="border-b border-white/[0.06]">
        <div className="container max-w-4xl py-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-ash/40 mb-4">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {project.skills.map(skill => (
              <span
                key={skill}
                className="text-xs font-semibold uppercase tracking-wider text-ash border border-white/10 px-3 py-1.5 font-montserrat">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="container max-w-4xl py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {project.longDescription && (
              <CaseSection label="Overview" content={project.longDescription} />
            )}
            {project.challenge && <CaseSection label="The Challenge" content={project.challenge} />}
            {project.solution && <CaseSection label="My Approach" content={project.solution} />}
            {project.results && <CaseSection label="Outcomes" content={project.results} />}
          </div>
          <aside className="space-y-8">
            {project.category && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-ash/40 mb-2">
                  Category
                </p>
                <p className="text-sm text-light font-semibold">
                  {CATEGORY_LABELS[project.category] ?? project.category}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-ash/40 mb-3">
                Stack
              </p>
              <div className="space-y-1.5">
                {project.skills.map(skill => (
                  <p key={skill} className="text-sm text-ash flex items-center gap-2">
                    <span className="w-1 h-1 bg-red rounded-full flex-shrink-0" />
                    {skill}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        </div>
        <div className="mt-16 pt-10 border-t border-white/[0.06]">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ash hover:text-red transition-colors">
            <ArrowLeftIcon className="size-4" />
            All Projects
          </Link>
        </div>
      </div>
    </div>
  );
}

function CaseSection({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-[3px] h-5 bg-red rounded-full flex-shrink-0" />
        <p className="text-[10px] font-black uppercase tracking-widest text-ash/60">{label}</p>
      </div>
      <p className="text-ash leading-[1.85] text-[15px]">{content}</p>
    </div>
  );
}
