export default function SiteLoading() {
  return (
    <div
      className="flex min-h-[80vh] flex-col items-center justify-center gap-6"
      role="status"
      aria-label="Loading">
      <p aria-hidden="true" className="font-lobster text-2xl font-semibold leading-none text-white">
        <span className="text-4xl">C</span>ode<span className="text-red">giyu</span>
      </p>
      <div className="relative h-px w-14 overflow-hidden bg-white/10">
        <span className="absolute inset-y-0 w-7 bg-red animate-scan" />
      </div>
    </div>
  );
}
