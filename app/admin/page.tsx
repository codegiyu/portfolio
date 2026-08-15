'use client';

import { useState } from 'react';
import { Logo } from '@/components/atoms/Logo';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: window.location.origin,
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Failed to send magic link');
      }

      setMessage(
        'If the address is authorized, check your email for a sign-in link valid for 15 minutes.'
      );
      setEmail('');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-darkBg flex flex-col items-center px-4 py-10">
      {/* Logo — top center */}
      <header>
        <Logo size="large" />
      </header>

      {/* Form — vertically and horizontally centered in remaining space */}
      <main className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-light">Admin Panel</h1>
            <p className="text-ash mt-2">Sign in to manage your blog posts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? 'Sending link...' : 'Send Magic Link'}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-4 rounded-lg text-sm ${
                message.startsWith('If the address')
                  ? 'bg-green-900/20 border border-green-700 text-green-300'
                  : 'bg-red/20 border border-red text-red'
              }`}>
              {message}
            </div>
          )}

          <p className="text-center text-ash text-sm mt-6">
            You&apos;ll receive a one-time link via email to sign in without a password.
          </p>
        </div>
      </main>

      {/* Copyright — bottom center */}
      <footer>
        <p className="text-ash text-sm">
          &copy; {new Date().getFullYear()} Codegiyu. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
