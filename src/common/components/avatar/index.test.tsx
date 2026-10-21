import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/common/components/avatar";

describe("Avatar", () => {
  it("shows the photo when there is one", () => {
    const photoUrl = "https://media.swordvoice.com/p.png";
    render(<Avatar name="Ana Pérez" photoUrl={photoUrl} size={44} />);
    // next/image reescribe src a /_next/image?url=… fuera de next.config (que usa unoptimized
    // en producción), así que comprobamos que la URL de la foto llega a next/image.
    const img = screen.getByRole("img", { name: "Foto de Ana Pérez" });
    expect(img.getAttribute("src")).toContain(encodeURIComponent(photoUrl));
  });

  it("shows the initials without a photo", () => {
    render(<Avatar name="Ana Pérez" photoUrl={null} size={44} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("AP")).toBeInTheDocument();
  });
});
