'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';

const CATEGORIES = ['web-app', 'landing', 'dashboard', 'mobile', 'other'] as const;

export default function NewProjectPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    longDescription: '',
    image: '',
    skills: '',
    category: 'web-app',
    liveLink: '',
    sourceLink: '',
    challenge: '',
    solution: '',
    results: '',
    featured: false,
    published: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleTitleChange(title: string) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setForm(prev => ({ ...prev, title, slug }));
  }

  function set(key: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          skills: form.skills
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create project');
        return;
      }
      router.push('/admin/projects');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-b border-white/[0.06] px-6 py-3 flex items-center gap-3">
      <Link
        href="/admin/projects"
        className="flex items-center gap-1.5 text-ash hover:text-red transition-colors text-xs font-semibold">
        <ArrowLeftIcon className="size-3.5" /> Projects
      </Link>
      <span className="text-ash/30">/</span>
      <span className="text-ash text-xs">New Project</span>
    </div>

    <div className="max-w-5xl mx-auto px-6 py-10">
      {error && (
        <div className="mb-6 p-4 border border-red/50 bg-red/10 text-red text-sm">{error}</div>
      )}

      <form
        id="project-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <Field label="Title">
            <input
              type="text"
              required
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="My Awesome Project"
              className={inputCls + ' font-montserrat font-bold text-base'}
            />
          </Field>
          <Field label="Short Description">
            <textarea
              rows={2}
              required
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="One-sentence description shown on cards..."
              className={`${inputCls} resize-none`}
            />
          </Field>
          <Field label="Long Description">
            <textarea
              rows={4}
              value={form.longDescription}
              onChange={e => set('longDescription', e.target.value)}
              placeholder="Full overview paragraph..."
              className={`${inputCls} resize-none`}
            />
          </Field>
          <Field label="Challenge">
            <textarea
              rows={3}
              value={form.challenge}
              onChange={e => set('challenge', e.target.value)}
              placeholder="What problem did this solve?"
              className={`${inputCls} resize-none`}
            />
          </Field>
          <Field label="Approach / Solution">
            <textarea
              rows={3}
              value={form.solution}
              onChange={e => set('solution', e.target.value)}
              placeholder="How did you solve it?"
              className={`${inputCls} resize-none`}
            />
          </Field>
          <Field label="Outcomes / Results">
            <textarea
              rows={3}
              value={form.results}
              onChange={e => set('results', e.target.value)}
              placeholder="What was the impact?"
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Field label="Slug">
            <input
              type="text"
              required
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              placeholder="my-awesome-project"
              className={inputCls}
            />
          </Field>
          <Field label="Cover Image URL">
            <input
              type="text"
              value={form.image}
              onChange={e => set('image', e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </Field>
          <Field label="Skills (comma separated)">
            <input
              type="text"
              value={form.skills}
              onChange={e => set('skills', e.target.value)}
              placeholder="React, TypeScript, Node.js"
              className={inputCls}
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className={inputCls}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Live URL">
            <input
              type="text"
              value={form.liveLink}
              onChange={e => set('liveLink', e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </Field>
          <Field label="Source URL">
            <input
              type="text"
              value={form.sourceLink}
              onChange={e => set('sourceLink', e.target.value)}
              placeholder="https://github.com/..."
              className={inputCls}
            />
          </Field>

          <div className="flex items-center gap-3 pt-2">
            <Toggle checked={form.featured} onChange={v => set('featured', v)} />
            <span className="text-sm text-ash font-semibold">
              {form.featured ? 'Featured on homepage' : 'Not featured'}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Toggle checked={form.published} onChange={v => set('published', v)} />
            <span className="text-sm text-ash font-semibold">
              {form.published ? 'Published' : 'Draft'}
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all disabled:opacity-50 mt-2">
            <SaveIcon className="size-4" />
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  'w-full bg-dark border border-white/[0.06] text-light placeholder-ash/30 px-3 py-2.5 text-sm focus:outline-none focus:border-red/50 transition-colors font-poppins';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-ash/50 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-10 h-5 rounded-full transition-colors focus:outline-none ${checked ? 'bg-red' : 'bg-white/10'}`}>
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}
