import { describe, expect, it } from "vitest";
import { readUsersAdminParams } from "@/features/admin/utils/readUsersAdminParams";

describe("readUsersAdminParams", () => {
  it("reads search, page and user", () => {
    expect(
      readUsersAdminParams({ search: " ana ", page: "2", user: "u1" }),
    ).toEqual({
      search: "ana",
      page: 2,
      userId: "u1",
    });
  });

  it.each(["abc", "0", "-3", undefined, ["2", "3"]])(
    "treats page %j as 1",
    (page) => {
      expect(readUsersAdminParams({ page }).page).toBe(1);
    },
  );

  it("defaults to no search and no open user", () => {
    expect(readUsersAdminParams({})).toEqual({
      search: "",
      page: 1,
      userId: null,
    });
  });

  it("truncates the search to 100 characters after trimming", () => {
    const search = `  ${"a".repeat(150)}  `;
    expect(readUsersAdminParams({ search }).search).toBe("a".repeat(100));
  });

  it("ignores a repeated search or user parameter", () => {
    expect(
      readUsersAdminParams({ search: ["ana", "luis"], user: ["u1", "u2"] }),
    ).toEqual({ search: "", page: 1, userId: null });
  });
});
