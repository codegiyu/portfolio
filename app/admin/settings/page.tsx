'use client';

import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { UserIcon, PhoneIcon, FileTextIcon, CodeIcon, ChevronRightIcon } from 'lucide-react';

const SECTIONS = [
  {
    href: '/admin/settings/about',
    Icon: UserIcon,
    label: 'About',
    description: 'Name, role, bio, profile image, and CV link shown in the hero section.',
  },
  {
    href: '/admin/settings/contact',
    Icon: PhoneIcon,
    label: 'Contact & Social',
    description: 'Phone/email contact info and social media links.',
  },
  {
    href: '/admin/settings/skills',
    Icon: CodeIcon,
    label: 'Skills & Specialties',
    description: 'Active tech stack icons and the Mobile / Backend / Web specialty cards.',
  },
  {
    href: '/admin/settings/cv',
    Icon: FileTextIcon,
    label: 'CV',
    description: "Direct link or file upload for the downloadable CV.",
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-darkBg text-light">
      <AdminHeader />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="font-montserrat font-black text-2xl text-light">Site Settings</h2>
          <p className="text-ash text-sm mt-1">
            Manage all content displayed on the public-facing portfolio.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {SECTIONS.map(({ href, Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-5 p-5 border border-white/[0.06] bg-dark hover:border-red/30 transition-colors group">
              <div className="w-10 h-10 border border-white/10 rounded flex items-center justify-center flex-shrink-0 group-hover:border-red/40 transition-colors">
                <Icon className="size-4 text-ash group-hover:text-red transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-light text-sm">{label}</p>
                <p className="text-ash text-xs mt-0.5 leading-relaxed">{description}</p>
              </div>
              <ChevronRightIcon className="size-4 text-ash/30 group-hover:text-ash/60 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
