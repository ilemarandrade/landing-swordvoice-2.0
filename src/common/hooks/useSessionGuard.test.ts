import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionStatus } from "@/common/hooks/useSession";
import { useSessionGuard } from "@/common/hooks/useSessionGuard";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
const state = vi.hoisted(() => ({
  session: "unknown" as SessionStatus,
  me: { isSuccess: false, isError: false, refetch: vi.fn() },
}));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/hooks/useSession", () => ({
  useSession: () => ({ status: state.session }),
}));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => state.me }));

describe("useSessionGuard", () => {
  beforeEach(() => {
    router.replace.mockReset();
    state.session = "unknown";
    state.me = { isSuccess: false, isError: false, refetch: vi.fn() };
  });

  it("does not redirect a private route while the session is unknown (hydration)", () => {
    const { result } = renderHook(() => useSessionGuard("private"));
    expect(result.current.status).toBe("loading");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("does not redirect a private route while unknown, even if /auth/me already failed", () => {
    state.me.isError = true;
    const { result } = renderHook(() => useSessionGuard("private"));
    expect(result.current.status).not.toBe("redirecting");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("sends an anonymous visitor of a private route to the login", () => {
    state.session = "anonymous";
    const { result } = renderHook(() => useSessionGuard("private"));
    expect(result.current.status).toBe("redirecting");
    expect(router.replace).toHaveBeenCalledWith("/iniciar-sesion");
  });

  it("redirects an anonymous visitor even if /auth/me failed (redirect wins over error)", () => {
    state.session = "anonymous";
    state.me.isError = true;
    const { result } = renderHook(() => useSessionGuard("private"));
    expect(result.current.status).toBe("redirecting");
    expect(router.replace).toHaveBeenCalledWith("/iniciar-sesion");
  });

  it("waits for /auth/me on a private route", () => {
    state.session = "authenticated";
    expect(renderHook(() => useSessionGuard("private")).result.current.status).toBe("loading");
  });

  it("renders a private route once /auth/me arrives", () => {
    state.session = "authenticated";
    state.me.isSuccess = true;
    expect(renderHook(() => useSessionGuard("private")).result.current.status).toBe("ready");
  });

  it("reports an error and retries /auth/me", () => {
    state.session = "authenticated";
    state.me.isError = true;
    const { result } = renderHook(() => useSessionGuard("private"));
    expect(result.current.status).toBe("error");
    result.current.retry();
    expect(state.me.refetch).toHaveBeenCalled();
  });

  it.each(["unknown", "anonymous"] as const)(
    "renders a guest route when the session is %s",
    (session) => {
      state.session = session;
      expect(renderHook(() => useSessionGuard("guest")).result.current.status).toBe("ready");
      expect(router.replace).not.toHaveBeenCalled();
    },
  );

  it("keeps a guest route ready even when /auth/me failed", () => {
    state.session = "anonymous";
    state.me.isError = true;
    expect(renderHook(() => useSessionGuard("guest")).result.current.status).toBe("ready");
  });

  it("sends an authenticated visitor of a guest route to the dashboard", () => {
    state.session = "authenticated";
    const { result } = renderHook(() => useSessionGuard("guest"));
    expect(result.current.status).toBe("redirecting");
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });
});
