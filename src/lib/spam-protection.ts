/**
 * Honeypot spam protection.
 *
 * A hidden form field that real users never see or fill. Bots that blindly
 * populate every input give themselves away. Shared between the client form
 * components (which render the field) and the API routes (which check it).
 *
 * This module is intentionally free of side effects and server-only imports
 * so it can be safely included in the client bundle.
 */

/** Name of the hidden honeypot input. Keep client + server in sync via this. */
export const HONEYPOT_FIELD = "company";

/**
 * Returns true when the honeypot field has any value — i.e. the submission
 * almost certainly came from a bot.
 */
export function isHoneypotFilled(body: Record<string, unknown>): boolean {
  const value = body[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}
