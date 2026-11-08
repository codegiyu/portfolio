'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/lib/types/general';
import { ArrowLeftIcon, SaveIcon, UploadIcon } from 'lucide-react';

const CATEGORIES = ['web-app', 'landing', 'dashboard', 'mobile', 'other'] as const;

export default function EditProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const [version, setVersion] = useState<number | undefined>();

  useEffect(() => {
    fetch(`/api/projects/${slug}?scope=admin`)
      .then(async r => {
        if (!r.ok) throw new Error('Project not found');
        return r.json();
      })
      .then((project: Project) => {
        setForm({
          title: project.title,
          description: project.description,
          longDescription: project.longDescription || '',
          image: project.image || '',
          skills: (project.skills || []).join(', '),
          category: project.category || 'web-app',
          liveLink: project.liveLink || '',
          sourceLink: project.sourceLink || '',
          challenge: project.challenge || '',
          solution: project.solution || '',
          results: project.results || '',
          featured: project.featured ?? false,
          published: project.published ?? project.status === 'published',
        });
        setVersion(project.version);
        setLoading(false);
      })
      .catch(() => {
        setError('Project not found');
        setLoading(false);
      });
  }, [slug]);

  function set(key: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('Uploading…');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'project');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      set('image', url);
      setUploadMsg('Uploaded — save to apply.');
    } catch {
      setUploadMsg('Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          skills: form.skills
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
          expectedVersion: version,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update project');
        return;
      }
      router.push('/admin/projects');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="inline-block w-8 h-8 border-2 border-white/10 border-t-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-white/[0.06] px-6 py-3 flex items-center gap-3">
        <Link
          href="/admin/projects"
          className="flex items-center gap-1.5 text-ash hover:text-red transition-colors text-xs font-semibold">
          <ArrowLeftIcon className="size-3.5" /> Projects
        </Link>
        <span className="text-ash/30">/</span>
        <span className="text-ash text-xs font-mono">{slug}</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-4 border border-red/50 bg-red/10 text-red text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            <Field label="Title">
              <input
                type="text"
                required
                value={form.title}
                onChange={e => set('title', e.target.value)}
                className={inputCls + ' font-montserrat font-bold text-base'}
              />
            </Field>
            <Field label="Short Description">
              <textarea
                rows={2}
                required
                value={form.description}
                onChange={e => set('description', e.target.value)}
                className={`${inputCls} resize-none scrollbar-dark`}
              />
            </Field>
            <Field label="Long Description">
              <textarea
                rows={4}
                value={form.longDescription}
                onChange={e => set('longDescription', e.target.value)}
                className={`${inputCls} resize-none scrollbar-dark`}
              />
            </Field>
            <Field label="Challenge">
              <textarea
                rows={3}
                value={form.challenge}
                onChange={e => set('challenge', e.target.value)}
                className={`${inputCls} resize-none scrollbar-dark`}
              />
            </Field>
            <Field label="Approach / Solution">
              <textarea
                rows={3}
                value={form.solution}
                onChange={e => set('solution', e.target.value)}
                className={`${inputCls} resize-none scrollbar-dark`}
              />
            </Field>
            <Field label="Outcomes / Results">
              <textarea
                rows={3}
                value={form.results}
                onChange={e => set('results', e.target.value)}
                className={`${inputCls} resize-none scrollbar-dark`}
              />
            </Field>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Field label="Slug">
              <p className="px-3 py-2.5 text-sm font-mono text-ash/60 border border-white/[0.04] bg-dark/50">
                {slug}
              </p>
            </Field>
            <Field label="Cover Image">
              {form.image && (
                <div
                  className="w-full aspect-video bg-cover bg-center bg-dark/80 border border-white/[0.06] mb-2"
                  style={{ backgroundImage: `url("${form.image}")` }}
                />
              )}
              <input
                type="text"
                value={form.image}
                onChange={e => set('image', e.target.value)}
                placeholder="/images/projects/... or https://..."
                className={`${inputCls} mb-1.5`}
              />
              <label className="flex items-center gap-1.5 w-fit px-3 py-1.5 border border-white/10 text-ash hover:border-red/50 hover:text-red transition-colors text-xs font-semibold cursor-pointer">
                <UploadIcon className="size-3.5" />
                {uploading ? 'Uploading…' : 'Upload image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverUpload}
                  disabled={uploading}
                />
              </label>
              {uploadMsg && <p className="text-xs text-ash/60 mt-1.5">{uploadMsg}</p>}
            </Field>
            <Field label="Skills (comma separated)">
              <input
                type="text"
                value={form.skills}
                onChange={e => set('skills', e.target.value)}
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
                className={inputCls}
              />
            </Field>
            <Field label="Source URL">
              <input
                type="text"
                value={form.sourceLink}
                onChange={e => set('sourceLink', e.target.value)}
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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
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
