import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { Typography } from "@/common/components/typography";

type CheckboxProps = Omit<
  ComponentPropsWithRef<"input">,
  "className" | "type"
> & {
  label: ReactNode;
  error?: string;
};

export function Checkbox({ label, error, id, ...inputProps }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="mb-4 flex w-full max-w-md flex-col">
      <label
        htmlFor={inputId}
        className="flex min-h-11 cursor-pointer items-start gap-3 pt-2 text-sm leading-relaxed text-[#E6E6EE] md:text-[15px]"
      >
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 h-[18px] w-[18px] flex-none accent-primary"
          {...inputProps}
        />
        <span>{label}</span>
      </label>
      {error && (
        <Typography
          as="span"
          variant="small"
          id={errorId}
          className="mt-1 text-red-400"
        >
          {error}
        </Typography>
      )}
    </div>
  );
}
