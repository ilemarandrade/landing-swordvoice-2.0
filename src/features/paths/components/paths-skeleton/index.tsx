type PathsSkeletonProps = { variant: "cards" | "detail" };

const block = "animate-pulse rounded-[18px] border border-white/10 bg-white/5";

export function PathsSkeleton({ variant }: PathsSkeletonProps) {
  if (variant === "cards") {
    return (
      <div aria-busy="true" aria-label="Cargando paths" className="grid gap-6 md:grid-cols-2">
        <div className={`${block} h-[360px]`} />
        <div className={`${block} h-[360px]`} />
      </div>
    );
  }
  return (
    <div aria-busy="true" aria-label="Cargando path" className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-12 md:px-12">
      <div className={`${block} h-48`} />
      <div className={`${block} h-24`} />
      <div className={`${block} h-24`} />
    </div>
  );
}
