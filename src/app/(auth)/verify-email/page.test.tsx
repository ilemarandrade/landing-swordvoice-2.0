import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../test/renderWithClient";
import { apiClient } from "@/common/api/apiClient";
import VerifyEmailRoute, { metadata } from "./page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

async function renderRoute(token: string | string[] | undefined) {
  const element = await VerifyEmailRoute({
    searchParams: Promise.resolve({ token }),
  });
  return renderWithClient(element);
}

describe("/verify-email page", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("exposes noindex and no-referrer metadata", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.referrer).toBe("no-referrer");
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["duplicated", ["a", "b"]],
  ])("shows the expired state for a %s token without calling the API", async (_label, token) => {
    await renderRoute(token);
    expect(screen.getByRole("status")).toHaveTextContent("El enlace venció o ya se usó");
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("shows the password form for a single token", async () => {
    await renderRoute("abc");
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });
});
