import { ReactNode } from 'react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </>
  );
}
