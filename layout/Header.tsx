'use client';

import { useState } from 'react';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from '@/components/icons';
import { XIcon } from 'lucide-react';

const navBarLinks: NavLinkProps[] = [
  { href: '/#about', text: 'About Me', targetDescriptor: '#about' },
  { href: '/#services', text: 'Services', targetDescriptor: '#services' },
  { href: '/#works', text: 'Works', targetDescriptor: '#works' },
  { href: '/#contact', text: 'Contact Me', targetDescriptor: '#contact' },
];
const _404NavbarLinks: NavLinkProps[] = [{ href: '/', text: 'Home' }];

interface HeaderProps {
  hideNav?: boolean;
}

const Header = ({ hideNav }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-darkBg sticky top-0 z-50">
      <section
        className={`w-full container flex justify-between items-center font-montserrat py-4 z-10`}>
        <div>
          <Logo />
        </div>

        <Nav links={hideNav ? _404NavbarLinks : navBarLinks} />

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="w-fit lg:hidden outline-none" asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-transparent"
              onClick={() => setMenuOpen(prev => !prev)}>
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
            <section className="w-[250px] h-full flex-none bg-darkBg py-6 px-5 md:py-10">
              <div className="h-full flex flex-col justify-between">
                <div className="grid gap-20">
                  <div className="center-container w-full flex items-center justify-between">
                    <Logo />
                    <Button variant="ghost" className="p-2" onClick={() => setMenuOpen(false)}>
                      <XIcon className="size-5 text-red" />
                    </Button>
                  </div>
                  <nav className="">
                    <ul className="grid gap-8 text-white">
                      {(hideNav ? _404NavbarLinks : navBarLinks).map((item, idx) => (
                        <NavLink key={idx} {...item} afterClick={() => setMenuOpen(false)} />
                      ))}
                    </ul>
                  </nav>
                </div>
                <div className="center-container">
                  <p className="text-sm text-gray2">&copy; Copyright {new Date().getFullYear()}</p>
                </div>
              </div>
            </section>
            <SheetClose className="h-full w-full flex-1"></SheetClose>
          </SheetContent>
        </Sheet>
      </section>
    </header>
  );
};

interface NavProps {
  links: NavLinkProps[];
  isMobileNav?: boolean;
}

function Nav({ links, isMobileNav = false }: NavProps) {
  return (
    <nav
      className={`${isMobileNav ? '' : 'hidden lg:block'} font-semibold text-lg leading-[100%] text-ash`}>
      <ul className={`${isMobileNav ? 'grid' : 'flex gap-10'}`}>
        {links.map((item, idx) => (
          <NavLink key={idx} {...item} />
        ))}
      </ul>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  text: string;
  targetDescriptor?: string;
  afterClick?: () => void;
}

function NavLink({ targetDescriptor, href, text, afterClick }: NavLinkProps) {
  return (
    <li>
      <Button
        variant="ghost"
        size="icon"
        className="hover:text-red"
        {...(targetDescriptor
          ? {
              onClick: () => {
                const element = document.querySelector(targetDescriptor);
                afterClick?.();

                if (!element) return;

                element.scrollIntoView({ behavior: 'smooth' });
              },
            }
          : {
              href,
            })}>
        {text}
      </Button>
    </li>
  );
}

export { Header };
