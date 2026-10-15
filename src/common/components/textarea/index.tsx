import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { Typography } from "@/common/components/typography";

type TextareaProps = Omit<ComponentPropsWithRef<"textarea">, "className"> & {
  label: ReactNode;
  error?: string;
};

export function Textarea({
  label,
  error,
  id,
  ...textareaProps
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <Typography as="label" htmlFor={textareaId} className="mb-3">
        {label}
      </Typography>
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full p-3 rounded text-black resize-none h-[150px] ${
          error ? "border-red-600 border-2" : ""
        }`}
        {...textareaProps}
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
