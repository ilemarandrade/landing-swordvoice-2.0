"use client";
import type { HTMLInputTypeAttribute, ReactNode } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Checkbox } from "@/common/components/checkbox";
import { Input } from "@/common/components/input";
import {
  OptionGroup,
  type OptionGroupOption,
} from "@/common/components/option-group";
import { Textarea } from "@/common/components/textarea";

type InputControllerProps<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: ReactNode;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
  description?: string;
  options?: OptionGroupOption[];
};

export function InputController<TValues extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  multiline = false,
  description,
  options,
}: InputControllerProps<TValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });
  const errorMessage = error?.message;

  if (options) {
    return (
      <OptionGroup
        legend={label}
        name={field.name}
        value={field.value ?? ""}
        options={options}
        onChange={field.onChange}
        onBlur={field.onBlur}
        hint={description}
        error={errorMessage}
      />
    );
  }

  if (type === "checkbox") {
    return (
      <Checkbox
        ref={field.ref}
        name={field.name}
        checked={field.value === true}
        onChange={(event) => field.onChange(event.target.checked)}
        onBlur={field.onBlur}
        label={label}
        error={errorMessage}
      />
    );
  }

  const shared = {
    ...field,
    value: field.value ?? "",
    label,
    placeholder,
    error: errorMessage,
  };

  if (multiline) {
    return <Textarea {...shared} description={description} />;
  }
  return (
    <Input
      {...shared}
      type={type}
      autoComplete={autoComplete}
      description={description}
    />
  );
}
