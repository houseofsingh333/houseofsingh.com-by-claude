import { defineField, defineType } from "sanity";

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
              fields: [
                defineField({
                  name: "alt",
                  title: "Alt Text",
                  type: "string",
                }),
              ],
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
