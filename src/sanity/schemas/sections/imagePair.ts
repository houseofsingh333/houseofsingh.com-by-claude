import { defineField, defineType } from "sanity";
import { imageAltFields, captionField } from "../imageFields";

export const imagePair = defineType({
  name: "imagePair",
  title: "Image Pair",
  type: "object",
  icon: () => "⬜⬜",
  description: "Exactly two images, side by side or stacked.",
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [...imageAltFields, captionField],
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
