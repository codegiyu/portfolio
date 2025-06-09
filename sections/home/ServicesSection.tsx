'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CircleLink } from '@/components/general/CircleLink';
import { SectionHeader } from '@/components/general/SectionHeader';
import { Skill, skillIcons, SKILLS } from '@/lib/constants/data';
import ErrorBoundary from '@/components/general/ErrorBoundary';

export const ServicesSection = () => {
  return (
    <section id="services" className="w-full py-12 my-12 lg:my-28">
      <div className="container grid gap-16">
        <SectionHeader preheading="Services" heading="Skill-Set" />

        <div className="flex gap-6 lg:items-center">
          <div className="flex-1">
            <ErrorBoundary>
              {/* <div className="flex flex-wrap gap-2 lg:gap-4 w-full"> */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 lg:gap-4">
                {SKILLS.map((item, idx) => (
                  <SkillsBox key={idx} {...item} />
                ))}
              </div>
            </ErrorBoundary>
          </div>

          <div className="w-auto hidden lg:block">
            <CircleLink activeIndex={2} />
          </div>
        </div>
      </div>
    </section>
  );
};

export interface SkillsBoxProps {
  skill: Skill;
}

function SkillsBox({ skill }: SkillsBoxProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => setIsHovered(false);

  const imageClass = isHovered
    ? 'animate-[spin_5s_ease-in-out] animation-once transition-all duration-1000'
    : 'transition-all';

  return (
    <div
      // min-w-[140px] xs:min-w-[48.5%] sm:min-w-[160px] md:min-w-[160px] lg:min-w-[200px] max-w-max
      className="w-full flex items-center justify-center gap-2 lg:gap-3 
      py-6 md:py-8 lg:py-12 px-2 lg:px-4 rounded-[8px] bg-dark drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] 
      transform-style-3d perspective-1000 hover:scale-y-95 z-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div className="relative w-9 lg:w-12 aspect-square">
        <Image src={skillIcons[skill]} fill className={imageClass} alt={skill} loading="eager" />
      </div>
      <p className="text-xs md:text-sm lg:text-[16px] leading-[100%] font-medium font-montserrat text-[#FAFAFA]">
        {skill}
      </p>
    </div>
  );
}
