'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { BlogPost } from '@/lib/types/general';

export default function EditPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    date: '',
    tags: '',
    coverImage: '',
    author: '',
    published: false,
    content: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState<number | undefined>();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/blog/${slug}?scope=admin`);
      if (!res.ok) {
        setError('Post not found');
        setLoading(false);
        return;
      }
      const post: BlogPost = await res.json();
      setForm({
        title: post.title,
        excerpt: post.excerpt || '',
        date: post.date,
        tags: (post.tags || []).join(', '),
        coverImage: post.coverImage || '',
        author: post.author || 'Edward-Precious Omegbu',
        published: post.published,
        content: post.content,
      });
      setVersion(post.version);
      setLoading(false);
    }
    load();
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean),
          expectedVersion: version,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update post');
        return;
      }

      router.push('/admin/posts');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-white/10 border-t-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-light">
      {/* Top bar */}
      <header className="border-b border-white/[0.06] bg-dark/80 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="flex items-center gap-2 text-ash hover:text-red transition-colors text-sm font-semibold">
            <ArrowLeftIcon className="size-4" />
            Posts
          </Link>
          <span className="text-ash/30">/</span>
          <span className="text-ash text-sm font-mono">{slug}</span>
        </div>
        <button
          form="edit-form"
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all disabled:opacity-50">
          <SaveIcon className="size-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-4 border border-red/50 bg-red/10 text-red text-sm">{error}</div>
        )}

        <form
          id="edit-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-ash/50 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-dark border border-white/[0.06] text-light px-4 py-3 text-base font-montserrat font-bold focus:outline-none focus:border-red/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-ash/50 mb-2">
                Content (Markdown)
              </label>
              <textarea
                required
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                rows={28}
                className="w-full bg-dark border border-white/[0.06] text-light px-4 py-3 text-sm font-mono focus:outline-none focus:border-red/50 transition-colors resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-5">
            <Field label="Slug">
              <p className="px-3 py-2.5 text-sm font-mono text-ash/60 border border-white/[0.04] bg-dark/50">
                {slug}
              </p>
            </Field>

            <Field label="Excerpt">
              <textarea
                value={form.excerpt}
                onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className={inputCls}
              />
            </Field>

            <Field label="Tags (comma separated)">
              <input
                type="text"
                value={form.tags}
                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                placeholder="TypeScript, React, Node.js"
                className={inputCls}
              />
            </Field>

            <Field label="Cover Image URL">
              <input
                type="text"
                value={form.coverImage}
                onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))}
                className={inputCls}
              />
            </Field>

            <Field label="Author">
              <input
                type="text"
                value={form.author}
                onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                className={inputCls}
              />
            </Field>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                role="switch"
                aria-checked={form.published}
                onClick={() => setForm(p => ({ ...p, published: !p.published }))}
                className={`relative inline-flex w-10 h-5 rounded-full transition-colors focus:outline-none ${
                  form.published ? 'bg-red' : 'bg-white/10'
                }`}>
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    form.published ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm text-ash font-semibold">
                {form.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </form>
      </div>
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
