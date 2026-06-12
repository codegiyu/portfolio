'use client';

import Image from 'next/image';
import { Skill, skillIcons, SKILLS } from '@/lib/constants/data';
import { ScrollReveal, StaggerReveal } from '@/components/general/ScrollReveal';

export const ServicesSection = () => {
  return (
    <section id="services" className="w-full py-20 lg:py-28">
      <div className="container grid gap-14">

        {/* Header */}
        <ScrollReveal className="flex flex-col gap-2">
          <p className="text-ash text-xs font-semibold uppercase tracking-widest">What I work with</p>
          <h2 className="font-montserrat font-black text-3xl md:text-4xl text-light">
            Tech Stack
          </h2>
          <div className="w-12 h-[3px] bg-red mt-1" />
        </ScrollReveal>

        {/* Skills grid */}
        <StaggerReveal className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
          {SKILLS.map((item, idx) => (
            <SkillCard key={idx} skill={item.skill} />
          ))}
        </StaggerReveal>

        {/* Specialty areas */}
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]" stagger={0.1}>
          <SpecialtyCard
            label="Mobile"
            description="React Native & Expo apps for iOS and Android, from MVP to production."
          />
          <SpecialtyCard
            label="Backend"
            description="Node.js APIs and services with Express, Hono, or Fastify — built to scale."
          />
          <SpecialtyCard
            label="Web"
            description="Next.js web platforms and marketing sites with performance as a first-class concern."
          />
        </StaggerReveal>

      </div>
    </section>
  );
};

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="group flex items-center gap-3 px-4 py-4 bg-dark border border-white/[0.06] rounded-sm hover:border-red/40 transition-all duration-200 hover:translate-y-[-2px]">
      <div className="relative w-7 h-7 flex-shrink-0">
        <Image
          src={skillIcons[skill]}
          fill
          className="object-contain group-hover:scale-110 transition-transform duration-200"
          alt={skill}
          loading="eager"
        />
      </div>
      <p className="text-xs font-semibold font-montserrat text-light/80 group-hover:text-light transition-colors leading-tight">
        {skill}
      </p>
    </div>
  );
}

function SpecialtyCard({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 p-5 bg-dark border border-white/[0.06] rounded-sm">
      <div className="flex items-center gap-2">
        <div className="w-[3px] h-5 bg-red rounded-full" />
        <p className="font-montserrat font-bold text-light text-base">{label}</p>
      </div>
      <p className="text-ash text-sm leading-relaxed">{description}</p>
    </div>
  );
}
