'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  SaveIcon,
  UploadIcon,
  PlusIcon,
  TrashIcon,
  GripVerticalIcon,
} from 'lucide-react';
import type { AboutSettings, SocialLink } from '@/lib/types/general';

const DEFAULT_ABOUT: AboutSettings = {
  greeting: "Hi, I'm Edward",
  name: 'Edward',
  role: 'Fullstack Product Engineer',
  bio: '',
  profileImage: '',
  cvUrl: '',
};

const PLATFORMS = ['twitter', 'github', 'linkedin', 'whatsapp', 'instagram', 'youtube', 'other'];

export default function ProfilePage() {
  const [about, setAbout] = useState<AboutSettings>(DEFAULT_ABOUT);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<{ about?: number; social?: number }>({});
  const [uploading, setUploading] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [msg, setMsg] = useState<Record<string, { type: 'ok' | 'err'; text: string }>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/about?scope=admin').then(r => r.json()),
      fetch('/api/settings/social?scope=admin').then(r => r.json()),
    ])
      .then(([ab, so]) => {
        setAbout(ab.value as AboutSettings);
        setSocialLinks((so.value as { links: SocialLink[] }).links ?? []);
        setVersions({ about: ab.version, social: so.version });
      })
      .finally(() => setLoading(false));
  }, []);

  function setAboutField(key: keyof AboutSettings, value: string) {
    setAbout(prev => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(m => ({ ...m, about: { type: 'ok', text: 'Uploading…' } }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'profile');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setAboutField('profileImage', url);
      setMsg(m => ({ ...m, about: { type: 'ok', text: 'Image uploaded — save to apply.' } }));
    } catch {
      setMsg(m => ({ ...m, about: { type: 'err', text: 'Image upload failed.' } }));
    } finally {
      setUploading(false);
    }
  }

  async function saveAbout(e: React.FormEvent) {
    e.preventDefault();
    setSavingAbout(true);
    setMsg(m => ({ ...m, about: null as never }));
    try {
      const res = await fetch('/api/settings/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...about, expectedVersion: versions.about }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVersions(prev => ({ ...prev, about: data.version }));
      setMsg(m => ({ ...m, about: { type: 'ok', text: 'Profile saved.' } }));
    } catch {
      setMsg(m => ({ ...m, about: { type: 'err', text: 'Failed to save. Try again.' } }));
    } finally {
      setSavingAbout(false);
    }
  }

  // ── Social ──────────────────────────────────────────────────────────────────

  function addSocial() {
    setSocialLinks(prev => [...prev, { platform: 'other', url: '', icon: '', alt: '' }]);
  }

  function updateSocial(i: number, key: keyof SocialLink, value: string) {
    setSocialLinks(prev => prev.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));
  }

  function removeSocial(i: number) {
    setSocialLinks(prev => prev.filter((_, idx) => idx !== i));
  }

  async function saveSocial(e: React.FormEvent) {
    e.preventDefault();
    setSavingSocial(true);
    setMsg(m => ({ ...m, social: null as never }));
    try {
      const res = await fetch('/api/settings/social', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: socialLinks, expectedVersion: versions.social }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVersions(prev => ({ ...prev, social: data.version }));
      setMsg(m => ({ ...m, social: { type: 'ok', text: 'Social links saved.' } }));
    } catch {
      setMsg(m => ({ ...m, social: { type: 'err', text: 'Save failed.' } }));
    } finally {
      setSavingSocial(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-white/10 border-t-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-10">
      {/* ── Profile image + about ───────────────────────────────────────────── */}
      <form onSubmit={saveAbout} className="flex flex-col gap-6">
        <div className="mb-2">
          <h2 className="font-montserrat font-black text-2xl text-light">Profile</h2>
          <p className="text-ash text-sm mt-0.5">About section content and profile image</p>
        </div>

        {/* Avatar preview + upload */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex-shrink-0">
            {about.profileImage ? (
              <Image
                src={about.profileImage}
                alt={about.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-ash/40">
                {about.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <input
              className={INPUT}
              value={about.profileImage}
              onChange={e => setAboutField('profileImage', e.target.value)}
              placeholder="/images/... or https://..."
            />
            <label className="flex items-center gap-1.5 w-fit px-3 py-1.5 border border-white/10 text-ash hover:border-red/50 hover:text-red transition-colors text-xs font-semibold cursor-pointer">
              <UploadIcon className="size-3.5" />
              {uploading ? 'Uploading…' : 'Upload image'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <Field label="Greeting line">
          <input
            className={INPUT}
            value={about.greeting}
            onChange={e => setAboutField('greeting', e.target.value)}
            placeholder="Hi, I'm Edward"
          />
        </Field>

        <Field label="Name">
          <input
            className={INPUT}
            value={about.name}
            onChange={e => setAboutField('name', e.target.value)}
          />
        </Field>

        <Field label="Role / title" hint="Last word is highlighted in red">
          <input
            className={INPUT}
            value={about.role}
            onChange={e => setAboutField('role', e.target.value)}
          />
        </Field>

        <Field label="Bio">
          <textarea
            rows={4}
            className={INPUT + ' resize-none'}
            value={about.bio}
            onChange={e => setAboutField('bio', e.target.value)}
          />
        </Field>

        <Field label="CV URL" hint="Google Drive or R2 public link">
          <input
            className={INPUT}
            value={about.cvUrl}
            onChange={e => setAboutField('cvUrl', e.target.value)}
            placeholder="https://..."
          />
        </Field>

        {msg.about && (
          <p
            className={`text-sm font-medium ${msg.about.type === 'ok' ? 'text-green-400' : 'text-red'}`}>
            {msg.about.text}
          </p>
        )}

        <button
          type="submit"
          disabled={savingAbout || uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all disabled:opacity-50 self-start">
          <SaveIcon className="size-4" />
          {savingAbout ? 'Saving…' : 'Save Profile'}
        </button>
      </form>

      <hr className="border-white/[0.06]" />

      {/* ── Social links ────────────────────────────────────────────────────── */}
      <form onSubmit={saveSocial} className="flex flex-col gap-4">
        <div className="mb-2">
          <h2 className="font-montserrat font-black text-xl text-light">Social links</h2>
          <p className="text-ash text-sm mt-0.5">Links shown in the contact section</p>
        </div>

        {socialLinks.map((link, i) => (
          <div
            key={i}
            className="flex items-start gap-2 border border-white/[0.06] p-3 bg-dark">
            <GripVerticalIcon className="size-4 text-ash/20 mt-2.5 flex-shrink-0" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <select
                className={SELECT}
                value={link.platform}
                onChange={e => updateSocial(i, 'platform', e.target.value)}>
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                className={INPUT}
                placeholder="Alt text"
                value={link.alt}
                onChange={e => updateSocial(i, 'alt', e.target.value)}
              />
              <input
                className={INPUT + ' col-span-2'}
                placeholder="URL (https://...)"
                value={link.url}
                onChange={e => updateSocial(i, 'url', e.target.value)}
              />
              <input
                className={INPUT + ' col-span-2'}
                placeholder="Icon path (/images/twitter.svg)"
                value={link.icon}
                onChange={e => updateSocial(i, 'icon', e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => removeSocial(i)}
              className="text-ash/40 hover:text-red transition-colors mt-2 flex-shrink-0">
              <TrashIcon className="size-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addSocial}
          className="flex items-center gap-1.5 text-xs text-ash hover:text-red transition-colors self-start">
          <PlusIcon className="size-3.5" /> Add social link
        </button>

        {msg.social && (
          <p
            className={`text-sm font-medium ${msg.social.type === 'ok' ? 'text-green-400' : 'text-red'}`}>
            {msg.social.text}
          </p>
        )}

        <button
          type="submit"
          disabled={savingSocial}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all disabled:opacity-50 self-start">
          <SaveIcon className="size-4" />
          {savingSocial ? 'Saving…' : 'Save Social Links'}
        </button>
      </form>
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

const SELECT =
  'bg-dark border border-white/[0.08] text-ash text-sm px-2 py-2 outline-none focus:border-red/40 transition-colors w-full';
