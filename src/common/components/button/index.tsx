import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = Omit<ComponentPropsWithoutRef<"button">, "className"> & {
  label: string;
  fullWidth?: boolean;
  className?: string;
};

export function buttonClassName(fullWidth = false) {
  return `${
    fullWidth ? "w-full" : "w-max"
  } inline-flex min-h-11 items-center justify-center rounded-full border-2 border-white bg-black px-8 py-2 text-base font-bold text-primary no-underline transition-colors hover:bg-primary hover:text-black disabled:cursor-not-allowed disabled:opacity-60`;
}

export function Button({
  label,
  fullWidth,
  className,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      className={`${buttonClassName(fullWidth)} ${className ?? ""}`}
      {...buttonProps}
    >
      {label}
    </button>
  );
}
