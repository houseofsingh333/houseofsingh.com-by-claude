import { defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    /* ——— 1 · Intro Quote ——— */
    defineField({
      name: "introQuote",
      title: "Intro Quote",
      type: "string",
      description: "Large opening quote displayed hero-style at the top of the page.",
    }),

    /* ——— 2 · Founder Section ——— */
    defineField({
      name: "founderName",
      title: "Founder Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "founderRoles",
      title: "Founder Roles",
      type: "array",
      of: [{ type: "string" }],
      description: 'Displayed as stacked role titles (e.g. "Creative Director", "Photographer").',
    }),
    defineField({
      name: "founderBio",
      title: "Founder Bio",
      type: "array",
      of: [{ type: "block" }],
      description: "Bio paragraphs beside the portrait.",
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
      description:
        "Founder portrait. Recommended: JPEG, minimum 2400 px long edge, portrait orientation (3:4).",
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for screen readers and SEO.",
          validation: (rule) =>
            rule.required().warning("Alt text is strongly recommended."),
        }),
      ],
    }),
    defineField({
      name: "homePortrait",
      title: "Homepage About Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional separate image for the homepage About section. Falls back to Portrait if empty.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for screen readers and SEO.",
          validation: (rule) =>
            rule.required().warning("Alt text is strongly recommended."),
        }),
      ],
    }),

    /* ——— 3 · The Moniker ——— */
    defineField({
      name: "monikerLogo",
      title: "Moniker Logo",
      type: "image",
      description: "House of Singh logo shown in The Moniker section.",
    }),
    defineField({
      name: "monikerText",
      title: "Moniker Text",
      type: "array",
      of: [{ type: "block" }],
      description: "Description of the House of Singh identity.",
    }),

    /* ——— 4 · Featured On ——— */
    defineField({
      name: "featuredOn",
      title: "Featured On",
      type: "array",
      description: "Publications, outlets, or platforms that have featured your work.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Publication Name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              title: "Feature Title",
              type: "string",
              description: "Title of the article or feature.",
            }),
            defineField({
              name: "date",
              title: "Date",
              type: "date",
              description: "Publication date of the feature.",
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
              description: "A short description of the feature (1–2 sentences).",
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              description: "Link to the feature or publication.",
            }),
            defineField({
              name: "logo",
              title: "Logo",
              type: "image",
              description: "Publication or outlet logo.",
            }),
            defineField({
              name: "image",
              title: "Feature Image",
              type: "image",
              options: { hotspot: true },
              description: "Image representing the feature. Recommended: landscape, minimum 800px wide.",
              fields: [
                defineField({
                  name: "alt",
                  title: "Alt Text",
                  type: "string",
                  description: "Describe the image for screen readers.",
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "name", media: "image" },
          },
        },
      ],
    }),

    /* ——— 5 · Rapid Fire ——— */
    defineField({
      name: "rapidFire",
      title: "Rapid Fire",
      type: "array",
      description: "Quick Q&A pairs — fun, personal, and revealing.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "question", subtitle: "answer" },
          },
        },
      ],
    }),

    /* ——— 6 · Timeline ——— */
    defineField({
      name: "milestones",
      title: "Timeline Milestones",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "year",
              title: "Year",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "text",
              title: "Description",
              type: "string",
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              description: "JPEG preferred. Use PNG only if transparency is needed.",
              validation: (rule) => rule.required(),
              fields: [
                defineField({
                  name: "alt",
                  title: "Alt Text",
                  type: "string",
                  description: "Describe the image for screen readers.",
                  validation: (rule) =>
                    rule.required().warning("Alt text is recommended."),
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "year" },
          },
        },
      ],
    }),

    /* ——— SEO ——— */
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      description: "Override the default page title for search engines.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "string",
      description: "Meta description for search engines.",
    }),
  ],
  preview: {
    select: { title: "founderName" },
  },
});
