"use client";
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { PathHero } from "@/features/paths/components/path-detail/path-hero";
import { PathTrail } from "@/features/paths/components/path-detail/path-trail";
import { RequiredCertifications } from "@/features/paths/components/path-detail/required-certifications";
import { PathsError } from "@/features/paths/components/paths-error";
import { PathsSkeleton } from "@/features/paths/components/paths-skeleton";
import { usePathDetailQuery } from "@/features/paths/hooks/usePathDetailQuery";
import { usePathProgress } from "@/features/paths/hooks/usePathProgress";
import { buildTrail } from "@/features/paths/utils/buildTrail";

type PathDetailProps = { slug: string; withProgress?: boolean };

const messageContainer = "mx-auto w-full max-w-[1200px] px-4 py-12 md:px-12";

export function PathDetail({ slug, withProgress = false }: PathDetailProps) {
  const { data: path, isPending, isError, isNotFound, refetch } = usePathDetailQuery(slug);
  const { progress } = usePathProgress(withProgress ? path : undefined);

  if (isPending) return <PathsSkeleton variant="detail" />;
  if (isNotFound) {
    return (
      <div className={messageContainer}>
        <div role="alert" className="flex flex-col items-center gap-4 rounded-[18px] border border-white/15 bg-[#000E2799] p-8 text-center text-white">
          <p className="text-[17px] text-[#E6E6EE]">Este path no existe.</p>
          <Link
            href={routes.OUR_PATHS}
            className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 font-sedgwick text-lg text-primary no-underline hover:bg-primary/[0.12]"
          >
            Ver todos los paths
          </Link>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className={messageContainer}>
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
