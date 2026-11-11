import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stripe, server side only, through its REST API (no SDK, no client
 * script): Checkout Sessions are created here and the visitor is
 * redirected to Stripe's own page, so the site's security policy does not
 * change. STRIPE_SECRET_KEY must be a test key (sk_test_) until launch;
 * docs/editions-setup.md explains switching to live.
 *
 * STRIPE_API_BASE is for local testing only (a stand in server); it is
 * never set on Vercel.
 */
const API_BASE = process.env.STRIPE_API_BASE || "https://api.stripe.com";
/** One fixed API version, so Stripe's answers keep their shape. */
/**
 * The Stripe API version: the account's own. STRIPE_API_VERSION pins it to
 * the exact name the Stripe Dashboard shows (Developers, API version, for
 * example "2026-10-28.name"); unset, no version is sent and Stripe uses the
 * account's default, which is the same version until it is upgraded there.
 */
const API_VERSION = process.env.STRIPE_API_VERSION?.trim() || "";

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
export const stripeTestMode = () => (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");

type Params = Record<string, unknown>;

/** Stripe's form encoding: nested objects as a[b][c]=v, arrays as a[0]=v. */
export function formEncode(params: Params, prefix = ""): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (v !== null && typeof v === "object") out.push(...formEncode(v as Params, `${name}[${i}]`));
        else out.push(`${encodeURIComponent(`${name}[${i}]`)}=${encodeURIComponent(String(v))}`);
      });
    } else if (typeof value === "object") {
      out.push(...formEncode(value as Params, name));
    } else {
      out.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`);
    }
  }
  return out;
}

export class StripeError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function call<T>(method: "GET" | "POST", path: string, params?: Params): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeError("STRIPE_SECRET_KEY is not set", 500);
  const body = params ? formEncode(params).join("&") : undefined;
  const url = method === "GET" && body ? `${API_BASE}${path}?${body}` : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(API_VERSION ? { "Stripe-Version": API_VERSION } : {}),
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" ? body : undefined,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } } & T;
  if (!res.ok) throw new StripeError(data.error?.message ?? `Stripe answered ${res.status}`, res.status);
  return data;
}

export const stripePost = <T>(path: string, params: Params) => call<T>("POST", path, params);
export const stripeGet = <T>(path: string, params?: Params) => call<T>("GET", path, params);

/** A Checkout Session, as far as the Shop reads it. */
export type CheckoutSession = {
  id: string;
  url: string | null;
  livemode: boolean;
  status: string | null;
  payment_status: string;
  payment_intent: string | null;
  amount_subtotal: number | null;
  amount_total: number | null;
  total_details?: { amount_tax?: number | null; amount_shipping?: number | null } | null;
  metadata: Record<string, string> | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  collected_information?: { shipping_details?: { name?: string | null; address?: StripeAddress | null } | null } | null;
  shipping_details?: { name?: string | null; address?: StripeAddress | null } | null;
};

export type StripeAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

/**
 * Checks a webhook's Stripe-Signature header (t=…,v1=…) against the raw
 * body with STRIPE_WEBHOOK_SECRET, as Stripe documents: HMAC SHA-256 of
 * "t.body", compared in constant time, within five minutes.
 */
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string, now = Date.now(), toleranceSec = 300): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  ) as Record<string, string>;
  const t = Number(parts.t);
  if (!Number.isFinite(t) || Math.abs(now / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const signatures = header
    .split(",")
    .filter((p) => p.trim().startsWith("v1="))
    .map((p) => p.trim().slice(3));
  return signatures.some((sig) => sig.length === expected.length && timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex")));
}

/** Signs a payload the way Stripe does (for local tests of the webhook). */
export function signStripePayload(rawBody: string, secret: string, t = Math.floor(Date.now() / 1000)): string {
  const sig = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return `t=${t},v1=${sig}`;
}
