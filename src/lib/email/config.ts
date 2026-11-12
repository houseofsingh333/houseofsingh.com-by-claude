/**
 * Email settings, all from the environment (docs/email.md):
 *
 * - KIT_API_KEY: Kit (kit.com), which holds the list of people and sends
 *   only the letters Maninder writes.
 * - RESEND_API_KEY: Resend, which sends every automatic email the website
 *   triggers, one person at a time.
 * - EMAIL_FROM_LETTERS: the sender of the newsletter welcome, Maninder
 *   himself (default "Maninder Singh <maninder@houseofsingh.com>").
 * - EMAIL_FROM_EDITIONS: the sender of every Shop email (default "House
 *   of Singh Editions <editions@houseofsingh.com>"). Replies to each go
 *   back to its own sender's address; the copy of a collaboration
 *   proposal goes to the Shop's address.
 * - EMAIL_POSTAL_ADDRESS: the mailing address every email carries, as
 *   Canada's anti spam law asks.
 * - RESEND_DAILY_LIMIT (default 100, Resend's free plan) and
 *   RESEND_SIGNUP_RESERVE (default 10): sign up confirmations stop that
 *   many short of the limit, so order and shipping emails still go out.
 * - KIT_API_BASE and RESEND_API_BASE: local testing only, ignored on the
 *   live site.
 */
const notProduction = process.env.VERCEL_ENV !== "production";

const SITE_URL = "https://houseofsingh.com";

function emailSiteUrl(): string {
  if (!notProduction) return SITE_URL;
  if (process.env.EMAIL_SITE_URL) return process.env.EMAIL_SITE_URL.replace(/\/$/, "");
  const host = process.env.VERCEL_ENV === "preview" ? process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL : "";
  return host ? `https://${host}` : SITE_URL;
}

export const emailConfig = () => ({
  kitKey: process.env.KIT_API_KEY?.trim() || "",
  kitBase: (notProduction && process.env.KIT_API_BASE) || "https://api.kit.com",
  resendKey: process.env.RESEND_API_KEY?.trim() || "",
  resendBase: (notProduction && process.env.RESEND_API_BASE) || "https://api.resend.com",
  fromLetters: process.env.EMAIL_FROM_LETTERS?.trim() || "Maninder Singh <maninder@houseofsingh.com>",
  fromEditions: process.env.EMAIL_FROM_EDITIONS?.trim() || "House of Singh Editions <editions@houseofsingh.com>",
  postalAddress: process.env.EMAIL_POSTAL_ADDRESS?.trim() || "",
  dailyLimit: Math.max(1, Number(process.env.RESEND_DAILY_LIMIT) || 100),
  signupReserve: Math.max(0, Number(process.env.RESEND_SIGNUP_RESERVE ?? 10)),
  /**
   * Links in emails (unsubscribe, certificate, pages): houseofsingh.com on
   * the live site; on a Vercel preview the preview's own address (its
   * branch address, else the deployment's), so links work before a change
   * is merged. EMAIL_SITE_URL overrides it off production.
   */
  siteUrl: emailSiteUrl(),
  /**
   * Images and fonts in emails (the crest, the typefaces): always
   * houseofsingh.com, previews included. Previews are protected, so Gmail
   * and other mail apps cannot fetch from them.
   */
  assetUrl: SITE_URL,
});

/** The bare address in "Name <address>" (or the address itself). */
export const addressOf = (sender: string) => (sender.match(/<([^>]+)>/)?.[1] ?? sender).trim();
