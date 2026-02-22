import { defineField, defineType } from "sanity";

export const textSection = defineType({
  name: "textSection",
  title: "Text Section",
  type: "object",
  icon: () => "T",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: "Optional section heading.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return {
        title: title || "Text Section",
        subtitle: "Text",
      };
    },
  },
});
