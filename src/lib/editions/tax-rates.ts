/**
 * GST/HST by province and territory: the table the Stripe tax rates are
 * created from (scripts/editions-tax-rates.ts) and the estimate on a
 * piece's page reads. Plain module, no imports, so the page can use it.
 * Check it against the CRA's rates before launch (docs/editions-setup.md).
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

/**
 * The province or territory of a Canadian postal code, from its first
 * letter (Canada Post's forward sortation areas). X is shared by the
 * Northwest Territories and Nunavut, both GST 5%.
 */
const FIRST_LETTER: Record<string, string> = {
  A: "NL", B: "NS", C: "PE", E: "NB", G: "QC", H: "QC", J: "QC", K: "ON", L: "ON", M: "ON", N: "ON", P: "ON",
  R: "MB", S: "SK", T: "AB", V: "BC", X: "NT", Y: "YT",
};

/** The tax for a postal code, or null when it is not a Canadian one. */
export function taxForPostalCode(postal: string): { province: string; name: string; label: "GST" | "HST"; percentage: number } | null {
  const code = postal.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z]/.test(code)) return null;
  const province = FIRST_LETTER[code[0]];
  const rate = CANADA_TAX_RATES.find((r) => r.province === province);
  if (!rate) return null;
  return { province, name: province === "NT" ? "Northwest Territories or Nunavut" : rate.name, label: rate.type === "hst" ? "HST" : "GST", percentage: rate.percentage };
}
