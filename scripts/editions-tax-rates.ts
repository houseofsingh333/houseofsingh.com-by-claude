/**
 * Creates the Shop's GST/HST rates in Stripe, once per mode (test, then
 * live): one rate per province and territory, from CANADA_TAX_RATES in
 * src/lib/editions/tax.ts, each exclusive (added on top of the price),
 * matched by Checkout to the shipping address (country CA, the province).
 * Safe to run again: a province that already has the same rate is left
 * alone; one whose rate changed gets a new rate and the old one is
 * switched off.
 *
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/editions-tax-rates.ts
 *   add --dry-run to only show what would change.
 */
import { stripeGet, stripePost, stripeTestMode } from "../src/lib/editions/stripe";
import { CANADA_TAX_RATES, TAX_RATE_APP } from "../src/lib/editions/tax";

type Rate = { id: string; active: boolean; percentage: number; state: string | null; metadata?: Record<string, string> | null };

const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Set STRIPE_SECRET_KEY first.");
  console.log(`Stripe ${stripeTestMode() ? "TEST" : "LIVE"} mode${dryRun ? ", dry run" : ""}.`);

  const existing = (await stripeGet<{ data: Rate[] }>("/v1/tax_rates", { active: true, limit: 100 })).data.filter((r) => r.metadata?.app === TAX_RATE_APP);

  for (const t of CANADA_TAX_RATES) {
    const label = t.type === "hst" ? "HST" : "GST";
    const same = existing.find((r) => r.state === t.province && r.percentage === t.percentage);
    if (same) {
      console.log(`${t.province} ${label} ${t.percentage}%: already there (${same.id})`);
      continue;
    }
    for (const old of existing.filter((r) => r.state === t.province)) {
      console.log(`${t.province}: switching off the old rate ${old.id} (${old.percentage}%)`);
      if (!dryRun) await stripePost(`/v1/tax_rates/${old.id}`, { active: false });
    }
    console.log(`${t.province} ${label} ${t.percentage}%: creating`);
    if (!dryRun) {
      await stripePost("/v1/tax_rates", {
        display_name: label,
        description: `${label}, ${t.name}`,
        jurisdiction: t.name,
        percentage: t.percentage,
        inclusive: false,
        country: "CA",
        state: t.province,
        tax_type: t.type,
        metadata: { app: TAX_RATE_APP, province: t.province },
      });
    }
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
