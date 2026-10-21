import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { apiClient } from "@/common/api/apiClient";
import { UsersAdmin } from "@/features/admin/components/users-admin";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/api/apiClient", () => ({ apiClient: { get: vi.fn() } }));

const ana = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Pérez",
  academyRole: "MENTOR",
  emailVerified: true,
  pathRoles: [
    {
      path: { id: "p1", slug: "initiated", name: "Initiated" },
      role: "MENTOR",
    },
  ],
};

const luis = {
  id: "u2",
  email: "luis@example.com",
  name: "Luis Gómez",
  academyRole: "NEWCOMER",
  emailVerified: false,
  pathRoles: [],
};

type Meta = { page: number; limit: number; total: number; totalPages: number };

const respond = (
  items: unknown[],
  meta: Meta = { page: 1, limit: 20, total: items.length, totalPages: 1 },
) =>
  vi.mocked(apiClient.get).mockResolvedValue({
    data: { items, meta },
  } as Awaited<ReturnType<typeof apiClient.get>>);

describe("UsersAdmin", () => {
  beforeEach(() => {
    router.replace.mockReset();
    vi.mocked(apiClient.get).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lists users with their role chips and opens one", async () => {
    respond([ana]);
    renderWithClient(
      <UsersAdmin search="" page={1} userId={null} academyRole={null} />,
    );
    expect(await screen.findByText("Initiated · Mentor")).toBeInTheDocument();
    expect(screen.getByText("Sí")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ver Ana Pérez" }));
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?user=u1",
      { scroll: false },
    );
  });

  it("shows one chip per path role and 'Sin roles' for a user without any", async () => {
    respond([
      {
        ...ana,
        pathRoles: [
          ...ana.pathRoles,
          {
            path: { id: "p2", slug: "advanced", name: "Avanzado" },
            role: "APPRENTICE",
          },
        ],
      },
      luis,
    ]);
    renderWithClient(
      <UsersAdmin search="" page={1} userId={null} academyRole={null} />,
    );

    expect(await screen.findByText("Initiated · Mentor")).toBeInTheDocument();
    expect(screen.getByText("Avanzado · Aprendiz")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Sin roles")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("shows the empty state with and without a search", async () => {
    respond([]);
    const { unmount } = renderWithClient(
      <UsersAdmin search="zzz" page={1} userId={null} academyRole={null} />,
    );
    expect(
      await screen.findByText("No encontramos usuarios con «zzz»"),
    ).toBeInTheDocument();
    unmount();

    renderWithClient(
      <UsersAdmin search="" page={1} userId={null} academyRole={null} />,
    );
    expect(
      await screen.findByText("Todavía no hay usuarios"),
    ).toBeInTheDocument();
  });

  it("shows an alert with a retry button when the list fails", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("boom"));
    renderWithClient(
      <UsersAdmin search="" page={1} userId={null} academyRole={null} />,
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("No pudimos cargar los usuarios.");
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeEnabled();
  });

  it("paginates and disables Anterior on the first page", async () => {
    respond([ana], { page: 1, limit: 20, total: 45, totalPages: 3 });
    renderWithClient(
      <UsersAdmin search="" page={1} userId={null} academyRole={null} />,
    );
    expect(await screen.findByText("Página 1 de 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?page=2",
      { scroll: false },
    );
  });

  it("disables Siguiente on the last page and goes back from it", async () => {
    respond([ana], { page: 3, limit: 20, total: 45, totalPages: 3 });
    renderWithClient(
      <UsersAdmin search="" page={3} userId={null} academyRole={null} />,
    );
    expect(await screen.findByText("Página 3 de 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "Anterior" }));
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?page=2",
      { scroll: false },
    );
  });

  it("enables both pagination buttons on a middle page", async () => {
    respond([ana], { page: 2, limit: 20, total: 45, totalPages: 3 });
    renderWithClient(
      <UsersAdmin search="" page={2} userId={null} academyRole={null} />,
    );
    expect(await screen.findByText("Página 2 de 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled();
  });

  it("hides pagination when there is a single page", async () => {
    respond([ana]);
    renderWithClient(
      <UsersAdmin search="" page={1} userId={null} academyRole={null} />,
    );
    expect(await screen.findByText("Initiated · Mentor")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Paginación" }),
    ).not.toBeInTheDocument();
  });

  it("navigates once, 300 ms after the last keystroke, back to page 1", async () => {
    respond([ana]);
    vi.useFakeTimers();
    renderWithClient(
      <UsersAdmin search="" page={4} userId={null} academyRole={null} />,
    );
    const field = screen.getByLabelText("Buscar por nombre o correo");
    fireEvent.change(field, { target: { value: "a" } });
    fireEvent.change(field, { target: { value: "an" } });
    fireEvent.change(field, { target: { value: "ana" } });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(router.replace).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?search=ana",
      { scroll: false },
    );
  });

  it("sends the selected academyRole to the list request", async () => {
    respond([ana]);
    renderWithClient(
      <UsersAdmin search="" page={1} userId={null} academyRole="MENTOR" />,
    );
    expect(await screen.findByText("Initiated · Mentor")).toBeInTheDocument();
    expect(apiClient.get).toHaveBeenCalledWith("/users", {
      params: { page: 1, limit: 20, academyRole: "MENTOR" },
    });
    expect(screen.getByRole("button", { name: "Mentor" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("changing the role filter navigates to that role and resets the page", async () => {
    respond([ana]);
    renderWithClient(
      <UsersAdmin search="ana" page={3} userId={null} academyRole={null} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Mentor" }));
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?search=ana&academyRole=MENTOR",
      { scroll: false },
    );
  });

  it("shows the role-filter message when the selected role has no users", async () => {
    respond([]);
    renderWithClient(
      <UsersAdmin search="" page={1} userId={null} academyRole="ADMIN" />,
    );
    expect(
      await screen.findByText("No hay usuarios que coincidan con los filtros."),
    ).toBeInTheDocument();
  });
});
