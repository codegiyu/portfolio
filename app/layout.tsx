import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './Providers';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { lobster, montserrat, poppins } from './fonts';

export const metadata: Metadata = {
  title: 'Codegiyu — Fullstack Product Engineer',
  description:
    'Edward-Precious Omegbu is a fullstack product engineer building scalable mobile apps, web platforms, and APIs with React Native, Next.js, and Node.js.',

  robots: 'index, follow, max-image-preview:large',
  authors: [
    {
      name: 'Edward-Precious Omegbu',
      url: 'https://github.com/codegiyu',
    },
  ],

  openGraph: {
    type: 'profile',
    url: 'https://portfolio-codegiyu.vercel.app',
    title: 'Codegiyu — Fullstack Product Engineer',
    description:
      'Edward-Precious Omegbu is a fullstack product engineer building scalable mobile apps, web platforms, and APIs with React Native, Next.js, and Node.js.',
    siteName: 'Codegiyu',
    images: [
      {
        url: 'https://i.postimg.cc/PrXgbw0G/Screenshot-2025-06-10-075408.png',
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
    images: 'https://i.postimg.cc/PrXgbw0G/Screenshot-2025-06-10-075408.png',
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
        <link rel="canonical" href="https://portfolio-codegiyu.vercel.app/" />
        <link rel="alternate" type="application/rss+xml" title="Codegiyu Blog" href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Edward-Precious Omegbu',
              url: 'https://portfolio-codegiyu.vercel.app',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
