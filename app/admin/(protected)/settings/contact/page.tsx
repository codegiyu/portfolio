'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ChevronLeftIcon, SaveIcon, PlusIcon, TrashIcon, GripVerticalIcon } from 'lucide-react';
import type { ContactItem, SocialLink } from '@/lib/types/general';

interface ContactSettings {
  items: ContactItem[];
}

interface SocialSettings {
  links: SocialLink[];
}

const CONTACT_TYPES = ['phone', 'email', 'whatsapp', 'other'];
const PLATFORMS = ['twitter', 'github', 'linkedin', 'whatsapp', 'instagram', 'youtube', 'other'];

export default function ContactSettingsPage() {
  const [contactItems, setContactItems] = useState<ContactItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingContact, setSavingContact] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [msg, setMsg] = useState<Record<string, { type: 'ok' | 'err'; text: string }>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/contact').then(r => r.json()),
      fetch('/api/settings/social').then(r => r.json()),
    ])
      .then(([contact, social]) => {
        setContactItems((contact as ContactSettings).items ?? []);
        setSocialLinks((social as SocialSettings).links ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ─── Contact items ─────────────────────────────────────────────────────────

  function addContact() {
    setContactItems(prev => [...prev, { type: 'phone', text: '', value: '' }]);
  }

  function updateContact(i: number, key: keyof ContactItem, value: string) {
    setContactItems(prev =>
      prev.map((item, idx) => (idx === i ? { ...item, [key]: value } : item))
    );
  }

  function removeContact(i: number) {
    setContactItems(prev => prev.filter((_, idx) => idx !== i));
  }

  async function saveContact(e: React.FormEvent) {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await fetch('/api/settings/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: contactItems }),
      });
      if (!res.ok) throw new Error();
      setMsg(m => ({ ...m, contact: { type: 'ok', text: 'Contact info saved.' } }));
    } catch {
      setMsg(m => ({ ...m, contact: { type: 'err', text: 'Save failed.' } }));
    } finally {
      setSavingContact(false);
    }
  }

  // ─── Social links ──────────────────────────────────────────────────────────

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
    try {
      const res = await fetch('/api/settings/social', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: socialLinks }),
      });
      if (!res.ok) throw new Error();
      setMsg(m => ({ ...m, social: { type: 'ok', text: 'Social links saved.' } }));
    } catch {
      setMsg(m => ({ ...m, social: { type: 'err', text: 'Save failed.' } }));
    } finally {
      setSavingSocial(false);
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
            <h2 className="font-montserrat font-black text-2xl text-light">Contact & Social</h2>
            <p className="text-ash text-sm mt-0.5">Phone / email info and social media links</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-white/10 border-t-red rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Contact info */}
            <form onSubmit={saveContact} className="flex flex-col gap-4">
              <SectionHeader label="Contact info" />

              {contactItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 border border-white/[0.06] p-3 bg-dark">
                  <GripVerticalIcon className="size-4 text-ash/20 mt-2.5 flex-shrink-0" />
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <select
                      className={SELECT}
                      value={item.type}
                      onChange={e => updateContact(i, 'type', e.target.value)}>
                      {CONTACT_TYPES.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      className={INPUT}
                      placeholder="Display text"
                      value={item.text}
                      onChange={e => updateContact(i, 'text', e.target.value)}
                    />
                    <input
                      className={INPUT}
                      placeholder="Copy value"
                      value={item.value}
                      onChange={e => updateContact(i, 'value', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeContact(i)}
                    className="text-ash/40 hover:text-red transition-colors mt-2 flex-shrink-0">
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addContact}
                className="flex items-center gap-1.5 text-xs text-ash hover:text-red transition-colors self-start">
                <PlusIcon className="size-3.5" /> Add contact
              </button>

              {msg.contact && (
                <p
                  className={`text-sm font-medium ${msg.contact.type === 'ok' ? 'text-green-400' : 'text-red'}`}>
                  {msg.contact.text}
                </p>
              )}

              <SaveBtn loading={savingContact} />
            </form>

            <hr className="border-white/[0.06]" />

            {/* Social links */}
            <form onSubmit={saveSocial} className="flex flex-col gap-4">
              <SectionHeader label="Social links" />

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

              <SaveBtn loading={savingSocial} />
            </form>
          </div>
        )}
      </div>
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
const SELECT =
  'bg-darkBg border border-white/[0.08] text-ash text-sm px-2 py-2 outline-none focus:border-red/40 transition-colors w-full';
