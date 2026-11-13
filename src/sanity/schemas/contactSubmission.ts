import { defineField, defineType } from "sanity";
import { inboxFields, inboxPreview } from "./inboxFields";

export const contactSubmission = defineType({
  name: "contactSubmission",
  title: "Contact message",
  type: "document",
  // The Inbox ticks save as they are clicked (no Publish step).
  liveEdit: true,
  fields: [
    ...inboxFields("Replied"),
    defineField({
      name: "intent",
      title: "Intent",
      type: "string",
      readOnly: true,
      description:
        "What brought them here (Commercial Project, Collaboration, Media / Feature, Something Else).",
    }),
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
      name: "details",
      title: "Details",
      type: "text",
      readOnly: true,
      description: "Formatted summary of all detail responses.",
    }),
    defineField({
      name: "referralSource",
      title: "Referral Source",
      type: "string",
      readOnly: true,
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
  preview: inboxPreview("other"),
});
