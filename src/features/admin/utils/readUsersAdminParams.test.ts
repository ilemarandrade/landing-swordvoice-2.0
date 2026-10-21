import { describe, expect, it } from "vitest";
import { readUsersAdminParams } from "@/features/admin/utils/readUsersAdminParams";

describe("readUsersAdminParams", () => {
  it("reads search, page, user and academyRole", () => {
    expect(
      readUsersAdminParams({
        search: " ana ",
        page: "2",
        user: "u1",
        academyRole: "MENTOR",
      }),
    ).toEqual({
      search: "ana",
      page: 2,
      userId: "u1",
      academyRole: "MENTOR",
    });
  });

  it.each(["ADMIN", "MENTOR", "APPRENTICE", "NEWCOMER"] as const)(
    "accepts the academyRole %s",
    (academyRole) => {
      expect(readUsersAdminParams({ academyRole }).academyRole).toBe(academyRole);
    },
  );

  it.each(["mentor", "SUPERUSER", "", undefined, ["MENTOR", "ADMIN"]])(
    "treats academyRole %j as no filter",
    (academyRole) => {
      expect(readUsersAdminParams({ academyRole }).academyRole).toBeNull();
    },
  );

  it.each(["abc", "0", "-3", undefined, ["2", "3"]])(
    "treats page %j as 1",
    (page) => {
      expect(readUsersAdminParams({ page }).page).toBe(1);
    },
  );

  it("defaults to no search, no open user and no role filter", () => {
    expect(readUsersAdminParams({})).toEqual({
      search: "",
      page: 1,
      userId: null,
      academyRole: null,
    });
  });

  it("truncates the search to 100 characters after trimming", () => {
    const search = `  ${"a".repeat(150)}  `;
    expect(readUsersAdminParams({ search }).search).toBe("a".repeat(100));
  });

  it("ignores a repeated search, user or academyRole parameter", () => {
    expect(
      readUsersAdminParams({
        search: ["ana", "luis"],
        user: ["u1", "u2"],
        academyRole: ["MENTOR", "ADMIN"],
      }),
    ).toEqual({ search: "", page: 1, userId: null, academyRole: null });
  });
});
