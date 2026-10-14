import { DashboardSlot } from "@/features/dashboard/components/dashboard-slots/dashboard-slot";
import { dashboardSlots } from "@/features/dashboard/constants/dashboardSlots";

export function DashboardSlots() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {dashboardSlots.map((slot) => (
        <DashboardSlot key={slot.id} slot={slot} />
      ))}
    </div>
  );
}
