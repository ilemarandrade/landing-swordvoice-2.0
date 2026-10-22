const block = "animate-pulse rounded-[18px] border border-white/10 bg-white/5";

export function MentorsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando mentores"
      className="mx-4 mb-24 mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
    >
      <div aria-hidden="true" className={`${block} h-[420px]`} />
      <div aria-hidden="true" className={`${block} h-[420px]`} />
      <div aria-hidden="true" className={`${block} h-[420px]`} />
      <div aria-hidden="true" className={`${block} h-[420px]`} />
    </div>
  );
}
