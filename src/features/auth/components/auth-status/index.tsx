import type { ReactNode } from "react";

type AuthStatusProps = {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
};

export function AuthStatus({ icon, title, description, children }: AuthStatusProps) {
  return (
    <div className="flex w-full flex-col items-center gap-7 text-center">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-primary text-primary">
        {icon}
      </div>
      <h1 className="font-sedgwick text-[40px] leading-tight md:text-[56px]">{title}</h1>
      <p role="status" className="text-[17px] leading-relaxed text-[#E6E6EE]">
        {description}
      </p>
      {children && (
        <div className="flex w-full flex-col items-center gap-3.5">{children}</div>
      )}
    </div>
  );
}
