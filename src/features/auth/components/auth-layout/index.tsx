import type { ReactNode } from "react";
import { AuthBottomBar } from "@/features/auth/components/auth-layout/auth-bottom-bar";
import { AuthHeader } from "@/features/auth/components/auth-layout/auth-header";

type AuthLayoutProps = { children: ReactNode };

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-home bg-cover bg-bottom text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-black/[0.55]" />
      <AuthHeader />
      <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-wrap items-center justify-between gap-12 px-4 py-8 md:px-12 md:py-20">
        {children}
      </main>
      <AuthBottomBar />
    </div>
  );
}
