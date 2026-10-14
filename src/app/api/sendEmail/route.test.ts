// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deliverContactEmail } from "@/features/home/server";
import { POST } from "@/app/api/sendEmail/route";

vi.mock("@/features/home/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/home/server")>()),
  deliverContactEmail: vi.fn(),
}));

const valid = { name: "Ana", email: "ana@mail.com", message: "Hola" };

function post(body: string) {
  return POST(
    new Request("http://localhost/api/sendEmail", { method: "POST", body }),
  );
}

beforeEach(() => {
  vi.mocked(deliverContactEmail).mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/sendEmail", () => {
  it("returns 400 for a non-JSON body", async () => {
    const res = await post("not json");
    expect(res.status).toBe(400);
    expect(deliverContactEmail).not.toHaveBeenCalled();
  });

  it("returns 400 for missing fields", async () => {
    const res = await post(JSON.stringify({ name: "Ana" }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "Datos inválidos" });
    expect(deliverContactEmail).not.toHaveBeenCalled();
  });

  it("returns 400 for an oversized message", async () => {
    const res = await post(
      JSON.stringify({ ...valid, message: "a".repeat(10_000) }),
    );
    expect(res.status).toBe(400);
    expect(deliverContactEmail).not.toHaveBeenCalled();
  });

  it("delivers trimmed data and returns 200", async () => {
    vi.mocked(deliverContactEmail).mockResolvedValue();
    const res = await post(JSON.stringify({ ...valid, name: " Ana " }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(deliverContactEmail).toHaveBeenCalledWith(valid);
  });

  it("returns a generic 500 when delivery fails", async () => {
    vi.mocked(deliverContactEmail).mockRejectedValue(
      new Error("SMTP password wrong"),
    );
    const res = await post(JSON.stringify(valid));
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      message: "No se pudo enviar el mensaje",
    });
  });
});
