import Link from 'next/link';
import { Logo } from '@/components/atoms/Logo';

export const Footer = () => {
  return (
    <footer className="w-full bg-darkBg border-t border-white/[0.06]">
      <section className="w-full container flex flex-col sm:flex-row justify-between items-center gap-4 py-6">
        <Logo size="small" />

        <nav className="flex items-center gap-6 text-xs font-semibold text-ash">
          <Link href="/projects" className="hover:text-red transition-colors">
            Projects
          </Link>
          <Link href="/blog" className="hover:text-red transition-colors">
            Blog
          </Link>
          <Link href="/#contact" className="hover:text-red transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-red transition-colors">
            Privacy
          </Link>
        </nav>

        <p className="text-xs text-ash/60">
          &copy; {new Date().getFullYear()}{' '}
          <Link href="/admin" className="hover:text-ash/60">
            Edward-Precious Omegbu
          </Link>
        </p>
      </section>
    </footer>
  );
};
