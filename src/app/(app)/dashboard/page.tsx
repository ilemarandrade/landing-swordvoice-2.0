import type { Metadata } from "next";
import { DashboardHomePage } from "@/features/dashboard";

export const metadata: Metadata = { title: "Inicio" };

export default function Page() {
  return <DashboardHomePage />;
}
