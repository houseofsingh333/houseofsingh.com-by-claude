import { defineField, defineType } from "sanity";
import { imageAltFields, captionField } from "../imageFields";

export const horizontalGallery = defineType({
  name: "horizontalGallery",
  title: "Horizontal Gallery",
  type: "object",
  icon: () => "↔",
  description: "A horizontally scrollable row of images (minimum two).",
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
        rule.required().min(2).error("A gallery needs at least 2 images."),
    }),
  ],
  preview: {
    select: { media: "images.0" },
    prepare({ media }) {
      return {
        title: "Horizontal Gallery",
        subtitle: "Scrollable image row",
        media,
      };
    },
  },
});
