'use client';

import { GiyuButton } from '@/components/atoms/GiyuButton';
import { CircleLink } from '@/components/general/CircleLink';
import { socialMediaLinks } from '@/lib/constants/data';
import Image from 'next/image';
import Link from 'next/link';

export const AboutSection = () => {
  const handleCVDownload = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      geolocation: navigator.geolocation,
      maxTouchPoints: navigator.maxTouchPoints,
      mediaCapabilities: navigator.mediaCapabilities,
      mediaDevices: navigator.mediaDevices,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        isCVDownload: true,
        message: JSON.stringify(info, null, 2),
      }),
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
    });
    const link = document.createElement('a');
    link.download = 'Edward-Precious Omegbu - Frontend Engineer CV.pdf';
    link.href = '/files/codegiyu-cv.pdf';
    link.click();
  };

  return (
    <section id="about" className="w-full py-12">
      <div className="container flex flex-col items-center gap-10 lg:flex-row lg:gap-16 lg:items-center lg:justify-between">
        {/* Intro */}
        <div className="w-full max-w-[600px] flex flex-col gap-6 lg:gap-12">
          <div className="flex flex-col gap-10 font-montserrat text-light">
            <h1 className="text-[30px] md:text-[36px] font-bold leading-[110%]">
              Hi, I&apos;m <span className="text-red">Edward-Precious Omegbu</span>
            </h1>
            <p className="font-poppins font-normal text-sm lg:text-base leading-[150%] tracking-normal">
              {/* A.K.A. <span className="text-red text-base lg:text-xl font-semibold">Codegiyu. </span> */}
              Experienced Frontend Developer skilled in React.js, Next.js, and TypeScript.
              Specializing in high-performance, scalable web applications with modern UI frameworks
              like TailwindCSS. Passionate about pixel-perfect UIs, seamless user experiences,
              real-time data streaming, and optimizing web performance.
            </p>
          </div>
          <div className="flex gap-8">
            {socialMediaLinks.map((item, idx) => (
              <SocialMediaLink key={idx} {...item} />
            ))}
            <GiyuButton variant="ghost" size="icon" onClick={handleCVDownload}>
              <div className="relative w-[22px] lg:w-[30px] aspect-square">
                <Image src="/images/cv.svg" alt="cv" fill loading="eager" />
              </div>
            </GiyuButton>
          </div>
        </div>

        <div className="w-auto hidden lg:block">
          <CircleLink activeIndex={1} />
        </div>

        <div className="w-full md:w-[400px] lg:w-[375px] xl:w-[450px]">
          <Image
            src="/images/profile.jpg"
            width={400}
            height={535}
            alt="CodeGiyu - React Frontend Developer"
            className={'w-full object-cover rounded-[10px] shadow-sm'}
            priority
          />
        </div>
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
    <Link href={link}>
      <div className="relative w-[22px] lg:w-[30px] aspect-square">
        <Image src={imgSrc} alt={alt} fill loading="eager" />
      </div>
    </Link>
  );
}
