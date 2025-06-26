'use client';

import ErrorBoundary from '@/components/general/ErrorBoundary';
import { ContactForm } from '@/components/general/ContactForm';
import { SectionHeader } from '@/components/general/SectionHeader';
import { GiyuButton } from '@/components/atoms/GiyuButton';
import { useClipboard } from '@/hooks/use-clipboard';
import { contactInfo } from '@/lib/constants/data';
import { LucideIcon } from 'lucide-react';

export const ContactSection = () => {
  return (
    <section id="contact" className="w-full py-20 my-4 bg-dark">
      <div className="container w-full grid justify-items-center lg:justify-items-start gap-16 lg:grid-cols-2 lg:gap-10 2xl:grid-cols-[1fr_550px] 2xl:gap-16">
        <div className="grid gap-12">
          <SectionHeader
            preheading="Get in Touch"
            heading="I'd Love to Work With You"
            className="items-center lg:items-start text-center lg:text-start"
          />
          <div className="w-full grid gap-6 justify-items-center lg:justify-items-start">
            {contactInfo.map((item, idx) => (
              <ContactDisplay key={idx} {...item} />
            ))}
          </div>
        </div>

        <div className="w-full flex gap-6 lg:items-center">
          <ErrorBoundary>
            <ContactForm />
          </ErrorBoundary>
        </div>
      </div>
    </section>
  );
};

export interface ContactDisplayProps {
  Icon: LucideIcon;
  value: string;
  text: string;
}

const ContactDisplay = ({ Icon, value, text }: ContactDisplayProps) => {
  const { copy } = useClipboard();

  return (
    <div className="w-fit flex items-center gap-3">
      <div className="w-[40px] aspect-square bg-white rounded-full grid place-items-center">
        <Icon className="size-5 text-dark" />
      </div>
      <GiyuButton
        variant="ghost"
        size="icon"
        text={text}
        onClick={() => copy(value, { showToast: true })}
      />
    </div>
  );
};
