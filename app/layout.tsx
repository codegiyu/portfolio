import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './Providers';

export const metadata: Metadata = {
  title: 'CodeGiyu - React Frontend Developer',
  description:
    'Experienced Frontend Developer skilled in React.js, Next.js, and TypeScript. Specializing in high-performance, scalable web applications with modern UI frameworks like TailwindCSS. Passionate about seamless user experiences, real-time data streaming, and optimizing web performance.',

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
    title: 'CodeGiyu - React Frontend Developer',
    description:
      'Experienced Frontend Developer skilled in React.js, Next.js, and TypeScript. Specializing in high-performance, scalable web applications with modern UI frameworks like TailwindCSS. Passionate about seamless user experiences, real-time data streaming, and optimizing web performance.',
    siteName: 'CodeGiyu - React Frontend Developer',
    images: [
      {
        url: 'https://i.postimg.cc/PrXgbw0G/Screenshot-2025-06-10-075408.png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'CodeGiyu - React Frontend Developer',
    description:
      'Experienced Frontend Developer skilled in React.js, Next.js, and TypeScript. Specializing in high-performance, scalable web applications with modern UI frameworks like TailwindCSS. Passionate about seamless user experiences, real-time data streaming, and optimizing web performance.',
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
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="canonical" href="https://portfolio-codegiyu.vercel.app/" />
      </head>
      <body className={`antialiased w-full min-h-full bg-darkBg text-light font-poppins grid`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
