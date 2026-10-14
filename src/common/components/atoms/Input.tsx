"use client";

import { Typography } from "@/common/components/atoms/Typography";

type InputProps = {
  label: string;
  value?: string;
  onChange?: (newValue: string) => void;
  isValid?: boolean;
};

export function Input({
  label,
  onChange,
  value = "",
  isValid = true,
}: InputProps) {
  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <Typography as="label" className="mb-3">
        {label}
      </Typography>
      <input
        value={value}
        className={`w-full p-3 rounded text-black ${
          isValid ? "" : `border-red-600 border-2`
        }`}
        onChange={onChange && ((e) => onChange(e.target.value))}
      />
    </div>
  );
}
