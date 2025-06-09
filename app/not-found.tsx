import { GiyuButton } from '@/components/atoms/GiyuButton';
import { Header } from '@/layout/Header';

const NotFound = () => {
  return (
    <main className="w-full h-screen bg-darkBg grid grid-rows-[auto_1fr]">
      <Header hideNav />
      <section className="w-full h-full grid place-items-center">
        <div className="w-fit grid gap-5">
          <h1 className="text-8xl text-bold text-center">404</h1>
          <p className="text-2xl text-medium text-light/70 text-center">Page not found</p>
          <GiyuButton href="/" text="Return Home" wrapClassName="w-fit mx-auto" />
        </div>
      </section>
    </main>
  );
};

export default NotFound;
