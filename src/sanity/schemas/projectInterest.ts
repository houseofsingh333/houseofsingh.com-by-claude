import { defineField, defineType } from "sanity";
import { inboxFields, inboxPreview } from "./inboxFields";

export const projectInterest = defineType({
  name: "projectInterest",
  title: "Project interest",
  type: "document",
  // The Inbox ticks save as they are clicked (no Publish step).
  liveEdit: true,
  fields: [
    ...inboxFields("Replied"),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "instagram",
      title: "Instagram",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "story",
      title: "Story / Nomination",
      type: "text",
      readOnly: true,
      description: "Their story or nomination details.",
    }),
    defineField({
      name: "projectTitle",
      title: "Project Title",
      type: "string",
      readOnly: true,
      description: "The project this interest submission is for.",
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: "Newest First",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: inboxPreview("collaboration"),
});
