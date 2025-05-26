'use client';

import ErrorBoundary from '@/components/general/ErrorBoundary';
import { ContactForm } from '@/components/general/ContactForm';

export const ContactSection = () => {
  return (
    <section id="contact" className="w-full py-12 my-4 bg-dark">
      <div className="container w-full sm:w-[450px] md:w-[600px] lg:w-full xl:w-[1100px] grid gap-16">
        <div className="flex justify-center">
          <div className="flex flex-col w-fit h-fit overflow-x-hidden flex-none py-2">
            <h4 className="text-[32px] font-semibold text-white text-center font-montserrat leading-[110%] inline w-auto">
              Got a project?
            </h4>
            <span className="h-[6px] w-[40%] translate-x-0 animate-rebound bg-red my-4"></span>
            <h4 className="text-[32px] font-semibold text-white font-montserrat leading-[110%] inline w-auto">
              Contact me now
            </h4>
          </div>
        </div>

        <div className="flex gap-6 lg:items-center">
          <div className="flex-1">
            <ErrorBoundary>
              <ContactForm />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
};
