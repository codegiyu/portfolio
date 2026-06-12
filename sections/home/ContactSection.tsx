'use client';

import ErrorBoundary from '@/components/general/ErrorBoundary';
import { ContactForm } from '@/components/general/ContactForm';
import { ScrollReveal } from '@/components/general/ScrollReveal';
import { useClipboard } from '@/hooks/use-clipboard';
import type { ContactItem } from '@/lib/types/general';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import type { LucideIcon } from '@/lib/types/general';

interface ContactSectionProps {
  contact: ContactItem[];
}

function getIcon(type: string): LucideIcon {
  switch (type) {
    case 'email':
      return Mail;
    case 'whatsapp':
    case 'message':
      return MessageSquare;
    default:
      return Phone;
  }
}

export const ContactSection = ({ contact }: ContactSectionProps) => {
  return (
    <section id="contact" className="w-full py-20 lg:py-28 bg-dark border-t border-white/[0.06]">
      <div className="container grid gap-16 lg:grid-cols-2 lg:gap-20 items-start">

        {/* Left */}
        <div className="flex flex-col gap-10">
          <ScrollReveal className="flex flex-col gap-3">
            <p className="text-ash text-xs font-semibold uppercase tracking-widest">Get in touch</p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl text-light leading-[1.2]">
              Let&apos;s build something{' '}
              <span className="text-red">great</span> together
            </h2>
            <div className="w-12 h-[3px] bg-red mt-1" />
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="text-ash leading-relaxed max-w-md">
              Have a project in mind? Whether it&apos;s a mobile app, backend API, or full-stack platform —
              I&apos;m most responsive via email, but feel free to reach out however works for you.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.18} className="flex flex-col gap-4">
            {contact.map((item, idx) => (
              <ContactDisplay key={idx} item={item} />
            ))}
          </ScrollReveal>
        </div>

        {/* Right — Form */}
        <ScrollReveal delay={0.1} y={30} className="w-full">
          <ErrorBoundary>
            <ContactForm />
          </ErrorBoundary>
        </ScrollReveal>

      </div>
    </section>
  );
};

function ContactDisplay({ item }: { item: ContactItem }) {
  const { copy } = useClipboard();
  const Icon = getIcon(item.type);

  return (
    <div
      className="flex items-center gap-3 group w-fit cursor-pointer"
      onClick={() => copy(item.value, { showToast: true })}>
      <div className="w-9 h-9 border border-white/10 rounded flex items-center justify-center group-hover:border-red/50 transition-colors">
        <Icon className="size-4 text-ash group-hover:text-red transition-colors" />
      </div>
      <span className="text-sm font-semibold text-ash group-hover:text-light transition-colors font-montserrat">
        {item.text}
      </span>
      <span className="text-xs text-ash/40 group-hover:text-ash/60 transition-colors">
        (click to copy)
      </span>
    </div>
  );
}

// Kept for external imports that still reference the old shape
export interface ContactDisplayProps {
  Icon: LucideIcon;
  value: string;
  text: string;
}
