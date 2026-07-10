import { defineField, defineType } from "sanity";
import { imageAltFields, captionField } from "../imageFields";

export const textWithImage = defineType({
  name: "textWithImage",
  title: "Text with Image",
  type: "object",
  icon: () => "◨",
  description:
    "A block of rich text beside one image. Choose which side the image sits on.",
  fields: [
    defineField({
      name: "body",
      title: "Text",
      type: "array",
      of: [{ type: "block" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [...imageAltFields, captionField],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "side",
      title: "Image Side",
      type: "string",
      options: {
        list: [
          { title: "Image Left", value: "imageLeft" },
          { title: "Image Right", value: "imageRight" },
        ],
        layout: "radio",
      },
      initialValue: "imageRight",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { media: "image", side: "side" },
    prepare({ media, side }) {
      return {
        title: "Text with Image",
        subtitle: side === "imageLeft" ? "Image left" : "Image right",
        media,
      };
    },
  },
});
