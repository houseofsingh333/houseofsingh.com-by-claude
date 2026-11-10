import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Early access: the link carries the Collection's code
 * (/editions?access=CODE). The server compares its SHA-256 with the
 * fingerprint saved on the Collection (the code itself is never stored),
 * then keeps the fingerprint in a cookie so the visitor stays inside.
 */
export const ACCESS_COOKIE = "hos_editions_access";

export function sha256Hex(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/** A code as typed or pasted: trimmed and upper case. */
export const normaliseCode = (code: string) => code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Whether two hex fingerprints are the same, in constant time. */
export function sameHash(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

/** Whether the cookie's value opens a Collection with this fingerprint. */
export function hasAccess(cookieValue: string | undefined, collectionHash: string | null | undefined): boolean {
  return sameHash(cookieValue, collectionHash);
}
