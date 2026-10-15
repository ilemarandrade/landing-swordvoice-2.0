import type { ReactNode } from "react";
import { Navbar } from "@/common/components/navbar";

type LegalLayoutProps = { children: ReactNode };

export function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar changeLogo />
      {children}
    </div>
  );
}
