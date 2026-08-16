'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ChevronLeftIcon, SaveIcon, UploadIcon, ExternalLinkIcon } from 'lucide-react';
import type { AboutSettings } from '@/lib/types/general';

export default function CvSettingsPage() {
  const [cvUrl, setCvUrl] = useState('');
  const [about, setAbout] = useState<AboutSettings | null>(null);
  const [version, setVersion] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings/about?scope=admin')
      .then(async r => {
        if (!r.ok) throw new Error('Failed to load settings');
        return r.json();
      })
      .then(data => {
        setAbout(data.value);
        setVersion(data.version);
        setCvUrl(data.value.cvUrl || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'cv');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setCvUrl(url);
      setMessage({ type: 'ok', text: 'CV uploaded — save to apply.' });
    } catch {
      setMessage({ type: 'err', text: 'Upload failed.' });
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
        body: JSON.stringify({ ...(about as AboutSettings), cvUrl, expectedVersion: version }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAbout(data.value);
      setVersion(data.version);
      setMessage({ type: 'ok', text: 'CV URL saved.' });
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
            <h2 className="font-montserrat font-black text-2xl text-light">CV</h2>
            <p className="text-ash text-sm mt-0.5">Link or file shown by the Download CV button</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-white/10 border-t-red rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-ash/50">
                CV URL
              </label>
              <p className="text-xs text-ash/40">
                Paste a Google Drive link, a direct PDF URL, or upload a file below.
              </p>
              <input
                className={INPUT}
                value={cvUrl}
                onChange={e => setCvUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-ash hover:text-red transition-colors self-start">
                <ExternalLinkIcon className="size-3.5" />
                Preview current CV
              </a>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-ash/50">
                Upload to R2
              </label>
              <p className="text-xs text-ash/40">
                Upload a PDF to Cloudflare R2. The public URL will be set automatically.
              </p>
              <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-white/10 hover:border-red/40 transition-colors cursor-pointer text-sm text-ash hover:text-red w-fit">
                <UploadIcon className="size-4" />
                {uploading ? 'Uploading…' : 'Choose PDF…'}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {message && (
              <p
                className={`text-sm font-medium ${message.type === 'ok' ? 'text-green-400' : 'text-red'}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all disabled:opacity-50 self-start">
              <SaveIcon className="size-4" />
              {saving ? 'Saving…' : 'Save CV URL'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const INPUT =
  'bg-dark border border-white/[0.08] text-light text-sm px-3 py-2.5 outline-none focus:border-red/40 transition-colors placeholder:text-ash/30 w-full';
