"use client";
import { learningPaths } from "@/common/constants/learningPaths";
import { useSessionStore } from "@/common/store/useSessionStore";

export function RankCard() {
  const path = useSessionStore((state) => state.user?.path ?? null);

  return (
    <div className="mx-3 mt-auto hidden flex-col gap-2 rounded-[18px] border border-white/15 bg-[#000E2799] p-4 md:flex">
      <span className="text-xs uppercase tracking-wider text-[#9A9AAE]">Tu rango</span>
      <span className="font-sedgwick text-[26px] text-primary">
        {path ? learningPaths[path].name : "Por definir"}
      </span>
    </div>
  );
}
