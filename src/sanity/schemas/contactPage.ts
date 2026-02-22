import { defineField, defineType } from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Page Heading",
      type: "object",
      description: "Main heading shown on the contact page.",
      fields: [
        defineField({ name: "en", title: "English", type: "string" }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
      ],
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "object",
      description: "Text shown below the heading.",
      fields: [
        defineField({ name: "en", title: "English", type: "text", rows: 2 }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "reasons",
      title: "Contact Reasons",
      type: "array",
      description: 'Options shown in Step 1 (e.g. "Project Query", "Collaboration", "Media").',
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "en", title: "English", type: "string", validation: (r) => r.required() }),
            defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
          ],
          preview: {
            select: { title: "en" },
          },
        },
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "string",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Contact Page" };
    },
  },
});
