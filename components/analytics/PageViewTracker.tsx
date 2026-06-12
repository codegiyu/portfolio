'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // Skip admin pages and deduplicate rapid re-renders
    if (pathname.startsWith('/admin') || pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
