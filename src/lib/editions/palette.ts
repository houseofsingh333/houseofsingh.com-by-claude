/**
 * The Shop's own palette (House of Singh Editions only; BRAND_BOOK.md,
 * "Shop palette"). Each Collection's square takes one colour, with the ink
 * and the quieter ink chosen so its small labels read on it (each at
 * 4.5:1 or more on its square; olive takes a dark ink).
 *
 * Kept in a plain module (no imports) so the Sanity schema can share it.
 */
export const SHOP_COLOURS = {
  saffron: { name: "Saffron", square: "#E6CFA4", ink: "#3A2E1F", quiet: "#5E4C34" },
  indigo: { name: "Indigo", square: "#3E4A5C", ink: "#F3EFE9", quiet: "#C9CED6" },
  olive: { name: "Olive", square: "#8A8B6A", ink: "#141410", quiet: "#1F1E16" },
  sand: { name: "Sand", square: "#DCCFBA", ink: "#2E2820", quiet: "#5E5446" },
  oxblood: { name: "Oxblood", square: "#5C2A2A", ink: "#F4ECE6", quiet: "#D9C7BE" },
  slate: { name: "Slate", square: "#5A6068", ink: "#F3F1EE", quiet: "#E4E5E7" },
} as const;

export type ShopColour = keyof typeof SHOP_COLOURS;

export const SHOP_COLOUR_OPTIONS = (Object.keys(SHOP_COLOURS) as ShopColour[]).map((value) => ({
  value,
  title: `${SHOP_COLOURS[value].name} (${SHOP_COLOURS[value].square})`,
}));

export function shopColour(value: string | null | undefined) {
  return SHOP_COLOURS[(value as ShopColour) in SHOP_COLOURS ? (value as ShopColour) : "saffron"];
}
