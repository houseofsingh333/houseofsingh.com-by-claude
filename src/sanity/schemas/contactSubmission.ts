import { defineField, defineType } from "sanity";

export const contactSubmission = defineType({
  name: "contactSubmission",
  title: "Contact Submission",
  type: "document",
  fields: [
    defineField({
      name: "intent",
      title: "Intent",
      type: "string",
      description:
        "What brought them here (Commercial Project, Collaboration, Media / Feature, Something Else).",
    }),
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
      name: "details",
      title: "Details",
      type: "text",
      description: "Formatted summary of all detail responses.",
    }),
    defineField({
      name: "referralSource",
      title: "Referral Source",
      type: "string",
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
    select: { title: "name", subtitle: "intent" },
  },
});
