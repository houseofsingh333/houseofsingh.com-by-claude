import { defineField, defineType } from "sanity";

export const imageGrid = defineType({
  name: "imageGrid",
  title: "Image Grid",
  type: "object",
  icon: () => "⊞",
  fields: [
    defineField({
      name: "images",
      title: "Images",
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
      validation: (rule) =>
        rule
          .required()
          .min(3)
          .max(6)
          .error("Image grid requires 3–6 images."),
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "2 Columns", value: "2col" },
          { title: "3 Columns", value: "3col" },
        ],
        layout: "radio",
      },
      initialValue: "2col",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { layout: "layout", count: "images.length", media: "images.0" },
    prepare({ layout, media }) {
      return {
        title: `Image Grid — ${layout === "2col" ? "2 Columns" : "3 Columns"}`,
        subtitle: "Grid",
        media,
      };
    },
  },
});
