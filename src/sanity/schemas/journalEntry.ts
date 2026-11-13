import { defineField, defineType } from "sanity";
import { imageAltFields, captionField } from "./imageFields";
import { SLUG_NOTE } from "./rules";
import { inGroups } from "./groups";

/** The journal entry form's tabs; Writing opens first. */
const JOURNAL_TABS = {
  writing: ["title", "slug", "date", "excerpt", "body", "author"],
  photographs: ["coverImage"],
  search: ["seo", "seoTitle", "seoDescription"],
} as const;

const bodyMembers = [
  { type: "block" },
  {
    type: "image",
    options: { hotspot: true },
    fields: [...imageAltFields, captionField],
  },
];

export const journalEntry = defineType({
  name: "journalEntry",
  title: "Journal entry",
  type: "document",
  groups: [
    { name: "writing", title: "Writing", default: true },
    { name: "photographs", title: "Photographs" },
    { name: "search", title: "Search" },
  ],
  fields: inGroups([
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: SLUG_NOTE,
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown in listings.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Required: the Journal shows every entry with its photograph. Recommended: JPEG, minimum 2400 px on the long edge. Avoid uploading raw/uncompressed exports.",
      validation: (rule) => rule.required(),
      fields: [...imageAltFields, captionField],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: bodyMembers,
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      description: "Credited author for structured data.",
      initialValue: "Maninder Singh",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    // ——— Deprecated: superseded by the SEO object above. Kept for
    // backward compatibility; code reads these as a fallback. ———
    defineField({
      name: "seoTitle",
      title: "SEO Title (legacy)",
      type: "string",
      description: "Deprecated. Use the SEO → Meta Title field instead.",
      readOnly: true,
      hidden: ({ value }) => !value,
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description (legacy)",
      type: "string",
      description: "Deprecated. Use the SEO → Meta Description field instead.",
      readOnly: true,
      hidden: ({ value }) => !value,
    }),
  ], JOURNAL_TABS),
  orderings: [
    {
      title: "Date (Newest)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "date", media: "coverImage" },
  },
});
