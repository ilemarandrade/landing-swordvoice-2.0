"use client";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

export function RankCard() {
  const { primaryPath } = useCurrentUser();

  return (
    <div className="mx-3 mt-auto hidden flex-col gap-2 rounded-[18px] border border-white/15 bg-[#000E2799] p-4 md:flex">
      <span className="text-xs uppercase tracking-wider text-[#9A9AAE]">Tu rango</span>
      <span className="font-sedgwick text-[26px] text-primary">
        {primaryPath?.name ?? "Por definir"}
      </span>
    </div>
  );
}
