import type { ShippingRoute, Zone } from "./types";

export const ZONES: { value: Zone; label: string }[] = [
  { value: "canada", label: "Canada" },
  { value: "united-states", label: "United States" },
  { value: "india", label: "India" },
  { value: "world", label: "Elsewhere" },
];

export const isZone = (z: unknown): z is Zone => ZONES.some((x) => x.value === z);

/** Countries Stripe Checkout can collect a shipping address for (its documented list). */
const STRIPE_COUNTRIES =
  "AC AD AE AF AG AI AL AM AO AQ AR AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CD CF CG CH CI CK CL CM CN CO CR CV CW CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IS IT JE JM JO JP KE KG KH KI KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MK ML MM MN MO MQ MR MS MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SZ TA TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VN VU WF WS XK YE YT ZA ZM ZW".split(
    " ",
  );

/** The countries a shipping address may be in, for a zone. */
export function zoneCountries(zone: Zone): string[] {
  if (zone === "canada") return ["CA"];
  if (zone === "united-states") return ["US"];
  if (zone === "india") return ["IN"];
  return STRIPE_COUNTRIES.filter((c) => c !== "CA" && c !== "US" && c !== "IN");
}

/**
 * The shipping price in CAD for a piece: the first weight band of its
 * route (origin to zone) that its packed weight fits in. Null when the
 * table has no route or no band heavy enough: the piece cannot ship there
 * yet, and Buy says so instead of guessing. India came later as its own
 * zone: an origin with no India route yet uses its Elsewhere route.
 */
export function shippingPrice(routes: ShippingRoute[] | null | undefined, origin: string, zone: Zone, kg: number): number | null {
  const find = (z: Zone) => routes?.find((r) => r.origin === origin && r.zone === z);
  const route = find(zone) ?? (zone === "india" ? find("world") : undefined);
  if (!route) return null;
  const band = [...route.bands].sort((a, b) => a.upToKg - b.upToKg).find((b) => kg <= b.upToKg);
  return band ? band.price : null;
}

/** Every zone's price for a piece (null where it cannot ship). */
export function shippingTable(routes: ShippingRoute[] | null | undefined, origin: string, kg: number): Record<Zone, number | null> {
  return Object.fromEntries(ZONES.map((z) => [z.value, shippingPrice(routes, origin, z.value, kg)])) as Record<Zone, number | null>;
}
