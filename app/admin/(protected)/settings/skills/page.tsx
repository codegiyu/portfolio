'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, SaveIcon, PlusIcon, TrashIcon, GripVerticalIcon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SkillsSettings, SpecialtyCard } from '@/lib/types/general';

type SortableSpecialty = SpecialtyCard & { id: string };

const ALL_KNOWN_SKILLS = [
  'HTML5',
  'CSS3',
  'Javascript',
  'Typescript',
  'SCSS',
  'Bootstrap 5',
  'TailwindCSS',
  'JQuery',
  'React',
  'Next JS',
  'Node.js',
  'Express JS',
  'Mongo DB',
  'PostgreSQL',
  'Docker',
  'PHP',
  'MySQL',
];

export default function SkillsSettingsPage() {
  const [skills, setSkills] = useState<SkillsSettings>({ active: [], icons: {} });
  const [specialties, setSpecialties] = useState<SortableSpecialty[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingSpecialties, setSavingSpecialties] = useState(false);
  const [versions, setVersions] = useState<{
    skills?: number;
    specialties?: number;
  }>({});
  const [msg, setMsg] = useState<Record<string, { type: 'ok' | 'err'; text: string }>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/skills?scope=admin').then(async r => {
        if (!r.ok) throw new Error('Failed to load skills settings');
        return r.json();
      }),
      fetch('/api/settings/specialties?scope=admin').then(async r => {
        if (!r.ok) throw new Error('Failed to load specialty settings');
        return r.json();
      }),
    ])
      .then(([s, sp]) => {
        setSkills(s.value as SkillsSettings);
        const cards = (sp.value as { cards: SpecialtyCard[] }).cards ?? [];
        setSpecialties(cards.map((c, i) => ({ ...c, id: String(i) })));
        setVersions({ skills: s.version, specialties: sp.version });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ─── Skills ───────────────────────────────────────────────────────────────

  function toggleSkill(name: string) {
    setSkills(prev => {
      const active = prev.active.includes(name)
        ? prev.active.filter(s => s !== name)
        : [...prev.active, name];
      return { ...prev, active };
    });
  }

  function addCustomSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.active.includes(trimmed)) return;
    setSkills(prev => ({ ...prev, active: [...prev.active, trimmed] }));
    setNewSkill('');
  }

  function updateIcon(name: string, value: string) {
    setSkills(prev => ({ ...prev, icons: { ...prev.icons, [name]: value } }));
  }

  async function saveSkills(e: React.FormEvent) {
    e.preventDefault();
    setSavingSkills(true);
    try {
      const res = await fetch('/api/settings/skills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...skills, expectedVersion: versions.skills }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVersions(prev => ({ ...prev, skills: data.version }));
      setMsg(m => ({ ...m, skills: { type: 'ok', text: 'Skills saved.' } }));
    } catch {
      setMsg(m => ({ ...m, skills: { type: 'err', text: 'Save failed.' } }));
    } finally {
      setSavingSkills(false);
    }
  }

  // ─── Specialties ──────────────────────────────────────────────────────────

  function updateSpecialty(i: number, key: keyof SpecialtyCard, value: string) {
    setSpecialties(prev => prev.map((card, idx) => (idx === i ? { ...card, [key]: value } : card)));
  }

  function addSpecialty() {
    setSpecialties(prev => [...prev, { id: String(Date.now()), label: '', description: '' }]);
  }

  function removeSpecialty(i: number) {
    setSpecialties(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSpecialties(prev => {
        const oldIndex = prev.findIndex(item => item.id === active.id);
        const newIndex = prev.findIndex(item => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  async function saveSpecialties(e: React.FormEvent) {
    e.preventDefault();
    setSavingSpecialties(true);
    try {
      // Strip internal IDs before sending to the API
      const cards: SpecialtyCard[] = specialties.map(({ id: _id, ...rest }) => rest);
      const res = await fetch('/api/settings/specialties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards, expectedVersion: versions.specialties }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVersions(prev => ({ ...prev, specialties: data.version }));
      setMsg(m => ({ ...m, specialties: { type: 'ok', text: 'Specialties saved.' } }));
    } catch {
      setMsg(m => ({ ...m, specialties: { type: 'err', text: 'Save failed.' } }));
    } finally {
      setSavingSpecialties(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/settings" className="text-ash hover:text-red transition-colors">
          <ChevronLeftIcon className="size-5" />
        </Link>
        <div>
          <h2 className="font-montserrat font-black text-2xl text-light">Skills & Specialties</h2>
          <p className="text-ash text-sm mt-0.5">Tech stack icons and specialty area cards</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/10 border-t-red rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {/* Active skills */}
          <form onSubmit={saveSkills} className="flex flex-col gap-5">
            <SectionHeader label="Active skills (shown in tech stack grid)" />

            <div className="flex flex-wrap gap-2">
              {ALL_KNOWN_SKILLS.map(name => {
                const active = skills.active.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleSkill(name)}
                    className={`px-3 py-1.5 text-xs font-semibold font-montserrat border transition-colors ${
                      active
                        ? 'bg-red/10 border-red text-red'
                        : 'border-white/10 text-ash hover:border-white/30'
                    }`}>
                    {name}
                  </button>
                );
              })}
            </div>

            {/* Custom skills not in the known list */}
            <div className="flex items-center gap-2">
              <input
                className={INPUT + ' flex-1'}
                placeholder="Add custom skill name…"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="flex items-center gap-1 px-3 py-2 border border-white/10 text-ash hover:border-red/50 hover:text-red transition-colors text-xs">
                <PlusIcon className="size-3.5" /> Add
              </button>
            </div>

            {/* Icon paths for active skills */}
            {skills.active.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-ash/40 mt-2">
                  Icon paths (leave blank to hide icon)
                </p>
                {skills.active.map(name => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-xs text-ash/60 w-28 flex-shrink-0 font-mono">
                      {name}
                    </span>
                    <input
                      className={INPUT + ' flex-1'}
                      placeholder="/images/skills/..."
                      value={skills.icons[name] || ''}
                      onChange={e => updateIcon(name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {msg.skills && (
              <p
                className={`text-sm font-medium ${msg.skills.type === 'ok' ? 'text-green-400' : 'text-red'}`}>
                {msg.skills.text}
              </p>
            )}

            <SaveBtn loading={savingSkills} />
          </form>

          <hr className="border-white/[0.06]" />

          {/* Specialty cards */}
          <form onSubmit={saveSpecialties} className="flex flex-col gap-4">
            <SectionHeader label="Specialty cards (Mobile / Backend / Web)" />

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={specialties.map(c => c.id)}
                strategy={verticalListSortingStrategy}>
                {specialties.map((card, i) => (
                  <SortableSpecialtyCard
                    key={card.id}
                    id={card.id}
                    card={card}
                    index={i}
                    onUpdate={updateSpecialty}
                    onRemove={removeSpecialty}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <button
              type="button"
              onClick={addSpecialty}
              className="flex items-center gap-1.5 text-xs text-ash hover:text-red transition-colors self-start">
              <PlusIcon className="size-3.5" /> Add card
            </button>

            {msg.specialties && (
              <p
                className={`text-sm font-medium ${msg.specialties.type === 'ok' ? 'text-green-400' : 'text-red'}`}>
                {msg.specialties.text}
              </p>
            )}

            <SaveBtn loading={savingSpecialties} />
          </form>
        </div>
      )}
    </div>
  );
}

function SortableSpecialtyCard({
  id,
  card,
  index,
  onUpdate,
  onRemove,
}: {
  id: string;
  card: SortableSpecialty;
  index: number;
  onUpdate: (i: number, key: keyof SpecialtyCard, value: string) => void;
  onRemove: (i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-white/[0.06] p-4 bg-dark flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-ash/30 hover:text-ash/60 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
          {...attributes}
          {...listeners}>
          <GripVerticalIcon className="size-4" />
        </button>
        <input
          className={INPUT + ' flex-1'}
          placeholder="Label (e.g. Mobile)"
          value={card.label}
          onChange={e => onUpdate(index, 'label', e.target.value)}
        />
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-ash/40 hover:text-red transition-colors flex-shrink-0">
          <TrashIcon className="size-4" />
        </button>
      </div>
      <textarea
        rows={2}
        className={INPUT + ' resize-none'}
        placeholder="Description…"
        value={card.description}
        onChange={e => onUpdate(index, 'description', e.target.value)}
      />
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-ash/50 border-b border-white/[0.06] pb-2">
      {label}
    </p>
  );
}

function SaveBtn({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all disabled:opacity-50 self-start">
      <SaveIcon className="size-4" />
      {loading ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

const INPUT =
  'bg-darkBg border border-white/[0.08] text-light text-sm px-3 py-2 outline-none focus:border-red/40 transition-colors placeholder:text-ash/30 w-full';
