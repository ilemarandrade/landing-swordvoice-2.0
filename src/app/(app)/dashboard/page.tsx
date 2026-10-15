import type { Metadata } from "next";
import { DashboardSlots, WelcomeBanner } from "@/features/dashboard";

export const metadata: Metadata = { title: "Inicio" };

export default function DashboardPage() {
  return (
    <>
      <WelcomeBanner />
      <DashboardSlots />
    </>
  );
}
