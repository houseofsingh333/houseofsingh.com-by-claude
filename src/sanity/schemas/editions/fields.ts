import { defineField } from "sanity";

/**
 * Shared fields for House of Singh Editions. Every image has a hotspot and
 * required alt text (no decorative option: every Shop photograph shows
 * something a buyer needs to see).
 */
export const requiredAlt = defineField({
  name: "alt",
  title: "Alt text",
  type: "string",
  description: "Describe the photograph for screen readers, search and AI engines.",
  validation: (rule) => rule.required().min(3).error("Alt text is required."),
});

/** An image with a hotspot and required alt text. */
export function shopImage(name: string, title: string, description?: string) {
  return defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    description,
    fields: [requiredAlt],
  });
}

/** Marks seeded sample content, so it can be found and deleted in one go. */
export const isTestData = defineField({
  name: "isTestData",
  title: "Test data",
  type: "boolean",
  description: "Sample content for the preview. Delete everything marked as test data before launch (docs/editions-setup.md).",
  initialValue: false,
});

/** The two places pieces ship from. */
export const ORIGINS = [
  { title: "Canada", value: "canada" },
  { title: "India", value: "india" },
];

/** The three shipping zones a buyer chooses between. */
export const ZONES = [
  { title: "Canada", value: "canada" },
  { title: "United States", value: "united-states" },
  { title: "Rest of the world", value: "world" },
];
