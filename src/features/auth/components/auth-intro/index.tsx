import type { ReactNode } from "react";

type AuthIntroProps = {
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
};

export function AuthIntro({ title, description, children }: AuthIntroProps) {
  return (
    <section className="flex max-w-[520px] flex-[1_1_380px] flex-col gap-5">
      <h1 className="font-sedgwick text-[40px] leading-tight md:text-[64px]">
        {title}
      </h1>
      <p className="text-lg leading-relaxed text-[#E6E6EE]">{description}</p>
      {children}
    </section>
  );
}
