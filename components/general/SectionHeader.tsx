interface SectionHeaderProps {
  preheading: string;
  heading: string;
}
export const SectionHeader = ({ preheading, heading }: SectionHeaderProps) => {
  return (
    <div className="flex flex-col w-fit flex-none font-montserrat overflow-x-hidden">
      <p className="text-sm lg:text-xl text-white font-semibold inline w-auto">{preheading}</p>
      <h2 className="text-[2rem] lg:text-[3.5rem] leading-none text-red font-bold inline w-auto">
        {heading}
      </h2>
      <span className="h-[6px] w-[40%] translate-x-0 animate-rebound bg-red mt-4"></span>
    </div>
  );
};
