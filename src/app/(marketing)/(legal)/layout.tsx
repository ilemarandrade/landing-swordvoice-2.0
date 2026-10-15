import type { ReactNode } from "react";
import { Navbar } from "@/common/components/navbar";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar changeLogo />
      {children}
    </div>
  );
}
