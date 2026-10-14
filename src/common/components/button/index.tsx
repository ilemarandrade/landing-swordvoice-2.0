import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & { label: string };

export function Button({ label, ...buttonProps }: ButtonProps) {
  return (
    <button
      className="w-max px-8 mt-4 py-2 rounded-full bg-black font-bold text-base text-primary border-2 border-white"
      {...buttonProps}
    >
      {label}
    </button>
  );
}
