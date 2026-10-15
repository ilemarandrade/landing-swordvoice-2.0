import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="flex w-full max-w-[480px] flex-[1_1_360px] flex-col gap-6 rounded-[18px] border border-white/15 bg-[#000E2799] p-6 md:p-10">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-[15px] text-[#C9C9D6]">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
