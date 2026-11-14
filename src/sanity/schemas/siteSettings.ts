import { defineArrayMember, defineField, defineType } from "sanity";
import { imageAltFields } from "./imageFields";
import { SITE_COPY_FIELDS } from "../../lib/siteCopy";
import { httpsRule } from "./rules";
import { BOOKING_URL } from "../../lib/booking";

/*
 * Site Settings, in tabs by area: Homepage chapters (one section per
 * chapter, I to VII, and the Coda; opens first), Menu, Projects page,
 * Journal page, Newsletter card, 404 page, Privacy and Terms, General
 * (title, tagline, footer) and Search (descriptions, names, profiles). Every
 * text field on the chapter tabs is optional: when empty, the text shown in
 * its description is used (lib/siteCopy.ts holds that text, and these fields
 * are made from it). The Journal page's line is the exception: empty hides it.
 */

const textFields = SITE_COPY_FIELDS.map((f) =>
  defineField({
    name: f.name,
    title: f.title,
    type: "multiline" in f && f.multiline ? "text" : "string",
    ...("multiline" in f && f.multiline ? { rows: 2 } : {}),
    group: f.group,
    ...("fieldset" in f ? { fieldset: f.fieldset } : {}),
    description: `Optional. When empty: ${f.text}`,
  }),
);

