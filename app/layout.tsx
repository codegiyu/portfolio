import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './Providers';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { AnalyticsConsent } from '@/components/analytics/AnalyticsConsent';
import { lobster, montserrat, poppins } from './fonts';
import { getSiteUrl, isIndexableEnvironment } from '@/lib/site-url';

const siteUrl = getSiteUrl();
const indexable = isIndexableEnvironment();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  alternates: { canonical: '/' },
  title: 'Codegiyu — Fullstack Product Engineer',
  description:
    'Edward-Precious Omegbu is a fullstack product engineer building scalable mobile apps, web platforms, and APIs with React Native, Next.js, and Node.js.',

  robots: indexable
    ? { index: true, follow: true, 'max-image-preview': 'large' }
    : { index: false, follow: false },
  authors: [
    {
      name: 'Edward-Precious Omegbu',
      url: 'https://github.com/codegiyu',
    },
  ],

  openGraph: {
    type: 'profile',
    url: siteUrl.toString(),
    title: 'Codegiyu — Fullstack Product Engineer',
    description:
      'Edward-Precious Omegbu is a fullstack product engineer building scalable mobile apps, web platforms, and APIs with React Native, Next.js, and Node.js.',
    siteName: 'Codegiyu',
    images: [
      {
        url: '/images/codegiyu-wide.jpg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Codegiyu — Fullstack Product Engineer',
    description:
      'Edward-Precious Omegbu is a fullstack product engineer building scalable mobile apps, web platforms, and APIs with React Native, Next.js, and Node.js.',
    site: '@TheLonerider20',
    creator: '@TheLonerider20',
    images: ['/images/codegiyu-wide.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lobster.variable} ${montserrat.variable} ${poppins.variable}`}
      data-scroll-behavior="smooth">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="alternate" type="application/rss+xml" title="Codegiyu Blog" href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Edward-Precious Omegbu',
              url: siteUrl.toString(),
              sameAs: [
                'https://github.com/codegiyu',
                'https://x.com/TheLonerider20',
                'https://linkedin.com/in/edward-precious-omegbu',
              ],
              jobTitle: 'Fullstack Product Engineer',
              description:
                'Fullstack product engineer building scalable mobile apps, web platforms, and APIs with React Native, Next.js, and Node.js.',
            }),
          }}
        />
      </head>
      <body className={`antialiased w-full min-h-full bg-darkBg text-light font-poppins grid`}>
        <PageViewTracker />
        <AnalyticsConsent />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
