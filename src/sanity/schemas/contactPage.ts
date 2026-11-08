import { defineField, defineType } from "sanity";
import { imageAltFields } from "./imageFields";
import { httpsRule } from "./rules";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional. The portrait beside the contact form. When empty, the About page portrait is used.",
      fields: imageAltFields,
    }),
    defineField({
      name: "portraitCaption",
      title: "Portrait caption",
      type: "string",
      description: "Optional. When empty: Maninder Singh, Toronto",
    }),
    defineField({
      name: "instagramPhotos",
      title: "Instagram Photos",
      type: "array",
      description:
        "Curated Instagram photos. No longer shown on the contact page (the portrait took their place); kept so nothing is lost.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
              validation: (rule) => rule.required(),
              fields: imageAltFields,
            }),
            defineField({
              name: "permalink",
              title: "Instagram Post URL",
              type: "url",
              description: "Link to the original Instagram post.",
              validation: (rule) => httpsRule(rule.required()),
            }),
          ],
          preview: {
            select: { title: "permalink", media: "image" },
          },
        },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    // ——— Deprecated: superseded by the SEO object above. Kept for
    // backward compatibility; code reads these as a fallback. ———
    defineField({
      name: "seoTitle",
      title: "SEO Title (legacy)",
      type: "string",
      description: "Deprecated. Use the SEO → Meta Title field instead.",
      readOnly: true,
      hidden: ({ value }) => !value,
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description (legacy)",
      type: "string",
      description: "Deprecated. Use the SEO → Meta Description field instead.",
      readOnly: true,
      hidden: ({ value }) => !value,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Contact Page" };
    },
  },
});
