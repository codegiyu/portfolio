'use client';

import { useEffect } from 'react';

export function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    history.replaceState(null, '', window.location.pathname + window.location.search);
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return null;
}
