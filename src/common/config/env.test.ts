import { describe, expect, it } from "vitest";
import { getServerEnv } from "@/common/config/env";

const valid = {
  EMAIL_TO_SEND_EMAIL: "bot@swordvoice.com",
  PASSWORD_TO_SEND_EMAIL: "s3cret-value",
  EMAILS_MENTORS: "a@swordvoice.com,b@swordvoice.com",
};

describe("getServerEnv", () => {
  it("returns the validated variables", () => {
    expect(getServerEnv(valid)).toEqual(valid);
  });

  it("names missing keys without leaking values", () => {
    const run = () =>
      getServerEnv({
        ...valid,
        EMAILS_MENTORS: undefined,
        EMAIL_TO_SEND_EMAIL: "x",
      });

    expect(run).toThrow(/EMAIL_TO_SEND_EMAIL, EMAILS_MENTORS/);
    expect(run).not.toThrow(/s3cret-value/);
  });
});
