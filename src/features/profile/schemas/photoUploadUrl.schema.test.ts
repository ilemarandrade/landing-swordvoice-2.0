import { describe, expect, it } from "vitest";
import { photoUploadUrlSchema } from "@/features/profile/schemas/photoUploadUrl.schema";

const valid = {
  uploadUrl: "https://r2.example.com/profiles/u/p.webp?X-Amz-Signature=abc",
  key: "profiles/u/p.webp",
  expiresIn: 300,
};

describe("photoUploadUrlSchema", () => {
  it("accepts a complete upload-url response", () => {
    expect(photoUploadUrlSchema.parse(valid)).toEqual(valid);
  });

  it("rejects an uploadUrl that is not a URL", () => {
    expect(
      photoUploadUrlSchema.safeParse({ ...valid, uploadUrl: "no es una url" })
        .success,
    ).toBe(false);
  });

  it("rejects an empty key", () => {
    expect(photoUploadUrlSchema.safeParse({ ...valid, key: "" }).success).toBe(
      false,
    );
  });

  it("rejects a response without expiresIn", () => {
    const withoutExpiry: Partial<typeof valid> = { ...valid };
    delete withoutExpiry.expiresIn;
    expect(photoUploadUrlSchema.safeParse(withoutExpiry).success).toBe(false);
  });

  it("rejects a non-numeric expiresIn", () => {
    expect(
      photoUploadUrlSchema.safeParse({ ...valid, expiresIn: "300" }).success,
    ).toBe(false);
  });
});
