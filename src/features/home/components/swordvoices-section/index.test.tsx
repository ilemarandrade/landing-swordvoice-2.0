import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SwordvoicesSection } from "@/features/home/components/swordvoices-section";
import { useMentorsQuery } from "@/features/home/hooks/useMentorsQuery";
import type { Mentor } from "@/features/home/schemas/mentor.schema";

vi.mock("@/features/home/hooks/useMentorsQuery", () => ({
  useMentorsQuery: vi.fn(),
}));

vi.mock("@/features/home/hooks/useSlidesToShow", () => ({
  useSlidesToShow: () => ({ slidesToShow: 4 }),
}));

type MentorsQueryResult = ReturnType<typeof useMentorsQuery>;

function mockQuery(partial: Partial<MentorsQueryResult>) {
  vi.mocked(useMentorsQuery).mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...partial,
  } as unknown as MentorsQueryResult);
}

const mentorWithoutLinks: Mentor = {
  id: "mentor-1",
  name: "Ana Pérez",
  yearsOfExperience: 0,
  professionalTitle: "Ingeniera de software senior",
  shortDescription: "Backend y arquitectura",
  bio: "Trabajo desde hace siete años en sistemas distribuidos.",
  photoUrl: "https://media.swordvoice.com/mentors/ana.png",
  linkedinUrl: null,
  githubUrl: null,
  portfolioUrl: null,
};

describe("SwordvoicesSection", () => {
  beforeEach(() => {
    // jsdom no implementa IntersectionObserver; framer-motion lo necesita para whileInView.
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra el skeleton con role status mientras carga", () => {
    mockQuery({ isPending: true, data: undefined });

    render(<SwordvoicesSection />);

    expect(
      screen.getByRole("status", { name: "Cargando mentores" }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(
      screen.getByRole("heading", { name: "Nuestras Swordvoices" }),
    ).toBeInTheDocument();
  });

  it("muestra el mensaje de error y llama a refetch al pulsar Reintentar", async () => {
    const refetch = vi.fn();
    mockQuery({ isError: true, isPending: false, data: undefined, refetch });
    const user = userEvent.setup();

    render(<SwordvoicesSection />);

    expect(
      screen.getByText("No pudimos cargar a los mentores."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Nuestras Swordvoices" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("no renderiza nada cuando la lista de mentores está vacía", () => {
    mockQuery({ data: [] });

    const { container } = render(<SwordvoicesSection />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("heading", { name: "Nuestras Swordvoices" }),
    ).not.toBeInTheDocument();
  });

  it("muestra una sola card y ningún enlace cuando todos los enlaces del mentor son null", () => {
    mockQuery({ data: [mentorWithoutLinks] });

    render(<SwordvoicesSection />);

    // Con un solo mentor y 4 huecos no se clona ni se duplica la card.
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(
      screen.getByText("Ingeniera de software senior"),
    ).toBeInTheDocument();
    expect(screen.getByText("Backend y arquitectura")).toBeInTheDocument();
    expect(
      screen.getByText("Menos de un año de experiencia"),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("muestra el enlace de LinkedIn cuando el mentor tiene linkedinUrl", () => {
    mockQuery({
      data: [
        {
          ...mentorWithoutLinks,
          linkedinUrl: "https://www.linkedin.com/in/ana-perez",
        },
      ],
    });

    render(<SwordvoicesSection />);

    expect(
      screen.getByRole("link", { name: "LinkedIn de Ana Pérez" }),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/ana-perez");
  });
});
