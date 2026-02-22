import { defineField, defineType } from "sanity";

export const imagePair = defineType({
  name: "imagePair",
  title: "Image Pair",
  type: "object",
  icon: () => "⬜⬜",
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
          .length(2)
          .error("An image pair must have exactly 2 images."),
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Side by Side", value: "sideBySide" },
          { title: "Stacked", value: "stacked" },
        ],
        layout: "radio",
      },
      initialValue: "sideBySide",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { layout: "layout", media: "images.0" },
    prepare({ layout, media }) {
      return {
        title: `Image Pair — ${layout === "sideBySide" ? "Side by Side" : "Stacked"}`,
        subtitle: "2 images",
        media,
      };
    },
  },
});
