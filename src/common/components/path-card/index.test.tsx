import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PathCard } from "@/common/components/path-card";

function FakeIcon({ width }: { width?: number }) {
  return <span data-testid="icon" data-width={width} />;
}

const props = {
  Icon: FakeIcon,
  name: "Fundamentos",
  description: "Aprende las bases de la voz y la respiración.",
  href: "/paths/fundamentos",
};

describe("PathCard", () => {
  it("renders the name as an h3 heading and the description", () => {
    render(<PathCard {...props} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Fundamentos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aprende las bases de la voz y la respiración."),
    ).toBeInTheDocument();
  });

  it("links to href with the default 'Ver' label", () => {
    render(<PathCard {...props} />);

    const link = screen.getByRole("link", { name: "Ver" });
    expect(link).toHaveAttribute("href", "/paths/fundamentos");
  });

  it("uses the ctaLabel when provided", () => {
    render(<PathCard {...props} ctaLabel="Empezar" />);

    const link = screen.getByRole("link", { name: "Empezar" });
    expect(link).toHaveAttribute("href", "/paths/fundamentos");
    expect(
      screen.queryByRole("link", { name: "Ver" }),
    ).not.toBeInTheDocument();
  });

  it("renders the received Icon with width 85", () => {
    render(<PathCard {...props} />);

    expect(screen.getByTestId("icon")).toHaveAttribute("data-width", "85");
  });

  it("hides the decorative sword rule from assistive technology", () => {
    const { container } = render(<PathCard {...props} />);

    const rule = container.querySelector('article > div[aria-hidden="true"]');
    expect(rule).not.toBeNull();
    expect(rule).toHaveAttribute("aria-hidden", "true");
  });
});
