'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  FolderIcon,
  FileTextIcon,
  BarChart2Icon,
  SettingsIcon,
  ExternalLinkIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  LogOutIcon,
} from 'lucide-react';
import { Logo } from '@/components/atoms/Logo';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const NAV = [
  { href: '/admin/posts', label: 'Posts', Icon: FileTextIcon },
  { href: '/admin/projects', label: 'Projects', Icon: FolderIcon },
  { href: '/admin/analytics', label: 'Analytics', Icon: BarChart2Icon },
  { href: '/admin/settings', label: 'Settings', Icon: SettingsIcon },
];

function NavLinks({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 flex-1 mt-6">
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold font-montserrat transition-colors rounded-sm ${
              active
                ? 'text-light bg-white/[0.08]'
                : 'text-ash hover:text-light hover:bg-white/[0.04]'
            }`}>
            <Icon className="size-4 flex-shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function ProfileDropdown({
  adminName,
  adminEmail,
  profileImage,
  onSignOut,
}: {
  adminName: string;
  adminEmail: string;
  profileImage: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-white/10 hover:border-red/50 transition-colors focus:outline-none">
        {profileImage ? (
          <Image
            src={profileImage}
            alt={adminName}
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full bg-white/10 flex items-center justify-center text-xs font-bold text-ash">
            {adminName?.[0]?.toUpperCase() ?? 'A'}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-dark border border-white/[0.08] shadow-xl z-50">
          {/* Identity */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-semibold text-light truncate">{adminName}</p>
            <p className="text-xs text-ash/60 truncate mt-0.5">{adminEmail}</p>
          </div>

          {/* Actions */}
          <div className="py-1">
            <Link
              href="/admin/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-ash hover:text-light hover:bg-white/[0.04] transition-colors">
              <UserIcon className="size-3.5" />
              Profile
            </Link>
            <Link
              href="/"
              target="_blank"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-ash hover:text-light hover:bg-white/[0.04] transition-colors">
              <ExternalLinkIcon className="size-3.5" />
              View site
            </Link>
          </div>

          <div className="border-t border-white/[0.06] py-1">
            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ash hover:text-red hover:bg-white/[0.04] transition-colors">
              <LogOutIcon className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminShell({
  children,
  adminName,
  adminEmail,
  profileImage,
}: {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
  profileImage: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Origin: window.location.origin },
    });
    router.replace('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-darkBg text-light flex">
      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 bg-dark border-r border-white/[0.06] z-20">
        <div className="px-5 pt-6 pb-2">
          <Logo size="small" />
        </div>

        <div className="flex-1 px-3 overflow-y-auto">
          <NavLinks pathname={pathname} />
        </div>

        <div className="px-3 pb-5 border-t border-white/[0.06] pt-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-ash hover:text-light transition-colors">
            <ExternalLinkIcon className="size-3.5" />
            View site
          </Link>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-60">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-dark/80 backdrop-blur-sm px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="text-ash hover:text-light transition-colors">
                  <MenuIcon className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 bg-dark border-r border-white/[0.06] p-0 flex flex-col">
                <div className="flex items-center justify-between px-5 pt-5 pb-2">
                  <Logo size="small" />
                  <SheetClose className="text-ash hover:text-light transition-colors">
                    <XIcon className="size-5" />
                  </SheetClose>
                </div>

                <div className="flex-1 px-3 overflow-y-auto">
                  <SheetClose asChild>
                    <div>
                      <NavLinks pathname={pathname} />
                    </div>
                  </SheetClose>
                </div>

                <div className="px-3 pb-5 border-t border-white/[0.06] pt-3">
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-ash hover:text-light transition-colors">
                    <ExternalLinkIcon className="size-3.5" />
                    View site
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            <Logo size="small" />
          </div>

          {/* Desktop: breadcrumb title area (empty, sidebar has the logo) */}
          <div className="hidden md:block" />

          {/* Profile dropdown */}
          <ProfileDropdown
            adminName={adminName}
            adminEmail={adminEmail}
            profileImage={profileImage}
            onSignOut={handleSignOut}
          />
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
