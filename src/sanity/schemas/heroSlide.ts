import { defineField, defineType } from "sanity";

export const heroSlide = defineType({
  name: "heroSlide",
  title: "Hero Slide",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "object",
      fields: [
        defineField({ name: "en", title: "English", type: "string", validation: (r) => r.required() }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
      ],
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "object",
      fields: [
        defineField({ name: "en", title: "English", type: "string" }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
      ],
    }),
    defineField({
      name: "image",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Full-bleed hero image. Minimum 2400 px long edge, JPEG preferred. Avoid raw/uncompressed exports.",
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for screen readers and SEO.",
          validation: (rule) =>
            rule.required().error("Alt text is required for hero images."),
        }),
      ],
    }),
    defineField({
      name: "imageAlt",
      title: "Image Alt Text (legacy)",
      type: "string",
      description: "Deprecated — use the alt field on the image above instead.",
      hidden: true,
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "object",
      description: 'Overlay text shown on the slide, e.g. "House of Singh — Design Studio"',
      fields: [
        defineField({ name: "en", title: "English", type: "string" }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
      ],
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
    select: { title: "heading.en", subtitle: "subheading.en", media: "image" },
  },
});
