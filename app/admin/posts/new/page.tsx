'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';

const DEFAULT_CONTENT = `## Introduction

Write your introduction here.

## Main Content

Your main content goes here.

## Conclusion

Wrap it up here.
`;

export default function NewPostPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    coverImage: '',
    author: 'Edward-Precious Omegbu',
    published: false,
    content: DEFAULT_CONTENT,
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
    setForm((prev) => ({ ...prev, title, slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create post');
        return;
      }

      router.push('/admin/posts');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
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
          <span className="text-ash text-sm">New Post</span>
        </div>
        <button
          form="post-form"
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all disabled:opacity-50">
          <SaveIcon className="size-4" />
          {saving ? 'Saving...' : 'Save Post'}
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-4 border border-red/50 bg-red/10 text-red text-sm">{error}</div>
        )}

        <form id="post-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content (left) */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-ash/50 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Post title..."
                className="w-full bg-dark border border-white/[0.06] text-light placeholder-ash/30 px-4 py-3 text-base font-montserrat font-bold focus:outline-none focus:border-red/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-ash/50 mb-2">
                Content (Markdown)
              </label>
              <textarea
                required
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                rows={28}
                className="w-full bg-dark border border-white/[0.06] text-light placeholder-ash/30 px-4 py-3 text-sm font-mono focus:outline-none focus:border-red/50 transition-colors resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Meta (right) */}
          <div className="space-y-5">
            <Field label="Slug">
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="my-post-slug"
                className={inputCls}
              />
            </Field>

            <Field label="Excerpt">
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                rows={3}
                placeholder="Brief description..."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className={inputCls}
              />
            </Field>

            <Field label="Tags (comma separated)">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                placeholder="TypeScript, React, Node.js"
                className={inputCls}
              />
            </Field>

            <Field label="Cover Image URL">
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>

            <Field label="Author">
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                className={inputCls}
              />
            </Field>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                role="switch"
                aria-checked={form.published}
                onClick={() => setForm((p) => ({ ...p, published: !p.published }))}
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
