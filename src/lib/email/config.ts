/**
 * Email settings, all from the environment (docs/email.md):
 *
 * - KIT_API_KEY: Kit (kit.com), which holds the list of people and sends
 *   only the letters Maninder writes.
 * - RESEND_API_KEY: Resend, which sends every automatic email the website
 *   triggers, one person at a time.
 * - EMAIL_FROM: the sender of those emails (a verified Resend domain).
 * - EMAIL_REPLY_TO: where replies go (Maninder's own inbox); also where
 *   the copy of a collaboration proposal is sent.
 * - EMAIL_POSTAL_ADDRESS: the mailing address every email carries, as
 *   Canada's anti spam law asks.
 * - RESEND_DAILY_LIMIT (default 100, Resend's free plan) and
 *   RESEND_SIGNUP_RESERVE (default 10): sign up confirmations stop that
 *   many short of the limit, so order and shipping emails still go out.
 * - KIT_API_BASE and RESEND_API_BASE: local testing only, ignored on the
 *   live site.
 */
const notProduction = process.env.VERCEL_ENV !== "production";

export const SITE_URL = "https://houseofsingh.com";

export const emailConfig = () => ({
  kitKey: process.env.KIT_API_KEY?.trim() || "",
  kitBase: (notProduction && process.env.KIT_API_BASE) || "https://api.kit.com",
  resendKey: process.env.RESEND_API_KEY?.trim() || "",
  resendBase: (notProduction && process.env.RESEND_API_BASE) || "https://api.resend.com",
  from: process.env.EMAIL_FROM?.trim() || "House of Singh Editions <editions@houseofsingh.com>",
  replyTo: process.env.EMAIL_REPLY_TO?.trim() || "",
  postalAddress: process.env.EMAIL_POSTAL_ADDRESS?.trim() || "",
  dailyLimit: Math.max(1, Number(process.env.RESEND_DAILY_LIMIT) || 100),
  signupReserve: Math.max(0, Number(process.env.RESEND_SIGNUP_RESERVE ?? 10)),
  /** Absolute addresses in emails: the site's own (a preview's in testing). */
  siteUrl: (notProduction && process.env.EMAIL_SITE_URL) || SITE_URL,
});
