import { describe, expect, it } from "vitest";
import {
  academyRoleSchema,
  authTokensSchema,
  userSchema,
} from "@/common/api/auth.schema";

const validUser = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Pérez",
  academyRole: "MENTOR",
  emailVerified: true,
  pathRoles: [
    { path: { id: "p1", slug: "initiated", name: "Initiated" }, role: "MENTOR" },
  ],
};

describe("authTokensSchema", () => {
  it("accepts a token pair with a positive integer expiresIn", () => {
    expect(
      authTokensSchema.parse({ accessToken: "a", refreshToken: "r", expiresIn: 900 }),
    ).toEqual({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
  });

  it.each([
    ["an empty accessToken", { accessToken: "", refreshToken: "r", expiresIn: 900 }],
    ["an empty refreshToken", { accessToken: "a", refreshToken: "", expiresIn: 900 }],
    ["a missing refreshToken", { accessToken: "a", expiresIn: 900 }],
    ["a zero expiresIn", { accessToken: "a", refreshToken: "r", expiresIn: 0 }],
    ["a fractional expiresIn", { accessToken: "a", refreshToken: "r", expiresIn: 1.5 }],
    ["a string expiresIn", { accessToken: "a", refreshToken: "r", expiresIn: "900" }],
  ])("rejects %s", (_label, values) => {
    expect(authTokensSchema.safeParse(values).success).toBe(false);
  });
});

describe("academyRoleSchema", () => {
  it.each(["ADMIN", "MENTOR", "APPRENTICE", "NEWCOMER"])("accepts %s", (role) => {
    expect(academyRoleSchema.safeParse(role).success).toBe(true);
  });

  it("rejects an unknown academy role", () => {
    expect(academyRoleSchema.safeParse("USER").success).toBe(false);
  });
});

describe("userSchema", () => {
  it.each(["ADMIN", "MENTOR", "APPRENTICE", "NEWCOMER"])(
    "accepts a user with academyRole %s",
    (academyRole) => {
      expect(userSchema.parse({ ...validUser, academyRole })).toEqual({
        ...validUser,
        academyRole,
      });
    },
  );

  it("accepts a user with path roles", () => {
    expect(userSchema.parse(validUser)).toEqual(validUser);
  });

  it("accepts a user without path roles", () => {
    expect(userSchema.safeParse({ ...validUser, pathRoles: [] }).success).toBe(true);
  });

  it.each([
    ["an unknown academyRole", { ...validUser, academyRole: "OWNER" }],
    ["a missing academyRole", { ...validUser, academyRole: undefined }],
    ["the legacy role field instead of academyRole", { ...validUser, academyRole: undefined, role: "USER" }],
    ["an unknown path role", { ...validUser, pathRoles: [{ ...validUser.pathRoles[0], role: "ADMIN" }] }],
    ["a missing emailVerified", { ...validUser, emailVerified: undefined }],
    ["a path without slug", { ...validUser, pathRoles: [{ path: { id: "p1", name: "Initiated" }, role: "MENTOR" }] }],
  ])("rejects %s", (_label, values) => {
    expect(userSchema.safeParse(values).success).toBe(false);
  });
});
