import { defineField, defineType } from "sanity";

export const heroSlide = defineType({
  name: "heroSlide",
  title: "Hero Slide",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "imageAlt",
      title: "Image Alt Text",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: 'Overlay text shown on the slide, e.g. "House of Singh — Design Studio"',
    }),
    defineField({
      name: "internalLink",
      title: "Internal Link",
      type: "string",
      description: "Link to a page on this site, e.g. /about",
    }),
    defineField({
      name: "externalLink",
      title: "External Link",
      type: "url",
      description: "Link to an external site (opens in new tab)",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "heading", subtitle: "subheading", media: "image" },
  },
});
