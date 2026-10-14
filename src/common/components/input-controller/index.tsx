"use client";
import type { HTMLInputTypeAttribute } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/common/components/input";
import { Textarea } from "@/common/components/textarea";

type InputControllerProps<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: string;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
};

export function InputController<TValues extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  multiline = false,
}: InputControllerProps<TValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });
  const shared = {
    ...field,
    value: field.value ?? "",
    label,
    placeholder,
    error: error?.message,
  };

  if (multiline) {
    return <Textarea {...shared} />;
  }
  return <Input {...shared} type={type} autoComplete={autoComplete} />;
}
