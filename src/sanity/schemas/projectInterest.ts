import { defineField, defineType } from "sanity";

export const projectInterest = defineType({
  name: "projectInterest",
  title: "Project Interest",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "instagram",
      title: "Instagram",
      type: "string",
    }),
    defineField({
      name: "story",
      title: "Story / Nomination",
      type: "text",
      description: "Their story or nomination details.",
    }),
    defineField({
      name: "projectTitle",
      title: "Project Title",
      type: "string",
      description: "The project this interest submission is for.",
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
    }),
  ],
  orderings: [
    {
      title: "Newest First",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "projectTitle" },
  },
});
