import type { ReactNode } from "react";
import { Navbar } from "@/common/components/navbar";
import { AuthBottomBar } from "@/features/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-home bg-cover bg-bottom pt-[85px] text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-black/[0.55]" />
      <Navbar changeLogo />
      <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-wrap items-center justify-between gap-12 px-4 py-8 md:px-12 md:py-20">
        {children}
      </main>
      <AuthBottomBar />
    </div>
  );
}
