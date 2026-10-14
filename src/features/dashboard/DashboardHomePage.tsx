import { DashboardSlots } from "@/features/dashboard/components/dashboard-slots";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";

export function DashboardHomePage() {
  return (
    <>
      <WelcomeBanner />
      <DashboardSlots />
    </>
  );
}
