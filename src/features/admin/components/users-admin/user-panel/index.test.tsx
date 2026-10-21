import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { UserPanel } from "@/features/admin/components/users-admin/user-panel";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const initiated = { id: "p1", slug: "initiated", name: "Initiated" };
const wanderer = { id: "p2", slug: "wanderer", name: "Wanderer" };
const user = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Pérez",
  academyRole: "APPRENTICE",
  emailVerified: true,
  pathRoles: [{ path: initiated, role: "APPRENTICE" }],
};
const paths = {
  items: [
    { ...initiated, description: null, currentVersion: 1 },
    { ...wanderer, description: null, currentVersion: 1 },
  ],
  meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
};
const ok = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;
const mentorUser = { ...user, pathRoles: [{ path: initiated, role: "MENTOR" }] };

function mockGets(userResponse: Promise<unknown>) {
  vi.mocked(apiClient.get).mockImplementation((url: string) =>
    (url === "/paths" ? Promise.resolve(ok(paths)) : userResponse) as ReturnType<typeof apiClient.get>,
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("UserPanel", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.put).mockReset();
    vi.mocked(apiClient.delete).mockReset();
  });

  it("is a dialog that focuses Cerrar and closes with Escape", async () => {
    mockGets(Promise.resolve(ok(user)));
    const onClose = vi.fn();
    renderWithClient(<UserPanel userId="u1" onClose={onClose} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("marks the current role per path", async () => {
    mockGets(Promise.resolve(ok(user)));
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const initiatedGroup = await screen.findByRole("group", { name: "Rol en Initiated" });
    expect(initiatedGroup.querySelector('[aria-pressed="true"]')).toHaveTextContent("Aprendiz");
    const wandererGroup = screen.getByRole("group", { name: "Rol en Wanderer" });
    expect(wandererGroup.querySelector('[aria-pressed="true"]')).toHaveTextContent("Sin rol");
  });

  it("assigns Mentor with PUT and removes with DELETE", async () => {
    mockGets(Promise.resolve(ok(user)));
    vi.mocked(apiClient.put).mockResolvedValue(ok({ ...user, pathRoles: [{ path: initiated, role: "MENTOR" }] }));
    vi.mocked(apiClient.delete).mockResolvedValue(ok({ ...user, pathRoles: [] }));
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const group = await screen.findByRole("group", { name: "Rol en Initiated" });

    await userEvent.click(group.querySelector("button:nth-child(3)") as HTMLElement);
    await waitFor(() =>
      expect(apiClient.put).toHaveBeenCalledWith("/users/u1/path-roles/p1", { role: "MENTOR" }),
    );
    await waitFor(() =>
      expect(group.querySelector('[aria-pressed="true"]')).toHaveTextContent("Mentor"),
    );

    await userEvent.click(group.querySelector("button:nth-child(1)") as HTMLElement);
    await waitFor(() => expect(apiClient.delete).toHaveBeenCalledWith("/users/u1/path-roles/p1"));
  });

  it("does nothing when the current role is clicked again", async () => {
    mockGets(Promise.resolve(ok(user)));
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const group = await screen.findByRole("group", { name: "Rol en Initiated" });
    await userEvent.click(group.querySelector('[aria-pressed="true"]') as HTMLElement);
    expect(apiClient.put).not.toHaveBeenCalled();
    expect(apiClient.delete).not.toHaveBeenCalled();
  });

  it("explains that the user no longer exists", async () => {
    mockGets(Promise.reject(new ApiError(404, "x", "USER_NOT_FOUND")));
    renderWithClient(<UserPanel userId="u9" onClose={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Este usuario ya no existe.");
  });

  it("keeps a Cerrar button on the 404 state that closes the panel", async () => {
    mockGets(Promise.reject(new ApiError(404, "x", "USER_NOT_FOUND")));
    const onClose = vi.fn();
    renderWithClient(<UserPanel userId="u9" onClose={onClose} />);
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("offers Reintentar on a generic error and refetches the user", async () => {
    mockGets(Promise.reject(new ApiError(500, "x")));
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos cargar este usuario.");
    const userCalls = () =>
      vi.mocked(apiClient.get).mock.calls.filter(([url]) => url === "/users/u1").length;
    const before = userCalls();
    mockGets(Promise.resolve(ok(user)));
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(userCalls()).toBeGreaterThan(before));
    expect(await screen.findByRole("group", { name: "Rol en Initiated" })).toBeInTheDocument();
  });

  it("is labelled by the user's name and shows the account details", async () => {
    mockGets(Promise.resolve(ok({ ...user, academyRole: "ADMIN" })));
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const dialog = await screen.findByRole("dialog", { name: "Ana Pérez" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByText("ana@example.com")).toBeInTheDocument();
    expect(within(dialog).getByText("Sí")).toBeInTheDocument();
    const roleTerm = within(dialog).getByText("Rol", { selector: "dt" });
    expect(roleTerm.nextElementSibling).toHaveTextContent("Admin");
  });

  it("shows the academyRole label under 'Rol' for a non-admin user", async () => {
    mockGets(Promise.resolve(ok({ ...user, academyRole: "MENTOR" })));
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const dialog = await screen.findByRole("dialog", { name: "Ana Pérez" });
    const roleTerm = within(dialog).getByText("Rol", { selector: "dt" });
    expect(roleTerm.nextElementSibling).toHaveTextContent("Mentor");
  });

  it("closes when the overlay is clicked", async () => {
    mockGets(Promise.resolve(ok(user)));
    const onClose = vi.fn();
    renderWithClient(<UserPanel userId="u1" onClose={onClose} />);
    const dialog = await screen.findByRole("dialog", { name: "Ana Pérez" });
    // El overlay es el hermano anterior del <aside> y está aria-hidden.
    await userEvent.click(dialog.previousElementSibling as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not move focus back to Cerrar when the parent re-renders with a new onClose", async () => {
    mockGets(Promise.resolve(ok(user)));
    vi.mocked(apiClient.put).mockResolvedValue(ok(mentorUser));
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { rerender } = render(<UserPanel userId="u1" onClose={vi.fn()} />, { wrapper });
    const group = await screen.findByRole("group", { name: "Rol en Initiated" });
    const mentor = within(group).getByRole("button", { name: "Mentor" });

    await userEvent.click(mentor);
    await waitFor(() => expect(apiClient.put).toHaveBeenCalled());
    await waitFor(() => expect(mentor).toHaveAttribute("aria-pressed", "true"));

    rerender(<UserPanel userId="u1" onClose={vi.fn()} />);
    const closeButton = screen.getByRole("button", { name: "Cerrar" });
    expect(closeButton).not.toHaveFocus();
    expect(document.activeElement).not.toBe(closeButton);
  });

  it("disables the buttons of a path while its role is being saved", async () => {
    mockGets(Promise.resolve(ok(user)));
    const pending = deferred<ReturnType<typeof ok>>();
    vi.mocked(apiClient.put).mockReturnValue(pending.promise as ReturnType<typeof apiClient.put>);
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const group = await screen.findByRole("group", { name: "Rol en Initiated" });
    const other = screen.getByRole("group", { name: "Rol en Wanderer" });

    await userEvent.click(within(group).getByRole("button", { name: "Mentor" }));

    await waitFor(() => expect(within(group).getByRole("button", { name: "Mentor" })).toBeDisabled());
    expect(within(group).getByRole("button", { name: "Sin rol" })).toBeDisabled();
    expect(within(group).getByRole("button", { name: "Aprendiz" })).toBeDisabled();
    expect(within(other).getByRole("button", { name: "Mentor" })).toBeEnabled();

    pending.resolve(ok(mentorUser));
    await waitFor(() => expect(within(group).getByRole("button", { name: "Sin rol" })).toBeEnabled());
  });

  it("shows the error toast and keeps the previous role when the server refuses (FORBIDDEN)", async () => {
    mockGets(Promise.resolve(ok(user)));
    const forbidden = new ApiError(403, "Sin permisos", "FORBIDDEN");
    vi.mocked(apiClient.put).mockRejectedValue(forbidden);
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const group = await screen.findByRole("group", { name: "Rol en Initiated" });

    await userEvent.click(within(group).getByRole("button", { name: "Mentor" }));

    await waitFor(() => expect(notifyError).toHaveBeenCalledWith(forbidden));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Aprendiz" })).toHaveAttribute("aria-pressed", "true");
  });

  it("treats PATH_ROLE_NOT_FOUND on DELETE as a refresh, not an error", async () => {
    mockGets(Promise.resolve(ok(user)));
    vi.mocked(apiClient.delete).mockRejectedValue(new ApiError(404, "x", "PATH_ROLE_NOT_FOUND"));
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const group = await screen.findByRole("group", { name: "Rol en Initiated" });
    const userCalls = () =>
      vi.mocked(apiClient.get).mock.calls.filter(([url]) => url === "/users/u1").length;
    const before = userCalls();

    await userEvent.click(within(group).getByRole("button", { name: "Sin rol" }));

    await waitFor(() => expect(apiClient.delete).toHaveBeenCalledWith("/users/u1/path-roles/p1"));
    await waitFor(() => expect(userCalls()).toBeGreaterThan(before));
    expect(notifyError).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
