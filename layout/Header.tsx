'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from '@/components/icons';
import { XIcon } from 'lucide-react';

interface NavItem {
  href: string;
  text: string;
  anchor?: string;
}

const navItems: NavItem[] = [
  { href: '/#about', text: 'About', anchor: '#about' },
  { href: '/projects', text: 'Projects' },
  { href: '/blog', text: 'Blog' },
  { href: '/#contact', text: 'Contact', anchor: '#contact' },
];

interface HeaderProps {
  hideNav?: boolean;
}

const Header = ({ hideNav }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="w-full bg-darkBg/95 backdrop-blur-sm sticky top-0 z-50 border-b border-white/[0.06]">
      <section className="w-full container flex justify-between items-center font-montserrat py-4">
        <Logo />

        {!hideNav && (
          <>
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map(item => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </nav>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger className="w-fit lg:hidden outline-none" asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-transparent"
                  onClick={() => setMenuOpen(true)}>
                  <i className="text-2xl text-white">
                    <Menu />
                  </i>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full h-screen grid grid-cols-[auto_1fr] gap-0 p-0 border-none bg-transparent"
                aria-describedby={undefined}>
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <section className="w-[260px] h-full flex-none bg-darkBg border-r border-white/[0.06] py-6 px-5 md:py-10">
                  <div className="h-full flex flex-col justify-between">
                    <div className="grid gap-16">
                      <div className="flex items-center justify-between">
                        <Logo />
                        <Button variant="ghost" className="p-2" onClick={() => setMenuOpen(false)}>
                          <XIcon className="size-5 text-red" />
                        </Button>
                      </div>
                      <nav>
                        <ul className="grid gap-6">
                          {navItems.map(item => (
                            <li key={item.href}>
                              <MobileNavLink
                                item={item}
                                pathname={pathname}
                                onClose={() => setMenuOpen(false)}
                              />
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                    <p className="text-sm text-ash">&copy; {new Date().getFullYear()} Codegiyu</p>
                  </div>
                </section>
                <SheetClose className="h-full w-full flex-1" />
              </SheetContent>
            </Sheet>
          </>
        )}

        {hideNav && (
          <Link
            href="/"
            className="text-sm text-ash hover:text-red transition-colors font-semibold">
            ← Home
          </Link>
        )}
      </section>
    </header>
  );
};

function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === '/projects')
    return pathname === '/projects' || pathname.startsWith('/projects/');
  if (item.href === '/blog') return pathname === '/blog' || pathname.startsWith('/blog/');
  return false;
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(item, pathname);

  const handleAnchorClick = (e: React.MouseEvent, anchor: string) => {
    if (pathname === '/') {
      e.preventDefault();
      document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Link
      href={item.href}
      onClick={item.anchor ? e => handleAnchorClick(e, item.anchor!) : undefined}
      className={`text-sm font-semibold transition-colors hover:text-red relative group ${
        active ? 'text-red' : 'text-ash'
      }`}>
      {item.text}
      <span
        className={`absolute -bottom-1 left-0 h-px bg-red transition-all duration-300 ${
          active ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
      />
    </Link>
  );
}

function MobileNavLink({
  item,
  pathname,
  onClose,
}: {
  item: NavItem;
  pathname: string;
  onClose: () => void;
}) {
  const active = isActive(item, pathname);

  const handleClick = (e: React.MouseEvent) => {
    onClose();
    if (item.anchor && pathname === '/') {
      e.preventDefault();
      setTimeout(() => {
        document.querySelector(item.anchor!)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      className={`text-lg font-semibold transition-colors hover:text-red ${
        active ? 'text-red' : 'text-light'
      }`}>
      {item.text}
    </Link>
  );
}

export { Header };
