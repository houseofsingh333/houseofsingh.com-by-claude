import { defineField, defineType } from "sanity";

/**
 * Reusable SEO object — attach to any indexable document type.
 *
 * All fields are optional overrides. When empty, page code falls back to
 * sensible defaults (page title, excerpt, own URL, indexable).
 */
export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      description:
        "Title for search engines, browser tabs, and social/AI previews. Aim for ~60 characters. Leave blank to use the page's default title.",
      validation: (rule) =>
        rule
          .max(70)
          .warning(
            "Titles longer than ~60 characters are often truncated in search results.",
          ),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 3,
      description:
        "Summary shown in search results and social/AI previews. Aim for ~160 characters.",
      validation: (rule) =>
        rule
          .max(180)
          .warning(
            "Descriptions longer than ~160 characters are often truncated in search results.",
          ),
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      description:
        "Enable to stop Google and AI engines from indexing this page (adds a noindex tag).",
      initialValue: false,
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "string",
      description:
        "Optional. Override the canonical URL if this content also lives at another address. Leave blank to use this page's own URL.",
    }),
  ],
});
