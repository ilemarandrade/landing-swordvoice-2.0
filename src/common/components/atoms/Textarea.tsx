"use client";

import { Typography } from "@/common/components/atoms/Typography";

type TextareaProps = {
  label: string;
  onChange?: (newValue: string) => void;
  value?: string;
  isValid?: boolean;
};

export function Textarea({
  label,
  onChange,
  value = "",
  isValid = true,
}: TextareaProps) {
  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <Typography as="label" className="mb-3">
        {label}
      </Typography>
      <textarea
        value={value}
        className={`w-full p-3 rounded text-black resize-none h-[150px] ${
          isValid ? "" : `border-red-600 border-2`
        }`}
        onChange={onChange && ((e) => onChange(e.target.value))}
      />
    </div>
  );
}
