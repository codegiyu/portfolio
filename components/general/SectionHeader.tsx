import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  preheading: string;
  heading: string;
  className?: string;
}
export const SectionHeader = ({ preheading, heading, className }: SectionHeaderProps) => {
  return (
    <div
      className={cn(
        'flex flex-col w-fit max-w-[450px] flex-none font-montserrat overflow-x-hidden',
        className
      )}>
      <p className="text-sm lg:text-xl text-white font-semibold inline w-auto">{preheading}</p>
      <h2 className="text-[2rem] lg:text-[3.5rem] leading-none text-red font-bold inline w-auto">
        {heading}
      </h2>
      <span className="h-[6px] w-[40%] translate-x-0 animate-rebound bg-red mt-4"></span>
    </div>
  );
};