/** The menu photographs: field, title, and the default used when empty. */
const MENU_PHOTOS: [string, string, string][] = [
  ["menuPhotoHome", "Menu photograph: Home", "the first homepage hero photograph"],
  ["menuPhotoAbout", "Menu photograph: About", "the About portrait"],
  ["menuPhotoProjects", "Menu photograph: Projects", "the first project in homepage order"],
  ["menuPhotoJournal", "Menu photograph: Journal", "the latest journal entry's photograph, automatically"],
  ["menuPhotoContact", "Menu photograph: Contact", "the Contact portrait"],
];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  // By area of the site (approved 13 Nov): the homepage, edited most, opens first.
  groups: [
    { name: "homepage", title: "Homepage chapters", default: true },
    { name: "menu", title: "Menu" },
    { name: "projects", title: "Projects page" },
    { name: "journal", title: "Journal page" },
    { name: "newsletter", title: "Newsletter card" },
    { name: "notFound", title: "404 page" },
    { name: "legal", title: "Privacy and Terms" },
    { name: "general", title: "General" },
    { name: "search", title: "Search" },
  ],
  fieldsets: [
    // The chapters in the order of the page (14 Nov); their numerals follow
    // from which are shown (In the studio now only when its Spotlight is on).
    { name: "chapter1", title: "The opening, the crest", options: { collapsible: true, collapsed: true } },
    { name: "chapter2", title: "Chapter I, Introduction", options: { collapsible: true, collapsed: true } },
    { name: "chapter3", title: "Chapter II, Selected work", options: { collapsible: true, collapsed: true } },
    { name: "chapter4", title: "In the studio now (the Spotlight)", options: { collapsible: true, collapsed: true } },
    { name: "chapter5", title: "The notebook", options: { collapsible: true, collapsed: true } },
    { name: "chapter6", title: "The record", options: { collapsible: true, collapsed: true } },
    { name: "chapter7", title: "The practice", options: { collapsible: true, collapsed: true } },
    { name: "coda", title: "Coda, the footer", options: { collapsible: true, collapsed: true } },
    { name: "privacy", title: "Privacy: In short lines", options: { collapsible: true, collapsed: true } },
    { name: "terms", title: "Terms: In short lines", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "general",
    }),
    defineField({
      name: "footerText",
      title: "Footer Text",
      type: "string",
      group: "general",
    }),

    /* ——— Homepage chapters: the pieces that are not plain text ——— */
    defineField({
      name: "spotifyPlaylistUrl",
      title: "Spotify Playlist Embed URL",
      type: "url",
      group: "homepage",
      fieldset: "chapter6",
      validation: (rule) => httpsRule(rule),
      description:
        "Your Spotify playlist's address (https://open.spotify.com/playlist/... or its embed address). Shown as the compact player.",
    }),
    defineField({
      name: "codaBookUrl",
      title: "Booking address (the button above the footer)",
      type: "url",
      group: "homepage",
      fieldset: "coda",
      description: `Optional. A full https:// address, opened in a new tab. When empty: ${BOOKING_URL}`,
      validation: (rule) => httpsRule(rule),
    }),
    defineField({
      name: "studioWorkCards",
      title: "Studio work panels",
      type: "array",
      group: "homepage",
      fieldset: "chapter7",
      description:
        "Optional. Up to three tall photographs beside the studio line, in this order; each opens its own link in a new tab. With two, two show; with none, the photographs are hidden and the rest of the chapter stays.",
      validation: (rule) => rule.max(3),
      of: [
        defineArrayMember({
          type: "object",
          name: "studioWorkCard",
          title: "Studio work panel",
          fields: [
            defineField({
              name: "image",
              title: "Photograph",
              type: "image",
              description: "Shown tall and cropped to fit: set the hotspot on what must stay in view.",
              options: { hotspot: true },
              validation: (rule) => rule.required(),
              fields: [
                defineField({
                  name: "alt",
                  title: "Alt Text",
                  type: "string",
                  description: "Describe the image for screen readers. Required.",
                  validation: (rule) => rule.required(),
                }),
              ],
            }),
            defineField({
              name: "clientName",
              title: "Client name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "service",
              title: "Service",
              type: "string",
              description: "For example Brand identity. Shown beside the client name when the panel is opened.",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "link",
              title: "Link",
              type: "url",
              description: "Any full https:// address, for example a case study on https://studios.houseofsingh.com/... It opens in a new tab.",
              validation: (rule) => httpsRule(rule.required()),
            }),
          ],
          preview: { select: { title: "clientName", subtitle: "service", media: "image" } },
        }),
      ],
    }),

    /* ——— 404 page ——— */
    defineField({
      name: "notFoundImage",
      title: "Photograph",
      type: "image",
      group: "notFound",
      options: { hotspot: true },
      description:
        "Optional. The photograph on the page not found (404) page. When empty, the cover of the Range day journal entry is used.",
      fields: imageAltFields,
    }),

    /* ——— Chapter II, Selected work: one project (approved 14 Nov) ——— */
    defineField({
      name: "featuredProject",
      title: "The selected project",
      type: "reference",
      to: [{ type: "project" }],
      group: "homepage",
      fieldset: "chapter3",
      description:
        "The one project shown at full width under Selected work, with its title, category, line and a link to it. When empty, the first project in Homepage Order is used.",
    }),

    /* ——— Menu: one photograph per page (approved 10 Nov) ——— */
    ...MENU_PHOTOS.map(([name, title, fallback]) =>
      defineField({
        name,
        title,
        type: "image",
        group: "menu",
        options: { hotspot: true },
        description: `Optional. Shown on the right half of the menu while this page is pointed at, and when the menu opens on this page. Set the hotspot on the subject. When empty, ${fallback} is used.`,
        fields: [
          defineField({
            name: "alt",
            title: "Alt Text",
            type: "string",
            description: "Describe the photograph for screen readers, SEO, and AI engines.",
            validation: (rule) => rule.required().error("Alt text is required for a menu photograph."),
          }),
        ],
      }),
    ),

    /* ——— Every text: generated from lib/siteCopy.ts ——— */
    ...textFields,
    defineField({
      name: "journalTagline",
      title: "Line under Journal",
      type: "string",
      group: "journal",
      description:
        "Optional. The short line under the Journal heading, for example: A diary in photographs. Leave empty to hide it.",
    }),

    /* ——— Global SEO defaults ——— */
    defineField({
      name: "defaultMetaDescription",
      title: "Default Meta Description",
      type: "text",
      rows: 3,
      group: "search",
      description:
        "Site-wide fallback description for pages that don't set their own. Aim for 120 to 155 characters.",
      validation: (rule) =>
        rule
          .max(155)
          .warning("Descriptions longer than 155 characters are often cut off in search results."),
    }),
    defineField({
      name: "organizationName",
      title: "Organization / Brand Name",
      type: "string",
      group: "search",
      description: "Used in structured data and Open Graph (e.g. House of Singh).",
    }),
    defineField({
      name: "founderName",
      title: "Founder Name",
      type: "string",
      group: "search",
      description: "Used in Person/Organization structured data (e.g. Maninder Singh).",
    }),
    defineField({
      name: "sameAs",
      title: "Social Profiles",
      type: "array",
      group: "search",
      of: [{ type: "url", validation: (rule) => httpsRule(rule) }],
      description:
        "Full URLs to official social profiles (Instagram, etc.). Output as sameAs links in structured data.",
    }),
    defineField({
      name: "googleVerification",
      title: "Google Site Verification Code",
      type: "string",
      group: "search",
      description:
        "The content value from Google Search Console's HTML-tag verification method.",
    }),
  ],
});
