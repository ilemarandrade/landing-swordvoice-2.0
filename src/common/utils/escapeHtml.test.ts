import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/common/utils/escapeHtml";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;",
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Hola, Juan")).toBe("Hola, Juan");
  });
});
