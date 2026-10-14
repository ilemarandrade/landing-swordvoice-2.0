import type { ReactNode } from "react";
import { LegalHeader } from "@/features/legal/components/legal-layout/legal-header";

type LegalLayoutProps = { children: ReactNode };

export function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LegalHeader />
      {children}
    </div>
  );
}
