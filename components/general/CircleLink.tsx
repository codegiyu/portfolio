export const CircleLink = ({ activeIndex }: { activeIndex: number }) => {
  return (
    <div className="w-auto flex flex-col items-center">
      <Circle index={1} activeIndex={activeIndex} />
      <Line />
      <Circle index={2} activeIndex={activeIndex} />
      <Line />
      <Circle index={3} activeIndex={activeIndex} />
    </div>
  );
};

interface CircleProps {
  index: number;
  activeIndex: number;
}

function Circle({ index, activeIndex }: CircleProps) {
  return (
    <div
      className={`circle w-5 aspect-square rounded-full border border-white
        ${index === activeIndex ? 'bg-white' : 'bg-transparent'}`}
    />
  );
}

function Line() {
  return <div className="line w-[1px] h-[85px] bg-white" />;
}
