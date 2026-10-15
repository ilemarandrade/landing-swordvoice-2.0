"use client";
import { PathHero } from "@/features/paths/components/path-detail/path-hero";
import { PathTrail } from "@/features/paths/components/path-detail/path-trail";
import { RequiredCertifications } from "@/features/paths/components/path-detail/required-certifications";
import { PathsError } from "@/features/paths/components/paths-error";
import { PathsSkeleton } from "@/features/paths/components/paths-skeleton";
import { usePathDetailQuery } from "@/features/paths/hooks/usePathDetailQuery";
import { usePathProgress } from "@/features/paths/hooks/usePathProgress";
import { buildTrail } from "@/features/paths/utils/buildTrail";

type PathDetailProps = { slug: string; withProgress?: boolean };

export function PathDetail({ slug, withProgress = false }: PathDetailProps) {
  const { data: path, isPending, isError, refetch } = usePathDetailQuery(slug);
  const { progress } = usePathProgress(withProgress ? path : undefined);

  if (isPending) return <PathsSkeleton variant="detail" />;
  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-12">
        <PathsError message="No pudimos cargar este path." onRetry={() => refetch()} />
      </div>
    );
  }

  const trail = buildTrail(path, progress);
  return (
    <>
      <PathHero path={path} trail={trail} hasProgress={withProgress} />
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 px-4 pb-20 pt-4 md:px-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-12">
        <RequiredCertifications certifications={path.requiredCertifications} progress={progress} />
        <PathTrail pathName={path.name} trail={trail} hasProgress={withProgress} />
      </div>
    </>
  );
}
