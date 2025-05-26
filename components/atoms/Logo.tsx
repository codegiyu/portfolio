import Link from 'next/link';

export const Logo = ({ size = 'large' }: { size?: 'small' | 'large' }) => {
  return (
    <Link href={'/'}>
      <p
        className={`text-white ${size === 'large' ? 'text-2xl' : 'text-xl'} font-semibold font-lobster leading-[100%]`}>
        <span className={`${size === 'large' ? 'text-4xl' : 'text-[1.625rem]'}`}>C</span>
        ode
        <span className="text-red">giyu</span>
      </p>
    </Link>
  );
};
