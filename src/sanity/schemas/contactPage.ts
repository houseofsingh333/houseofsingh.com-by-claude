import { defineField, defineType } from "sanity";
import { imageAltFields } from "./imageFields";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Page Heading",
      type: "string",
      description: "Main heading shown on the contact page.",
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "text",
      rows: 2,
      description: "Text shown below the heading.",
    }),
    defineField({
      name: "reasons",
      title: "Contact Reasons",
      type: "array",
      description: 'Options shown in Step 1 (e.g. "Project Query", "Collaboration", "Media").',
      of: [{ type: "string" }],
    }),
    defineField({
      name: "instagramPhotos",
      title: "Instagram Photos",
      type: "array",
      description:
        "Curated Instagram photos shown as a rotating plate on the contact page.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
              validation: (rule) => rule.required(),
              fields: imageAltFields,
            }),
            defineField({
              name: "permalink",
              title: "Instagram Post URL",
              type: "url",
              description: "Link to the original Instagram post.",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "permalink", media: "image" },
          },
        },
      ],
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
  preview: {
    prepare() {
      return { title: "Contact Page" };
    },
  },
});
