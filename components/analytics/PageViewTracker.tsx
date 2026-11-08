'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem('analytics-consent') !== 'granted') return;
    } catch {
      return;
    }
    // Skip admin pages and deduplicate route events for the current browser session.
    if (pathname.startsWith('/admin') || pathname === lastTracked.current) return;
    let trackedPaths: string[] = [];
    try {
      trackedPaths = JSON.parse(window.sessionStorage.getItem('analytics-session-paths') || '[]');
    } catch {
      trackedPaths = [];
    }
    if (trackedPaths.includes(pathname)) return;
    lastTracked.current = pathname;
    try {
      window.sessionStorage.setItem(
        'analytics-session-paths',
        JSON.stringify([...trackedPaths.filter(path => path !== pathname), pathname].slice(-50))
      );
    } catch {
      // Tracking must never interrupt navigation when storage is unavailable.
    }

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: true, path: pathname, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
