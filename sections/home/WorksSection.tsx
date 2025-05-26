'use client';

// import { CircleLink } from '@/components/general/CircleLink';
import ErrorBoundary from '@/components/general/ErrorBoundary';
import { SectionHeader } from '@/components/general/SectionHeader';
import PROJECTS, { Skill, skillIcons } from '@/lib/constants/data';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Manipulation, A11y, Pagination, Parallax, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export const WorksSection = () => {
  return (
    <section id="works" className="w-full py-12 my-12 lg:my-28">
      <div className="container grid gap-16">
        <SectionHeader preheading="Works" heading="Recent Projects" />

        <div className="w-full overflow-hidden">
          <div className="">
            <ErrorBoundary>
              <div className="w-full overflow-hidden">
                <Swiper
                  modules={[Mousewheel, Manipulation, A11y, Pagination, Parallax, Navigation]}
                  loop={true}
                  centeredSlides={true}
                  navigation={true}
                  mousewheel={true}
                  slidesPerView={'auto'}
                  spaceBetween={28}
                  className="mySwiper w-full h-auto flex justify-center flex-nowrap">
                  {PROJECTS.map((item, idx) => (
                    <SwiperSlide
                      key={idx}
                      className={`w-full lg:max-w-[600px] transition-all duration-300 ease-in-out`}>
                      <ProjectSingle key={idx} {...item} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </ErrorBoundary>
          </div>

          {/* <div className="w-auto hidden lg:block">
            <CircleLink activeIndex={3} />
          </div> */}
        </div>
      </div>
    </section>
  );
};

export interface ProjectSingleProps {
  img: string;
  title: string;
  description: string;
  skills: Skill[];
  githubLink?: string;
  liveLink: string;
}

function ProjectSingle({ img, title, description, skills, liveLink }: ProjectSingleProps) {
  return (
    <div
      className="w-full flex-none flex flex-col rounded-[20px] bg-dark text-center text-ash font-montserrat 
      overflow-hidden pb-8">
      <div
        className={`w-full aspect-[1.8] relative bg-cover bg-center`}
        style={{ backgroundImage: `url(${img})` }}>
        {/* <Image src={ img } alt={title} fill loading="eager" priority /> */}
      </div>
      <a href={liveLink} target="_blank" rel="noopener noreferrer">
        <h3 className="text-red text-2xl lg:text-[32px] hover:underline hover:underline-offset-8 font-bold my-4">
          {title}
        </h3>
      </a>
      <p className="text-sm lg:text-base font-semibold">{description}</p>
      <div className="flex justify-center gap-4 lg:gap-8 items-center mt-6">
        {skills.map((skill, idx) => (
          <div key={idx} className="relative w-[30px] lg:w-[40px] aspect-square">
            <Image alt={skill} src={skillIcons[skill]} fill className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
