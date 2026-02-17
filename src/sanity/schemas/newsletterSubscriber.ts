import { defineField, defineType } from "sanity";

export const newsletterSubscriber = defineType({
  name: "newsletterSubscriber",
  title: "Newsletter Subscriber",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subscribedAt",
      title: "Subscribed At",
      type: "datetime",
    }),
  ],
  preview: {
    select: { title: "email", subtitle: "subscribedAt" },
  },
});
