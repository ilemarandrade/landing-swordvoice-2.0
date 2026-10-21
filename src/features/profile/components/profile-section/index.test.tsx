import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileSection } from "@/features/profile/components/profile-section";

const state = vi.hoisted(() => ({
  profile: { data: undefined as unknown, isError: false, refetch: vi.fn() },
  me: { data: undefined as unknown },
}));

vi.mock("@/common/hooks/useProfileQuery", () => ({ useProfileQuery: () => state.profile }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => state.me }));
vi.mock("@/features/profile/components/profile-section/profile-photo", () => ({
  ProfilePhoto: () => <div>foto</div>,
}));
vi.mock("@/features/profile/components/profile-section/profile-form", () => ({
  ProfileForm: ({ isMentor, email }: { isMentor: boolean; email: string }) => (
    <div>{`form ${email} mentor=${String(isMentor)}`}</div>
  ),
}));

const me = (role: "MENTOR" | "APPRENTICE") => ({
  email: "ana@example.com",
  pathRoles: [{ path: { id: "p1", slug: "initiated", name: "Initiated" }, role }],
});

describe("ProfileSection", () => {
  beforeEach(() => {
    state.profile = { data: undefined, isError: false, refetch: vi.fn() };
    state.me = { data: undefined };
  });

  it("shows a loading status until profile and user arrive", () => {
    render(<ProfileSection />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando tu perfil…");
  });

  it("keeps loading while the profile is there but the user is not", () => {
    state.profile.data = { name: "Ana" };
    render(<ProfileSection />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando tu perfil…");
    expect(screen.queryByText(/^form /)).not.toBeInTheDocument();
  });

  it("offers a retry when the profile fails", async () => {
    state.profile.isError = true;
    render(<ProfileSection />);
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar tu perfil.");
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(state.profile.refetch).toHaveBeenCalled();
  });

  it.each([
    ["MENTOR", "true"],
    ["APPRENTICE", "false"],
  ] as const)("passes isMentor for a %s", (role, expected) => {
    state.profile.data = { name: "Ana" };
    state.me.data = me(role);
    render(<ProfileSection />);
    expect(screen.getByText(`form ana@example.com mentor=${expected}`)).toBeInTheDocument();
  });

  it("renders the title as an h2, because the dashboard header owns the h1", () => {
    state.profile.data = { name: "Ana" };
    state.me.data = me("APPRENTICE");
    render(<ProfileSection />);
    expect(screen.getByRole("heading", { level: 2, name: "Mi perfil" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("renders the photo and the form side by side once loaded", () => {
    state.profile.data = { name: "Ana" };
    state.me.data = me("APPRENTICE");
    render(<ProfileSection />);
    expect(screen.getByText("foto")).toBeInTheDocument();
    expect(screen.getByText("form ana@example.com mentor=false")).toBeInTheDocument();
  });
});
