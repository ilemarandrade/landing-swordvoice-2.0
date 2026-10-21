import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { InputController } from "@/common/components/input-controller";

type Values = { bio: string };

function MultilineHarness({ description }: { description?: string }) {
  const { control } = useForm<Values>({ defaultValues: { bio: "" } });
  return (
    <InputController
      control={control}
      name="bio"
      label="Descripción corta"
      multiline
      description={description}
    />
  );
}

describe("InputController (multiline)", () => {
  it("renders the description and links it to the textarea with aria-describedby", () => {
    render(<MultilineHarness description="Se muestra en la landing" />);

    const textarea = screen.getByLabelText("Descripción corta");
    const hint = screen.getByText("Se muestra en la landing");
    expect(hint).toHaveAttribute("id");
    expect(textarea).toHaveAttribute("aria-describedby", hint.id);
    expect(textarea).toHaveAccessibleDescription("Se muestra en la landing");
  });

  it("renders no description link when no description is given", () => {
    render(<MultilineHarness />);

    expect(screen.getByLabelText("Descripción corta")).not.toHaveAttribute(
      "aria-describedby",
    );
  });
});
