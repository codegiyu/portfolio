import localFont from 'next/font/local';

export const lobster = localFont({
  src: './fonts/lobster-latin.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-lobster',
});

export const montserrat = localFont({
  src: './fonts/montserrat-latin.woff2',
  weight: '400 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-montserrat',
});

export const poppins = localFont({
  src: [
    { path: './fonts/poppins-400-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/poppins-500-latin.woff2', weight: '500', style: 'normal' },
    { path: './fonts/poppins-600-latin.woff2', weight: '600', style: 'normal' },
    { path: './fonts/poppins-700-latin.woff2', weight: '700', style: 'normal' },
    { path: './fonts/poppins-900-latin.woff2', weight: '900', style: 'normal' },
    { path: './fonts/poppins-italic-400-latin.woff2', weight: '400', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-poppins',
});
