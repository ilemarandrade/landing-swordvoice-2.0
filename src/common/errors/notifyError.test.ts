import toast from "react-hot-toast";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { notifyError } from "@/common/errors/notifyError";

vi.mock("react-hot-toast", () => ({ default: { error: vi.fn() } }));

describe("notifyError", () => {
  it("shows the ApiError message", () => {
    notifyError(new ApiError(500, "No se pudo enviar el mensaje"));
    expect(toast.error).toHaveBeenCalledWith("No se pudo enviar el mensaje");
  });

  it("shows the generic message for unknown errors", () => {
    notifyError(new Error("internal detail"));
    expect(toast.error).toHaveBeenCalledWith("Ha ocurrido un error");
  });
});
