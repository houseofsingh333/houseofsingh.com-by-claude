import { defineField, defineType } from "sanity";
import { imageAltFields, captionField } from "./imageFields";

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
  title: "Journal Entry",
  type: "document",
  fields: [
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
        "Recommended: JPEG, minimum 2400 px on the long edge. Avoid uploading raw/uncompressed exports.",
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
      description: "Deprecated — use the SEO → Meta Title field instead.",
      readOnly: true,
      hidden: ({ value }) => !value,
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description (legacy)",
      type: "string",
      description: "Deprecated — use the SEO → Meta Description field instead.",
      readOnly: true,
      hidden: ({ value }) => !value,
    }),
  ],
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
