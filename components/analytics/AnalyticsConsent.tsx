'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function hasAnalyticsConsent(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      window.localStorage.getItem('analytics-consent') === 'granted'
    );
  } catch {
    return false;
  }
}

export function AnalyticsConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setVisible(
          !pathname.startsWith('/admin') && !window.localStorage.getItem('analytics-consent')
        );
      } catch {
        setVisible(false);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  if (!visible) return null;

  const save = (value: 'granted' | 'denied') => {
    try {
      window.localStorage.setItem('analytics-consent', value);
    } catch {
      // A blocked storage implementation should fail closed for analytics.
    }
    setVisible(false);
  };

  return (
    <aside
      aria-label="Analytics consent"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl rounded border border-white/10 bg-darkBg p-4 shadow-2xl">
      <p className="text-sm leading-relaxed text-light/80">
        Allow anonymous, aggregate usage statistics to help improve this portfolio? No raw IP
        addresses are stored.{' '}
        <Link href="/privacy" className="text-red underline underline-offset-4">
          Read the privacy notice.
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => save('granted')}
          className="rounded bg-red px-4 py-2 text-sm font-semibold text-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-red">
          Allow analytics
        </button>
        <button
          type="button"
          onClick={() => save('denied')}
          className="rounded border border-white/20 px-4 py-2 text-sm font-semibold text-ash focus-visible:outline focus-visible:outline-2 focus-visible:outline-red">
          Decline
        </button>
      </div>
    </aside>
  );
}
