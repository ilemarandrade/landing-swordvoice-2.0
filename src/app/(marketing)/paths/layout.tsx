import type { ReactNode } from "react";
import { Navbar } from "@/common/components/navbar";

export default function PathsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-black pt-[85px] text-white">
      <Navbar changeLogo />
      {children}
    </div>
  );
}
