'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function VerifyContent() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const fragmentToken = hash.get('token');
    window.history.replaceState(null, '', '/admin/verify');
    setToken(fragmentToken);
    setLoading(false);
  }, []);

  async function verify() {
    if (!token) {
      setError('This sign-in link is missing or invalid.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: window.location.origin,
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) throw new Error('This sign-in link is invalid or has expired.');
      router.replace('/admin/posts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setLoading(false);
    }
  }

  return (
    <div className="text-center">
      {loading ? (
        <>
          <div className="inline-block w-12 h-12 border-4 border-gray-700 border-t-red rounded-full animate-spin mb-4" />
          <p className="text-light font-semibold">Preparing your sign-in...</p>
        </>
      ) : error ? (
        <>
          <h2 className="text-2xl font-bold text-red mb-2">Verification Failed</h2>
          <p className="text-ash mb-6">{error}</p>
          <a
            href="/admin"
            className="inline-block px-6 py-3 bg-red text-light font-semibold hover:opacity-90 transition-all">
            Try Again
          </a>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-light mb-2">Complete sign-in</h2>
          <p className="text-ash mb-6">Continue to open your portfolio admin panel.</p>
          <button
            type="button"
            onClick={verify}
            className="inline-block px-6 py-3 bg-red text-light font-semibold hover:opacity-90 transition-all">
            Sign in
          </button>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-gray-700 border-t-red rounded-full animate-spin mb-4" />
            <p className="text-light font-semibold">Loading...</p>
          </div>
        }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
