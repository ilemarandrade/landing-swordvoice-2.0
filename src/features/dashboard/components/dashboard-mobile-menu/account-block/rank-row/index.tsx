"use client";
import Link from "next/link";
import { getPathIcon } from "@/common/constants/pathIcons";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";
import { useMyPathHref } from "@/features/dashboard/hooks/useMyPathHref";

const ROW_CLASS =
  "flex min-h-11 items-center gap-3 border-t border-white/15 px-3 pb-3 pt-2 text-white no-underline";
const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-primary focus-visible:outline-offset-2";

type RankRowProps = {
  onNavigate: () => void;
};

export function RankRow({ onNavigate }: RankRowProps) {
  const { primaryPath } = useCurrentUser();
  const { myPathHref } = useMyPathHref();
  const PathIcon = primaryPath ? getPathIcon(primaryPath.slug) : null;

  const content = (
    <>
      {PathIcon && (
        <span className="flex-none text-secondary [&_path]:fill-current">
          <PathIcon width={32} />
        </span>
      )}
      <div className="flex items-baseline gap-1.5">
        <span className="text-xs uppercase tracking-wider text-[#9A9AAE]">Rango</span>
        <span className="font-sedgwick text-[22px] leading-tight text-primary">
          {primaryPath?.name ?? "Por definir"}
        </span>
      </div>
    </>
  );

  if (!primaryPath) {
    return <div className={ROW_CLASS}>{content}</div>;
  }

  return (
    <Link
      href={myPathHref}
      onClick={onNavigate}
      className={`${ROW_CLASS} ${FOCUS_RING}`}
    >
      {content}
    </Link>
  );
}
