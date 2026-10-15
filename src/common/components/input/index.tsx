"use client";
import {
  useId,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { Typography } from "@/common/components/typography";

type InputProps = Omit<ComponentPropsWithRef<"input">, "className"> & {
  label: ReactNode;
  error?: string;
  description?: string;
};

export function Input({
  label,
  error,
  description,
  id,
  type,
  ...inputProps
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const describedBy =
    [description && descriptionId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <Typography as="label" htmlFor={inputId} className="mb-3">
        {label}
      </Typography>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && isPasswordVisible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full p-3 rounded text-black focus:outline-none focus:ring-[3px] focus:ring-primary ${
            isPassword ? "pr-14" : ""
          } ${error ? "border-red-600 border-2" : ""}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={
              isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#5A5A5A]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>
      {description && (
        <Typography
          as="span"
          variant="small"
          id={descriptionId}
          className="mt-1 text-[#C9C9D6]"
        >
          {description}
        </Typography>
      )}
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
