import { defineField, defineType } from "sanity";
import { imageAltFields } from "./imageFields";
import { httpsRule } from "./rules";
import { CONTACT_FORM_DEFAULTS, STEP_IDS, type StepId } from "../../lib/contact-form-data";

/** The Studio's name for each step, and a note of where it appears. */
const STEP_TITLES: Record<StepId, string> = {
  name: "Name (every enquiry)",
  email: "Email (every enquiry)",
  phone: "Phone (every enquiry, optional)",
  projectName: "Project name (commercial project)",
  projectDescription: "Project description (commercial project)",
  budget: "Budget (commercial project)",
  timeline: "Timeline (commercial project)",
  referralSource: "How they found you (all but something else)",
  collabType: "Kind of collaboration (collaboration)",
  portfolioLink: "Their work (collaboration, optional)",
  socialHandle: "Where to find them online (collaboration, optional)",
  collabDescription: "Their idea (collaboration)",
  collabTimeline: "Timeline (collaboration, optional)",
  mediaOutlet: "Outlet (media)",
  inquiryType: "Kind of enquiry (media)",
  deadline: "Deadline (media, optional)",
  mediaDescription: "The request (media)",
  freeformMessage: "Message (something else)",
};

const keep = (text: string) => `Leave empty to keep: ${text}`;

/** One step's words: its question, its helper line, its choices where it has them. */
function stepField(id: StepId) {
  const d = CONTACT_FORM_DEFAULTS.steps[id];
  return defineField({
    name: id,
    title: STEP_TITLES[id],
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({ name: "question", title: "Question", type: "string", description: keep(d.question) }),
      defineField({
        name: "helperText",
        title: "Line under the question",
        type: "string",
        description: d.helperText ? keep(d.helperText) : "Optional. Empty today.",
      }),
      ...(d.options
        ? [
            defineField({
              name: "options",
              title: "Choices",
              type: "array",
              of: [{ type: "string" }],
              description: keep(d.options.join(", ")),
            }),
          ]
        : []),
    ],
  });
}

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
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
      name: "form",
      title: "Contact form",
      type: "object",
      description:
        "The words of the contact form. Every field is optional: anything left empty keeps today's wording. The steps themselves, which are required and how the form branches stay as they are.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "intentQuestion",
          title: "First question",
          type: "string",
          description: keep(CONTACT_FORM_DEFAULTS.intentQuestion),
        }),
        defineField({
          name: "intents",
          title: "The four reasons to get in touch",
          type: "object",
          description: "Each opens its own questions, in this order.",
          options: { collapsible: true, collapsed: true },
          fields: (["commercial", "collaboration", "media", "other"] as const).map((name, i) =>
            defineField({ name, title: ["Commercial project", "Collaboration", "Media", "Something else"][i], type: "string", description: keep(CONTACT_FORM_DEFAULTS.intents[i]) }),
          ),
        }),
        defineField({
          name: "steps",
          title: "Questions",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: STEP_IDS.map(stepField),
        }),
        defineField({
          name: "thankYouHeading",
          title: "Thank you heading",
          type: "string",
          description: keep(CONTACT_FORM_DEFAULTS.thankYouHeading),
        }),
        defineField({
          name: "thankYouLine",
          title: "Thank you line",
          type: "string",
          description: keep(CONTACT_FORM_DEFAULTS.thankYouLine),
        }),
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
