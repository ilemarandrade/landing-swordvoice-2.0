import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { PathProgress } from "@/features/paths/components/path-detail/path-hero/path-progress";
import { getPathIcon } from "@/features/paths/constants/pathIcons";
import type { PathDetail } from "@/features/paths/schemas/path.schema";
import type { Trail } from "@/features/paths/utils/buildTrail";

type PathHeroProps = {
  path: PathDetail;
  trail: Trail;
  hasProgress: boolean;
};

export function PathHero({ path, trail, hasProgress }: PathHeroProps) {
  const Icon = getPathIcon(path.slug);
  const eyebrow = `${path.description ?? path.name} · v${path.version}${path.isCurrent ? "" : " · versión anterior"}`;

  return (
    <header className="bg-ourPathsBackground bg-cover bg-center">
      <div className="bg-gradient-to-b from-black/60 to-black">
        <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 md:px-12">
          {!hasProgress && (
            <Link href={routes.OUR_PATHS} className="inline-flex min-h-11 items-center text-[15px] font-semibold text-primary hover:text-[#FFA34D]">
              ← Todos los paths
            </Link>
          )}
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
            <span className="flex-none text-secondary [&_path]:fill-current">
              <Icon width={96} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9A9AAE]">{eyebrow}</p>
              <h1 className="mt-1 font-sedgwick text-[56px] leading-[1.1] text-white md:text-[64px]">{path.name}</h1>
              <p className="text-[17px] leading-relaxed text-[#E6E6EE]">
                Recorre el camino de la espada: completa cada tema y supera las pruebas para ganar tu rango.
              </p>
              <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-[#C9C9D6]">
                <span><b className="text-white">{trail.topicCount}</b> temas</span>
                <span><b className="text-white">{trail.resourceCount}</b> recursos</span>
                <span><b className="text-white">{trail.requiredCount}</b> pruebas requeridas</span>
              </p>
              {hasProgress && <PathProgress percent={trail.percent} />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
