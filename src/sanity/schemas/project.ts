import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "object",
      fields: [
        defineField({ name: "en", title: "English", type: "string", validation: (r) => r.required() }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
      ],
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "e.g. Photography, Design, Collaborations",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "object",
      fields: [
        defineField({ name: "en", title: "English", type: "text", rows: 3 }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "text", rows: 3 }),
      ],
      description: "Short summary shown in project grid cards.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "object",
      fields: [
        defineField({ name: "en", title: "English", type: "array", of: [{ type: "block" }] }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "array", of: [{ type: "block" }] }),
      ],
      description: "Full project write-up (Portable Text).",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      description: "Card image. Recommended: JPEG, min 1600px wide, 4:3 ratio.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for screen readers and SEO.",
          validation: (rule) =>
            rule.required().warning("Alt text is strongly recommended."),
        }),
      ],
    }),
    defineField({
      name: "images",
      title: "Gallery Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (rule) =>
                rule.required().warning("Alt text is recommended."),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "spotlight",
      title: "Spotlight on Homepage",
      type: "boolean",
      description: "Feature this project as the spotlight on the homepage.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title.en", subtitle: "category", media: "thumbnail" },
  },
});
