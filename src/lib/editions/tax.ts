import { stripeGet } from "./stripe";

/**
 * GST/HST, charged by House of Singh Studios Inc. (registered for GST/HST)
 * on orders shipped to an address in Canada, at the rate of the province
 * or territory: Stripe Checkout's dynamic tax rates (no paid tax service).
 * The rates live in Stripe, created once by scripts/editions-tax-rates.mjs
 * (metadata app = hos-editions); Checkout picks the one matching the
 * shipping address. Addresses outside Canada match none: no Canadian tax.
 *
 * This table is the source the script creates the rates from. Check it
 * against the CRA's rates before launch (docs/editions-setup.md).
 */
export const CANADA_TAX_RATES: { province: string; name: string; type: "gst" | "hst"; percentage: number }[] = [
  { province: "AB", name: "Alberta", type: "gst", percentage: 5 },
  { province: "BC", name: "British Columbia", type: "gst", percentage: 5 },
  { province: "MB", name: "Manitoba", type: "gst", percentage: 5 },
  { province: "NB", name: "New Brunswick", type: "hst", percentage: 15 },
  { province: "NL", name: "Newfoundland and Labrador", type: "hst", percentage: 15 },
  { province: "NS", name: "Nova Scotia", type: "hst", percentage: 14 },
  { province: "NT", name: "Northwest Territories", type: "gst", percentage: 5 },
  { province: "NU", name: "Nunavut", type: "gst", percentage: 5 },
  { province: "ON", name: "Ontario", type: "hst", percentage: 13 },
  { province: "PE", name: "Prince Edward Island", type: "hst", percentage: 15 },
  { province: "QC", name: "Quebec", type: "gst", percentage: 5 },
  { province: "SK", name: "Saskatchewan", type: "gst", percentage: 5 },
  { province: "YT", name: "Yukon", type: "gst", percentage: 5 },
];

export const TAX_RATE_APP = "hos-editions";

type TaxRate = { id: string; active: boolean; metadata?: Record<string, string> | null };

let cached: { at: number; ids: string[] } | null = null;

/** The Shop's active GST/HST rates in Stripe (cached for ten minutes). */
export async function shopTaxRateIds(): Promise<string[]> {
  if (cached && Date.now() - cached.at < 600_000) return cached.ids;
  const list = await stripeGet<{ data: TaxRate[] }>("/v1/tax_rates", { active: true, limit: 100 });
  const ids = list.data.filter((r) => r.active && r.metadata?.app === TAX_RATE_APP).map((r) => r.id);
  cached = { at: Date.now(), ids };
  return ids;
}
