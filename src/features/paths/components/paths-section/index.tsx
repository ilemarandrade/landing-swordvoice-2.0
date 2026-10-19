"use client";
import { PathCard } from "@/common/components/path-card";
import { routes } from "@/common/constants/routes";
import { PathsError } from "@/features/paths/components/paths-error";
import { PathsSkeleton } from "@/features/paths/components/paths-skeleton";
import { getPathIcon } from "@/features/paths/constants/pathIcons";
import { usePathDetailsQueries } from "@/features/paths/hooks/usePathDetailQuery";
import { usePathsQuery } from "@/features/paths/hooks/usePathsQuery";

export function PathsSection() {
  const { data, isPending, isError, refetch } = usePathsQuery();
  const paths = data?.items ?? [];
  const details = usePathDetailsQueries(paths.map((p) => p.slug));

  return (
    <section
      id="our_paths"
      aria-labelledby="our-paths-title"
      className="bg-ourPathsBackground bg-cover bg-center my-32"
    >
      <div className="bg-blurry px-4 py-20">
        <div className="mx-auto max-w-[880px]">
          <h2
            id="our-paths-title"
            className="text-center font-sedgwick text-4xl text-white md:text-5xl"
          >
            Nuestros <span className="text-primary">Paths</span>
          </h2>
          <p className="mx-auto mb-8 mt-3 max-w-[560px] text-center text-[17px] leading-relaxed text-[#E6E6EE]">
            Elige tu camino, forja tu espada y supera las pruebas para ganar tu
            rango.
          </p>
          {isPending && <PathsSkeleton variant="cards" />}
          {isError && <PathsError onRetry={() => refetch()} />}
          {data && (
            <div className="grid gap-16 md:grid-cols-2">
              {paths.map((path, index) => {
                const detail = details[index]?.data;
                return (
                  <PathCard
                    key={path.id}
                    Icon={getPathIcon(path.slug)}
                    name={path.name}
                    description={path.description ?? ""}
                    href={`${routes.PATHS}/${path.slug}`}
                    eyebrow={`Rango · v${path.currentVersion}`}
                    stats={
                      detail && [
                        { value: detail.topics.length, label: "Modulos" },
                        {
                          value: detail.requiredCertifications.length,
                          label: "Pruebas",
                        },
                      ]
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
