'use client';

import { GiyuButton } from '@/components/atoms/GiyuButton';
import { ScrollReveal } from '@/components/general/ScrollReveal';
import { socialMediaLinks } from '@/lib/constants/data';
import Image from 'next/image';
import Link from 'next/link';

export const AboutSection = () => {
  const handleCVDownload = () => {
    const info = {
      userAgent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: { width: window.innerWidth, height: window.innerHeight },
    };
    fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ isCVDownload: true, message: JSON.stringify(info, null, 2) }),
      headers: { 'Content-Type': 'application/json' },
    });
    const link = document.createElement('a');
    link.href = 'https://drive.google.com/file/d/1xOXjqKNRdTGmKQvdp0KMO6kFHD9LYITb/view?usp=sharing';
    link.target = '_blank';
    link.click();
  };

  return (
    <section id="about" className="w-full py-20 md:py-28 lg:py-36">
      <div className="container flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-20">

        {/* Text */}
        <div className="flex flex-col gap-8 lg:max-w-[600px]">
          <ScrollReveal className="flex flex-col gap-4">
            <p className="text-ash font-medium text-sm tracking-widest uppercase">
              Hi, I&apos;m Edward
            </p>
            <h1 className="font-montserrat font-black text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.1] text-light">
              Fullstack Product{' '}
              <span className="text-red">Engineer</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="font-poppins text-ash leading-[1.8] text-base max-w-[520px]">
              I build scalable products end-to-end — mobile apps with React Native & Expo, backends
              with Node.js, and web platforms with Next.js. I care about architecture, developer
              experience, and shipping things that actually work.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={0.18} className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/#contact"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center justify-center px-6 py-3 bg-red text-light text-sm font-semibold font-montserrat transition-all hover:opacity-90 hover:scale-[1.02] active:scale-100">
              Get In Touch
            </Link>
            <GiyuButton
              variant="outline"
              size="default"
              onClick={handleCVDownload}
              className="px-6 py-3 text-sm font-semibold font-montserrat border-white/20 text-ash hover:border-red hover:text-red">
              Download CV
            </GiyuButton>
          </ScrollReveal>

          {/* Social links */}
          <ScrollReveal delay={0.24} className="flex items-center gap-5 pt-2">
            {socialMediaLinks.map((item, idx) => (
              <SocialMediaLink key={idx} {...item} />
            ))}
          </ScrollReveal>
        </div>

        {/* Image */}
        <ScrollReveal delay={0.1} y={30} className="w-full max-w-[360px] mx-auto lg:mx-0 lg:w-[380px] xl:w-[420px] flex-shrink-0">
          <div className="relative">
            {/* Red accent line */}
            <div className="absolute -left-3 top-6 bottom-6 w-[3px] bg-red rounded-full" />
            <Image
              src="/images/profile.jpg"
              width={420}
              height={560}
              alt="Edward-Precious Omegbu — Fullstack Product Engineer"
              className="w-full object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
              priority
            />
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export interface SocialMediaLinkProps {
  link: string;
  imgSrc: string;
  alt: string;
}

function SocialMediaLink({ link, imgSrc, alt }: SocialMediaLinkProps) {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group w-9 h-9 border border-white/10 rounded flex items-center justify-center hover:border-red/60 transition-colors">
      <div className="relative w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity">
        <Image src={imgSrc} alt={alt} fill />
      </div>
    </Link>
  );
}
