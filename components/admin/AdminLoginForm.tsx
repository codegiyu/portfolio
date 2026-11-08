'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'email' | 'token';

function extractToken(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http')) {
    try {
      const url = new URL(trimmed);
      const fromHash = new URLSearchParams(url.hash.replace(/^#/, '')).get('token');
      if (fromHash) return fromHash;
      const fromQuery = url.searchParams.get('token');
      if (fromQuery) return fromQuery;
    } catch {
      // fall through — treat as raw token
    }
  }
  return trimmed;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: window.location.origin,
        },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to send magic link');
      setStep('token');
    } catch {
      setError('Could not send the sign-in link. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const token = extractToken(tokenInput);
    if (!token) {
      setError('Paste the sign-in link or token from your email.');
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
      if (!res.ok) throw new Error('Invalid or expired sign-in link.');
      router.replace('/admin/posts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
      setLoading(false);
    }
  }

  if (step === 'token') {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <p className="text-ash text-sm text-center">
          Check your email and paste the sign-in link (or just the token) below.
        </p>

        <div>
          <label htmlFor="token" className="block text-sm font-semibold text-light mb-2">
            Sign-in link or token
          </label>
          <input
            id="token"
            type="text"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            placeholder="http://localhost:3000/admin/verify#token=…"
            autoFocus
            className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-light placeholder-ash/40 focus:outline-none focus:border-red transition-colors text-sm font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-red text-light font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        {error && <p className="text-sm text-red text-center">{error}</p>}

        <button
          type="button"
          onClick={() => {
            setStep('email');
            setError('');
            setTokenInput('');
          }}
          className="w-full text-ash text-sm hover:text-light transition-colors">
          ← Send a new link
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendLink} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-light mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-light placeholder-ash focus:outline-none focus:border-red transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-red text-light font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50">
        {loading ? 'Sending link…' : 'Send Magic Link'}
      </button>

      {error && <p className="text-sm text-red text-center">{error}</p>}

      <p className="text-center text-ash text-sm">
        You&apos;ll receive a one-time link via email valid for 15 minutes.
      </p>
    </form>
  );
}
