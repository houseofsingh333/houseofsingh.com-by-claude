import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { sameHash, sha256Hex } from "./access";

/**
 * How much of House of Singh Editions a site shows (EDITIONS_MODE):
 *
 * - "off": nothing. No footer link; every /editions page and Shop API
 *   route answers 404.
 * - "anticipation": the live site before launch. /editions shows only the
 *   sealed Collection (the square, its sentence, Notify me) and is
 *   indexable; the footer links to it. Pieces, prices, the archive,
 *   collaborators, checkout, thank you and certificates answer 404.
 * - "full": the whole Shop (Vercel Preview today; Production at launch).
 *
 * EDITIONS_MODE unset: "full" where the older EDITIONS_ENABLED is "true",
 * else "off". A browser holding the secret preview cookie
 * (/editions?preview=EDITIONS_PREVIEW_SECRET) sees "full" while the site
 * is in "anticipation" (docs/editions-setup.md).
 */
export type EditionsMode = "off" | "anticipation" | "full";

export function siteMode(): EditionsMode {
  const mode = process.env.EDITIONS_MODE?.trim();
  if (mode === "off" || mode === "anticipation" || mode === "full") return mode;
  return process.env.EDITIONS_ENABLED === "true" ? "full" : "off";
}

/** Whether the footer links to the Shop. */
export const editionsLinked = () => siteMode() !== "off";

export const PREVIEW_COOKIE = "hos_editions_preview";

/** The preview cookie's value: a fingerprint of the secret, never the secret. */
export function previewFingerprint(): string | null {
  const secret = process.env.EDITIONS_PREVIEW_SECRET?.trim();
  return secret && secret.length >= 12 ? sha256Hex(`editions-preview:${secret}`) : null;
}

/** The mode this visitor sees: the site's, or "full" with the preview cookie. */
export async function viewerMode(): Promise<EditionsMode> {
  const mode = siteMode();
  if (mode !== "anticipation") return mode;
  const expected = previewFingerprint();
  if (!expected) return mode;
  const held = (await cookies()).get(PREVIEW_COOKIE)?.value;
  return sameHash(held, expected) ? "full" : mode;
}

/**
 * At the top of every Shop page: a 404 unless this visitor's mode allows
 * the page. "any" pages (the Shop itself, For artists, terms of sale) show
 * in anticipation; "full" pages need the whole Shop.
 */
export async function requireEditions(need: "any" | "full" = "full"): Promise<EditionsMode> {
  const mode = await viewerMode();
  if (mode === "off" || (need === "full" && mode !== "full")) notFound();
  return mode;
}

/** For Shop API routes: whether this request may use the route. */
export async function editionsAllowed(need: "any" | "full" = "full"): Promise<boolean> {
  const mode = await viewerMode();
  return mode !== "off" && (need === "any" || mode === "full");
}

/** The answer of a Shop API route that is switched off. */
export const editionsOff = () => new Response(null, { status: 404 });
