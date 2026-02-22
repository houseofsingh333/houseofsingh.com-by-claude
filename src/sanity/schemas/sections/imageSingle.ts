import { defineField, defineType } from "sanity";

export const imageSingle = defineType({
  name: "imageSingle",
  title: "Single Image",
  type: "object",
  icon: () => "🖼",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: (rule) =>
            rule.required().warning("Alt text is recommended for accessibility."),
        }),
      ],
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: [
          { title: "Full width", value: "full" },
          { title: "Large", value: "large" },
          { title: "Medium", value: "medium" },
        ],
        layout: "radio",
      },
      initialValue: "large",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "caption", media: "image" },
    prepare({ title, media }) {
      return {
        title: title || "Single Image",
        subtitle: "Image",
        media,
      };
    },
  },
});
