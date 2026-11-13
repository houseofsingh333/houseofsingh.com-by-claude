import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sameHash, sha256Hex } from "@/lib/editions/access";
import { editionsOff, PREVIEW_COOKIE, previewAllowed, previewFingerprint, siteMode } from "@/lib/editions/enabled";

/**
 * The secret preview: /editions?preview=EDITIONS_PREVIEW_SECRET leads here
 * and sets a cookie (a fingerprint of the secret, never the secret) that
 * shows this browser the full Shop while the site is in anticipation.
 * /editions?preview=off removes it. A wrong secret changes nothing.
 * On Production the cookie is never read (lib/editions/enabled.ts), so the
 * link only leads to the Shop and sets nothing.
 */
export async function GET(request: Request) {
  if (siteMode() === "off") return editionsOff();
  const url = new URL(request.url);
  const shop = NextResponse.redirect(new URL("/editions", url.origin), 303);
  const limit = rateLimit(`editions-preview:${getClientIp(request)}`, { max: 10 });
  if (!limit.success || !previewAllowed()) return shop;

  const given = url.searchParams.get("secret") ?? "";
  if (given === "off") {
    shop.cookies.delete(PREVIEW_COOKIE);
    return shop;
  }
  const expected = previewFingerprint();
  const fingerprint = sha256Hex(`editions-preview:${given.trim()}`);
  if (expected && sameHash(fingerprint, expected)) {
    shop.cookies.set(PREVIEW_COOKIE, expected, {
      httpOnly: true,
      sameSite: "lax",
      secure: url.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return shop;
}
