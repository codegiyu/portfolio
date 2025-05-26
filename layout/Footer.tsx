import { Logo } from '@/components/atoms/Logo';

export const Footer = () => {
  return (
    <footer className="w-full bg-darkBg">
      <section className="w-full container flex justify-between items-baseline py-4 bg-darkBg">
        <div className="">
          <Logo size="small" />
        </div>
        <div className="">
          <p className="text-ash">Copyright &copy; {new Date().getFullYear()}</p>
        </div>
      </section>
    </footer>
  );
};
