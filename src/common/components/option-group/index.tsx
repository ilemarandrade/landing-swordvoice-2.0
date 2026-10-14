import { useId, type ReactNode } from "react";
import { Typography } from "@/common/components/typography";

export type OptionGroupOption = {
  value: string;
  label: string;
  description?: string;
};

type OptionGroupProps = {
  legend: ReactNode;
  name: string;
  value: string;
  options: OptionGroupOption[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  hint?: string;
  error?: string;
};

export function OptionGroup({
  legend,
  name,
  value,
  options,
  onChange,
  onBlur,
  hint,
  error,
}: OptionGroupProps) {
  const baseId = useId();
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;
  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      aria-describedby={describedBy}
      className="mb-4 flex w-full max-w-md flex-col gap-2.5"
    >
      <legend className="mb-2.5 text-sm md:text-base">{legend}</legend>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isChecked = option.value === value;
          return (
            <label
              key={option.value}
              className={`flex min-h-11 cursor-pointer flex-col gap-1.5 rounded-xl border-2 p-3.5 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-primary ${
                isChecked
                  ? "border-primary bg-primary/[0.12]"
                  : "border-white/25 bg-black/40"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isChecked}
                onChange={() => onChange(option.value)}
                onBlur={onBlur}
                className="sr-only"
              />
              <span className="font-bold">{option.label}</span>
              {option.description && (
                <span className="text-[13px] leading-snug text-[#C9C9D6]">
                  {option.description}
                </span>
              )}
            </label>
          );
        })}
      </div>
      {hint && (
        <p id={hintId} className="text-[13px] text-[#9A9AAE]">
          {hint}
        </p>
      )}
      {error && (
        <Typography
          as="span"
          variant="small"
          id={errorId}
          className="text-red-400"
        >
          {error}
        </Typography>
      )}
    </fieldset>
  );
}
