'use client';

export default function SiteError({ reset }: { reset: () => void }) {
  return (
    <main className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-light">This page is temporarily unavailable.</h1>
      <p className="text-ash">Please try again in a moment.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-red px-5 py-3 font-semibold text-light">
        Try again
      </button>
    </main>
  );
}
