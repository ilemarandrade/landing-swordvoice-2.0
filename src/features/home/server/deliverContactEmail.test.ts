// @vitest-environment node
import nodemailer from "nodemailer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildContactEmailHtml,
  CONTACT_EMAIL_SUBJECT,
  deliverContactEmail,
} from "@/features/home/server/deliverContactEmail";

vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn() } }));

const values = { name: "Ana", email: "ana@mail.com", message: "Hola" };
const sendMail = vi.fn();

beforeEach(() => {
  vi.stubEnv("EMAIL_TO_SEND_EMAIL", "bot@swordvoice.com");
  vi.stubEnv("PASSWORD_TO_SEND_EMAIL", "pw");
  vi.stubEnv("EMAILS_MENTORS", "mentors@swordvoice.com");
  sendMail.mockReset();
  vi.mocked(nodemailer.createTransport).mockReturnValue({
    sendMail,
  } as unknown as ReturnType<typeof nodemailer.createTransport>);
});

describe("buildContactEmailHtml", () => {
  it("escapes user input", () => {
    const html = buildContactEmailHtml({
      name: "<b>Ana</b>",
      email: "ana@mail.com",
      message: "<script>alert(1)</script>",
    });
    expect(html).toContain("&lt;b&gt;Ana&lt;/b&gt;");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });
});

describe("deliverContactEmail", () => {
  it("sends the email to the mentors", async () => {
    sendMail.mockResolvedValue({});
    await deliverContactEmail(values);
    expect(sendMail).toHaveBeenCalledWith({
      from: { name: "Ana", address: "ana@mail.com" },
      to: "mentors@swordvoice.com",
      subject: CONTACT_EMAIL_SUBJECT,
      html: buildContactEmailHtml(values),
    });
  });

  it("propagates SMTP failures", async () => {
    sendMail.mockRejectedValue(new Error("SMTP down"));
    await expect(deliverContactEmail(values)).rejects.toThrow("SMTP down");
  });

  it("fails when env is missing", async () => {
    vi.stubEnv("EMAILS_MENTORS", "");
    await expect(deliverContactEmail(values)).rejects.toThrow(/EMAILS_MENTORS/);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
