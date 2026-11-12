import { stripeGet } from "./stripe";

/**
 * TAX_MODE "fixed" only, kept for a future registration: no tax is charged
 * today (the Shop is sold by Maninder Singh, a small supplier). With it,
 * GST/HST on orders shipped to an address in Canada, at the rate of the province
 * or territory, as fixed tax rates (Stripe retired dynamic tax rates). The
 * rates live in Stripe, created once by scripts/editions-tax-rates.ts
 * (metadata app = hos-editions, province = ON and so on). The buyer gives a
 * postal code before Buy; its first letter gives the province, and that
 * province's rate is applied to the piece and to shipping. The webhook
 * compares it with the province of the shipping address (lib/editions/orders.ts).
 * Orders outside Canada carry no Canadian tax.
 *
 * This table is the source the script creates the rates from. Check it
 * against the CRA's rates before launch (docs/editions-setup.md).
 */
export { CANADA_TAX_RATES } from "./tax-rates";

export const TAX_RATE_APP = "hos-editions";

type TaxRate = { id: string; active: boolean; percentage: number; state?: string | null; inclusive?: boolean; metadata?: Record<string, string> | null };
export type ShopTaxRate = { id: string; province: string; percentage: number };

let cached: { at: number; rates: ShopTaxRate[] } | null = null;

/** The Shop's active GST/HST rates in Stripe, by province (cached for ten minutes). */
async function shopTaxRates(): Promise<ShopTaxRate[]> {
  if (cached && Date.now() - cached.at < 600_000) return cached.rates;
  const list = await stripeGet<{ data: TaxRate[] }>("/v1/tax_rates", { active: true, limit: 100 });
  const rates = list.data
    .filter((r) => r.active && !r.inclusive && r.metadata?.app === TAX_RATE_APP)
    .map((r) => ({ id: r.id, province: (r.metadata?.province || r.state || "").toUpperCase(), percentage: r.percentage }))
    .filter((r) => r.province);
  cached = { at: Date.now(), rates };
  return rates;
}

/** The Stripe tax rate for a province, or null when none was created for it. */
export async function taxRateFor(province: string): Promise<ShopTaxRate | null> {
  return (await shopTaxRates()).find((r) => r.province === province) ?? null;
}
