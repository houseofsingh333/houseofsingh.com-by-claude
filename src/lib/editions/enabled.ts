import { notFound } from "next/navigation";

/**
 * House of Singh Editions is switched on only where EDITIONS_ENABLED is
 * "true" (Vercel: Preview only until launch). Without it the footer has
 * no Shop link, every /editions page is a 404, and the Shop's API routes
 * answer 404 (docs/editions-setup.md).
 */
export const editionsEnabled = () => process.env.EDITIONS_ENABLED === "true";

/** At the top of every Shop page: a 404 unless the Shop is switched on. */
export function requireEditions(): void {
  if (!editionsEnabled()) notFound();
}

/** The answer of a Shop API route while the Shop is switched off. */
export const editionsOff = () => new Response(null, { status: 404 });
