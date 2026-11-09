'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types/general';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  GripVerticalIcon,
  CheckIcon,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CATEGORY_LABELS: Record<string, string> = {
  'web-app': 'Web App',
  landing: 'Landing',
  dashboard: 'Dashboard',
  mobile: 'Mobile',
  other: 'Other',
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface RowProps {
  project: Project;
  deleting: string | null;
  onDelete: (slug: string, title: string) => void;
}

function SortableRow({ project, deleting, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.slug,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
      }}
      className="flex items-center border-b border-white/[0.04] hover:bg-dark/30 transition-colors">
      {/* drag handle */}
      <div className="pl-3 pr-1 py-4 flex-shrink-0 w-9">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-ash/25 hover:text-ash/60 transition-colors touch-none focus:outline-none"
          aria-label="Drag to reorder">
          <GripVerticalIcon className="size-4" />
        </button>
      </div>

      {/* title */}
      <div className="flex-1 min-w-0 px-4 py-4">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-light text-sm line-clamp-1">{project.title}</p>
          {project.status === 'draft' && (
            <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-wider text-ash/40 border border-white/[0.06] px-1.5 py-0.5">
              Draft
            </span>
          )}
        </div>
        <p className="text-xs text-ash/50 mt-0.5 font-mono">{project.slug}</p>
      </div>

      {/* category */}
      <div className="px-4 py-4 w-32 hidden md:block flex-shrink-0">
        {project.category && (
          <span className="text-[10px] font-black uppercase tracking-wider text-ash/50 border border-white/[0.06] px-2 py-1">
            {CATEGORY_LABELS[project.category] ?? project.category}
          </span>
        )}
      </div>

      {/* featured */}
      <div className="px-4 py-4 w-24 hidden sm:flex flex-shrink-0 items-center">
        {project.featured && <StarIcon className="size-4 text-red fill-red" />}
      </div>

      {/* actions */}
      <div className="px-4 py-4 flex-shrink-0">
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
            onClick={() => onDelete(project.slug, project.title)}
            disabled={deleting === project.slug}
            className="text-ash hover:text-red transition-colors disabled:opacity-50"
            title="Delete"
            aria-label={`Delete ${project.title}`}>
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex(p => p.slug === active.id);
    const newIndex = projects.findIndex(p => p.slug === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);
    const previous = projects;

    setProjects(reordered);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState('saving');

    try {
      const res = await fetch('/api/projects/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: reordered.map(p => p.slug) }),
      });
      if (!res.ok) throw new Error();
      setSaveState('saved');
      saveTimer.current = setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setProjects(previous);
      setSaveState('error');
      saveTimer.current = setTimeout(() => setSaveState('idle'), 3000);
    }
  }

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
              {saveState === 'saving' && (
                <span className="ml-3 text-ash/50">Saving order…</span>
              )}
              {saveState === 'saved' && (
                <span className="ml-3 text-green-500 inline-flex items-center gap-1">
                  <CheckIcon className="size-3" /> Saved
                </span>
              )}
              {saveState === 'error' && (
                <span className="ml-3 text-red">Could not save order</span>
              )}
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
        {/* header */}
        <div className="flex items-center border-b border-white/[0.06] bg-dark/50 text-[10px] font-black uppercase tracking-widest text-ash/50">
          <div className="pl-3 pr-1 w-9 flex-shrink-0" />
          <div className="flex-1 min-w-0 px-4 py-3.5">Title</div>
          <div className="px-4 py-3.5 w-32 hidden md:block flex-shrink-0">Category</div>
          <div className="px-4 py-3.5 w-24 hidden sm:block flex-shrink-0">Featured</div>
          <div className="px-4 py-3.5 flex-shrink-0">Actions</div>
        </div>

        {/* body */}
        {loading ? (
          <div className="px-5 py-12 text-center text-ash">
            <div className="inline-block w-6 h-6 border-2 border-white/10 border-t-red rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="px-5 py-12 text-center text-ash text-sm">
            No projects yet.{' '}
            <Link href="/admin/projects/new" className="text-red hover:underline underline-offset-4">
              Add your first project
            </Link>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <SortableContext
              items={projects.map(p => p.slug)}
              strategy={verticalListSortingStrategy}>
              {projects.map(project => (
                <SortableRow
                  key={project.slug}
                  project={project}
                  deleting={deleting}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
