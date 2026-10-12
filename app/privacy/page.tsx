import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy | Codegiyu',
  description: 'How this portfolio handles contact messages, analytics, and downloads.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    type: 'website',
    title: 'Privacy | Codegiyu',
    description: 'How this portfolio handles contact messages, analytics, and downloads.',
    url: '/privacy',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy | Codegiyu',
    description: 'How this portfolio handles contact messages, analytics, and downloads.',
  },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="container max-w-3xl py-20 md:py-28">
      <p className="text-ash text-xs font-semibold uppercase tracking-widest mb-3">Privacy</p>
      <h1 className="font-montserrat font-black text-4xl md:text-5xl text-light mb-6">
        A small, practical privacy notice
      </h1>
      <div className="space-y-8 text-ash leading-relaxed">
        <section>
          <h2 className="text-light font-montserrat font-bold text-xl mb-2">Contact messages</h2>
          <p>
            Messages submitted through the contact form are sent to the portfolio mailbox so they
            can be answered. The form validates and rate-limits submissions, and message contents
            are not stored in this site&apos;s database.
          </p>
        </section>
        <section>
          <h2 className="text-light font-montserrat font-bold text-xl mb-2">Optional analytics</h2>
          <p>
            Anonymous, aggregate page-view and CV-download counts are recorded only after you choose
            to allow analytics. The site does not persist raw IP addresses, raw event rows, screen
            dimensions, time zones, or full user-agent strings. Aggregate records are kept for up to
            90 days and can be disabled by choosing “Decline” in the consent notice or clearing the
            site&apos;s analytics preference.
          </p>
        </section>
        <section>
          <h2 className="text-light font-montserrat font-bold text-xl mb-2">
            Public content and hosting
          </h2>
          <p>
            Published portfolio content and media are served from the application and its object
            storage provider. Administrative sessions are protected by an expiring, revocable cookie
            and are not available through public content APIs.
          </p>
        </section>
        <section>
          <h2 className="text-light font-montserrat font-bold text-xl mb-2">Questions</h2>
          <p>
            For a privacy question or deletion request about a contact message, use the contact
            details on this site and include enough context to identify the request.
          </p>
        </section>
      </div>
    </main>
  );
}
