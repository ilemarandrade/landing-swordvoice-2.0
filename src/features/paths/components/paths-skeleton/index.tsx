type PathsSkeletonProps = { variant: "cards" | "detail" };

const block = "animate-pulse rounded-[18px] border border-white/10 bg-white/5";

export function PathsSkeleton({ variant }: PathsSkeletonProps) {
  if (variant === "cards") {
    return (
      <div role="status" className="grid gap-6 md:grid-cols-2">
        <span className="sr-only">Cargando paths…</span>
        <div className={`${block} h-[360px]`} />
        <div className={`${block} h-[360px]`} />
      </div>
    );
  }
  return (
    <div role="status" className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-12 md:px-12">
      <span className="sr-only">Cargando path…</span>
      <div className={`${block} h-48`} />
      <div className={`${block} h-24`} />
      <div className={`${block} h-24`} />
    </div>
  );
}
