'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types/general';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, StarIcon } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  'web-app': 'Web App',
  landing: 'Landing',
  dashboard: 'Dashboard',
  mobile: 'Mobile',
  other: 'Other',
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/projects?scope=admin')
      .then(async r => {
        if (!r.ok) throw new Error('Failed to load projects');
        return r.json();
      })
      .then(data => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setError('Projects could not be loaded. Try refreshing the page.');
        setLoading(false);
      });
  }, []);

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(slug);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.slug !== slug));
      } else {
        setError('Project could not be deleted. Try again.');
      }
    } catch {
      setError('Project could not be deleted. Try again.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-montserrat font-black text-2xl text-light">Projects</h2>
          {!loading && (
            <p className="text-ash text-sm mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all">
          <PlusIcon className="size-4" />
          New Project
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-6 text-sm text-red">
          {error}
        </p>
      )}

      <div className="border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-dark/50">
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-ash/50">
                Title
              </th>
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-ash/50 hidden md:table-cell">
                Category
              </th>
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-ash/50 hidden sm:table-cell">
                Featured
              </th>
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-ash/50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-ash">
                  <div className="inline-block w-6 h-6 border-2 border-white/10 border-t-red rounded-full animate-spin" />
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-ash">
                  No projects yet.{' '}
                  <Link
                    href="/admin/projects/new"
                    className="text-red hover:underline underline-offset-4">
                    Add your first project
                  </Link>
                </td>
              </tr>
            ) : (
              projects.map(project => (
                <tr
                  key={project.slug}
                  className="border-b border-white/[0.04] hover:bg-dark/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-light line-clamp-1">{project.title}</p>
                    <p className="text-xs text-ash/50 mt-0.5 font-mono">{project.slug}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {project.category && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-ash/50 border border-white/[0.06] px-2 py-1">
                        {CATEGORY_LABELS[project.category] ?? project.category}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    {project.featured && <StarIcon className="size-4 text-red fill-red" />}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/projects/${project.slug}`}
                        target="_blank"
                        aria-label={`View ${project.title}`}
                        className="text-ash hover:text-red transition-colors"
                        title="View">
                        <EyeIcon className="size-4" />
                      </Link>
                      <Link
                        href={`/admin/projects/${project.slug}/edit`}
                        className="text-ash hover:text-red transition-colors"
                        title="Edit"
                        aria-label={`Edit ${project.title}`}>
                        <PencilIcon className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(project.slug, project.title)}
                        disabled={deleting === project.slug}
                        className="text-ash hover:text-red transition-colors disabled:opacity-50"
                        title="Delete"
                        aria-label={`Delete ${project.title}`}>
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
