'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ChevronLeftIcon, SaveIcon, UploadIcon } from 'lucide-react';
import type { AboutSettings } from '@/lib/types/general';

const DEFAULT: AboutSettings = {
  greeting: "Hi, I'm Edward",
  name: 'Edward',
  role: 'Fullstack Product Engineer',
  bio: '',
  profileImage: '/images/eddy-profile.jpg',
  cvUrl: '',
};

export default function AboutSettingsPage() {
  const [form, setForm] = useState<AboutSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [version, setVersion] = useState<number | undefined>();
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings/about?scope=admin')
      .then(async r => {
        if (!r.ok) throw new Error('Failed to load settings');
        return r.json();
      })
      .then(data => {
        setForm(data.value);
        setVersion(data.version);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function set(key: keyof AboutSettings, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'profile');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      set('profileImage', url);
      setMessage({ type: 'ok', text: 'Image uploaded — save to apply.' });
    } catch {
      setMessage({ type: 'err', text: 'Image upload failed.' });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, expectedVersion: version }),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setVersion(data.version);
      setMessage({ type: 'ok', text: 'About settings saved.' });
    } catch {
      setMessage({ type: 'err', text: 'Failed to save. Try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-darkBg text-light">
      <AdminHeader />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/settings" className="text-ash hover:text-red transition-colors">
            <ChevronLeftIcon className="size-5" />
          </Link>
          <div>
            <h2 className="font-montserrat font-black text-2xl text-light">About</h2>
            <p className="text-ash text-sm mt-0.5">Hero section content</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-white/10 border-t-red rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <Field label="Greeting line" hint="e.g. Hi, I'm Edward">
              <input
                className={INPUT}
                value={form.greeting}
                onChange={e => set('greeting', e.target.value)}
              />
            </Field>

            <Field label="Name">
              <input
                className={INPUT}
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </Field>

            <Field label="Role / title" hint="Last word is highlighted in red">
              <input
                className={INPUT}
                value={form.role}
                onChange={e => set('role', e.target.value)}
              />
            </Field>

            <Field label="Bio">
              <textarea
                rows={4}
                className={INPUT + ' resize-none'}
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
              />
            </Field>

            <Field label="CV URL" hint="Google Drive or R2 public link">
              <input
                className={INPUT}
                value={form.cvUrl}
                onChange={e => set('cvUrl', e.target.value)}
                placeholder="https://..."
              />
            </Field>

            <Field label="Profile image">
              <div className="flex items-center gap-3">
                <input
                  className={INPUT + ' flex-1'}
                  value={form.profileImage}
                  onChange={e => set('profileImage', e.target.value)}
                  placeholder="/images/... or https://..."
                />
                <label className="flex items-center gap-1.5 px-3 py-2 border border-white/10 text-ash hover:border-red/50 hover:text-red transition-colors text-xs font-semibold cursor-pointer flex-shrink-0">
                  <UploadIcon className="size-3.5" />
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </Field>

            {message && (
              <p
                className={`text-sm font-medium ${message.type === 'ok' ? 'text-green-400' : 'text-red'}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all disabled:opacity-50 self-start mt-2">
              <SaveIcon className="size-4" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black uppercase tracking-widest text-ash/60">{label}</label>
      {hint && <p className="text-xs text-ash/40 -mt-1">{hint}</p>}
      {children}
    </div>
  );
}

const INPUT =
  'bg-dark border border-white/[0.08] text-light text-sm px-3 py-2.5 outline-none focus:border-red/40 transition-colors placeholder:text-ash/30 w-full';
