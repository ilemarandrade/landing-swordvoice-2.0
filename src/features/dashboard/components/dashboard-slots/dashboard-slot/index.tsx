import type { DashboardSlotContent } from "@/features/dashboard/constants/dashboardSlots";

type DashboardSlotProps = { slot: DashboardSlotContent };

export function DashboardSlot({ slot }: DashboardSlotProps) {
  return (
    <section
      id={slot.id}
      className={`flex min-h-[220px] scroll-mt-24 flex-col gap-3 rounded-[18px] border border-dashed border-white/25 bg-black/55 p-6 ${
        slot.isWide ? "md:col-span-2" : ""
      }`}
    >
      <h3 className="text-lg font-bold">
        {slot.title}
        {slot.highlight && <span className="text-primary"> {slot.highlight}</span>}
      </h3>
      <p className="flex flex-1 items-center justify-center rounded-xl bg-white/[0.04] p-3 text-center text-sm text-[#9A9AAE]">
        {slot.emptyMessage}
      </p>
    </section>
  );
}
