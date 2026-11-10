import { NextResponse } from "next/server";
import { sanityFetch } from "@/sanity/fetch";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { ACCESS_COOKIE, normaliseCode, sameHash, sha256Hex } from "@/lib/editions/access";
import { editionsAllowed, editionsOff } from "@/lib/editions/enabled";

/**
 * The early access link (/editions?access=CODE) and the "Have an early
 * access code?" field lead here. A code that matches a Collection's
 * fingerprint is kept (as the fingerprint) in a cookie for sixty days and
 * the visitor lands on the Shop; a code that matches none returns to the
 * field, which says so.
 */
export async function GET(request: Request) {
  if (!(await editionsAllowed("full"))) return editionsOff();
  const url = new URL(request.url);
  const shop = new URL("/editions", url.origin);
  const limit = rateLimit(`editions-access:${getClientIp(request)}`, { max: 20 });
  if (!limit.success) return NextResponse.redirect(shop, 303);

  const code = normaliseCode(url.searchParams.get("code") ?? "");
  if (code.length < 8) return NextResponse.redirect(new URL("/editions?code=wrong#early-access", url.origin), 303);
  const hash = sha256Hex(code);
  const hashes = await sanityFetch<string[] | null>({
    query: `*[_type == "editionsCollection" && defined(earlyAccessCodeHash)].earlyAccessCodeHash`,
    revalidate: 60,
  });
  const match = (hashes ?? []).some((h) => sameHash(h, hash));
  // A code that opens nothing: back to the field, which says so.
  if (!match) return NextResponse.redirect(new URL("/editions?code=wrong#early-access", url.origin), 303);
  const response = NextResponse.redirect(shop, 303);
  if (match) {
    response.cookies.set(ACCESS_COOKIE, hash, {
      httpOnly: true,
      sameSite: "lax",
      secure: url.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });
  }
  return response;
}
