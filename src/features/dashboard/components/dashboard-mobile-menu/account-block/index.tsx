"use client";
import Link from "next/link";
import ChevronIcon from "@/common/assets/icons/ChevronIcon";
import { Avatar } from "@/common/components/avatar";
import { routes } from "@/common/constants/routes";
import { RankRow } from "@/features/dashboard/components/dashboard-mobile-menu/account-block/rank-row";
import { useAccountMenu } from "@/features/dashboard/hooks/useAccountMenu";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-primary focus-visible:outline-offset-2";

type AccountBlockProps = {
  onNavigate: () => void;
};

export function AccountBlock({ onNavigate }: AccountBlockProps) {
  const { name, roleLabel, photoUrl } = useAccountMenu();

  return (
    <section
      aria-label="Tu cuenta"
      className="mt-6 w-full overflow-hidden rounded-xl border border-white/15 bg-[#000E2799]"
    >
      <Link
        href={routes.DASHBOARD_PROFILE}
        onClick={onNavigate}
        className={`group flex min-h-[68px] items-center gap-3 p-3 text-white no-underline ${FOCUS_RING}`}
      >
        <Avatar
          name={name}
          photoUrl={photoUrl}
          size={44}
          className="group-hover:border-primary"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-base font-bold">{name}</span>
          <div className="flex items-center gap-2 text-[13px] text-[#C9C9D6]">
            {roleLabel && (
              <span className="rounded-full border border-primary/60 px-2 text-[12px] leading-[18px] text-white">
                {roleLabel}
              </span>
            )}
            <span>Ver perfil</span>
          </div>
        </div>
        <span className="-rotate-90 text-[#C9C9D6] transition-colors group-hover:text-primary">
          <ChevronIcon width={20} />
        </span>
      </Link>
      <RankRow onNavigate={onNavigate} />
    </section>
  );
}
