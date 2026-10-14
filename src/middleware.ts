import { NextResponse } from "next/server";

// Legacy spam pages (e.g. /ai-vocal-remover-5.html) that were never part of
// this site. 410 tells crawlers they are gone for good so they get deindexed.
export function middleware() {
  return new NextResponse("Gone", {
    status: 410,
    headers: { "X-Robots-Tag": "noindex" },
  });
}

export const config = {
  matcher: ["/:path*.html", "/:path*.php"],
};
