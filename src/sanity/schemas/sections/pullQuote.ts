import { defineField, defineType } from "sanity";

export const pullQuote = defineType({
  name: "pullQuote",
  title: "Pull Quote",
  type: "object",
  icon: () => "❝",
  description: "A large editorial quote with optional attribution.",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "attribution",
      title: "Attribution",
      type: "string",
      description: "Optional — who said it.",
    }),
  ],
  preview: {
    select: { title: "quote", subtitle: "attribution" },
    prepare({ title, subtitle }) {
      return {
        title: title || "Pull Quote",
        subtitle: subtitle || "Quote",
      };
    },
  },
});
