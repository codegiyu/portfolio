'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FolderIcon, FileTextIcon, LogOutIcon, ExternalLinkIcon } from 'lucide-react';

const NAV = [
  { href: '/admin/posts', label: 'Posts', Icon: FileTextIcon },
  { href: '/admin/projects', label: 'Projects', Icon: FolderIcon },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    document.cookie = 'admin_token=; Max-Age=0; path=/';
    router.push('/admin');
  }

  return (
    <header className="border-b border-white/[0.06] bg-dark/80 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <Link href="/admin/posts" className="font-montserrat font-black text-lg shrink-0">
          <span className="text-red">Code</span>giyu
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold font-montserrat transition-colors ${
                  active
                    ? 'text-light bg-white/[0.06]'
                    : 'text-ash hover:text-light hover:bg-white/[0.04]'
                }`}>
                <Icon className="size-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-ash hover:text-red transition-colors font-semibold">
          Site <ExternalLinkIcon className="size-3" />
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs text-ash hover:text-red transition-colors font-semibold">
          <LogOutIcon className="size-3.5" />
          Sign out
        </button>
      </div>
    </header>
  );
}
