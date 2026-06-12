'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError('No token provided');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) throw new Error('Verification failed');

        router.push('/admin/posts');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
        setLoading(false);
      }
    }

    verify();
  }, [token, router]);

  return (
    <div className="text-center">
      {loading ? (
        <>
          <div className="inline-block w-12 h-12 border-4 border-gray-700 border-t-red rounded-full animate-spin mb-4" />
          <p className="text-light font-semibold">Verifying your sign-in...</p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-red mb-2">Verification Failed</h2>
          <p className="text-ash mb-6">{error}</p>
          <a
            href="/admin"
            className="inline-block px-6 py-3 bg-red text-light font-semibold hover:opacity-90 transition-all">
            Try Again
          </a>
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
