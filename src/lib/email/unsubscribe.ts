import { createHmac, timingSafeEqual } from "node:crypto";
import { emailConfig } from "./config";

/**
 * The unsubscribe link in the website's own sign up emails (the welcome and
 * the Notify me confirmation). The link carries the address and a signature
 * made with a server secret (EMAIL_LINK_SECRET, else the Resend key), so it
 * unsubscribes only the person it was sent to and cannot be made up for
 * anyone else. It opens /unsubscribe, which asks once before acting (mail
 * scanners open every link in an email); mail apps' own unsubscribe button
 * posts straight to /api/email/unsubscribe (List-Unsubscribe, one click).
 */

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");

function secret(): string {
  return process.env.EMAIL_LINK_SECRET?.trim() || process.env.RESEND_API_KEY?.trim() || "";
}

const sign = (email: string) => createHmac("sha256", secret()).update(`unsubscribe:${email.toLowerCase()}`).digest("base64url").slice(0, 32);

/** The token for an address: the address, a dot, its signature. */
export function unsubscribeToken(email: string): string | null {
  if (!secret()) return null;
  return `${b64(email.trim())}.${sign(email.trim())}`;
}

/** The address a token was made for, or null when it is not genuine. */
export function readUnsubscribeToken(token: string | null | undefined): string | null {
  if (!token || !secret() || token.length > 600) return null;
  const [data, mac] = token.split(".");
  if (!data || !mac) return null;
  let email: string;
  try {
    email = unb64(data);
  } catch {
    return null;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  const expected = Buffer.from(sign(email));
  const given = Buffer.from(mac);
  return expected.length === given.length && timingSafeEqual(expected, given) ? email : null;
}

/** The page the link opens. */
export function unsubscribePageUrl(email: string): string | null {
  const t = unsubscribeToken(email);
  return t ? `${emailConfig().siteUrl}/unsubscribe?t=${t}` : null;
}

/** Where mail apps' one click unsubscribe posts (List-Unsubscribe). */
export function unsubscribeOneClickUrl(email: string): string | null {
  const t = unsubscribeToken(email);
  return t ? `${emailConfig().siteUrl}/api/email/unsubscribe?t=${t}` : null;
}
