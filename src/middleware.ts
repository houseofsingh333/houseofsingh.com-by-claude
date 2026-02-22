import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPa = pathname === "/pa" || pathname.startsWith("/pa/");
  const lang = isPa ? "pa" : "en";

  // Redirect homepage to /pa only when lang cookie is already "pa"
  if (pathname === "/" && req.cookies.get("lang")?.value === "pa") {
    return NextResponse.redirect(new URL("/pa", req.url));
  }

  const res = NextResponse.next();

  // Persist language preference in a cookie (1 year)
  res.cookies.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // Surface lang as a response header so the root layout can read it
  // server-side without a client round-trip
  res.headers.set("x-lang", lang);

  return res;
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals, API routes, Studio, and static assets
    "/((?!_next|api|studio-sanity|images|fonts|favicon\\.ico).*)",
  ],
};
