import type { ReactNode } from "react";
import { LegalLayout } from "@/features/legal";

export default function LegalRouteLayout({ children }: { children: ReactNode }) {
  return <LegalLayout>{children}</LegalLayout>;
}
