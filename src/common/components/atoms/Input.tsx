import { useId, type ComponentPropsWithRef } from "react";
import { Typography } from "@/common/components/atoms/Typography";

type InputProps = Omit<ComponentPropsWithRef<"input">, "className"> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, ...inputProps }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <Typography as="label" htmlFor={inputId} className="mb-3">
        {label}
      </Typography>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full p-3 rounded text-black ${
          error ? "border-red-600 border-2" : ""
        }`}
        {...inputProps}
      />
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
