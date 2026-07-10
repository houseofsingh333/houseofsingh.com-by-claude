import { defineField, defineType } from "sanity";
import { imageAltFields, captionField } from "../imageFields";

export const imageRow3 = defineType({
  name: "imageRow3",
  title: "Image Row (3)",
  type: "object",
  icon: () => "▦",
  description: "Exactly three images shown side by side in a row.",
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
        rule.required().length(3).error("This block needs exactly 3 images."),
    }),
  ],
  preview: {
    select: { media: "images.0" },
    prepare({ media }) {
      return { title: "Image Row", subtitle: "3 images", media };
    },
  },
});
