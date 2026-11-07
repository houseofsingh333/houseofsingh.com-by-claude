import { defineField, defineType } from "sanity";
import { imageAltFields } from "./imageFields";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
    }),
    defineField({
      name: "footerText",
      title: "Footer Text",
      type: "string",
    }),
    defineField({
      name: "spotifyPlaylistUrl",
      title: "Spotify Playlist Embed URL",
      type: "url",
      description:
        "The embed URL for your Spotify playlist (e.g. https://open.spotify.com/embed/playlist/...)",
    }),

    /* ——— Home page, Chapter VI: the record ——— */
    defineField({
      name: "listeningHeading",
      title: "Listening: heading",
      type: "string",
      description: "Optional. Shown when empty: On my turntable",
    }),
    defineField({
      name: "listeningNote",
      title: "Listening: playlist note",
      type: "text",
      rows: 2,
      description:
        "Optional. The italic note under the heading. Shown when empty: This playlist showcases the music that keeps me inspired and in sync with my work.",
    }),
    defineField({
      name: "listeningIntro",
      title: "Listening: line",
      type: "text",
      rows: 2,
      description:
        "Optional. The reading line under the note. Shown when empty: What plays in my studio while I work. Press play and listen along; the record turns while the music plays.",
    }),
    defineField({
      name: "listeningSleeve",
      title: "Listening: record sleeve",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional. A square image for the record sleeve. When empty, a plain sleeve with the crest is shown.",
      fields: imageAltFields,
    }),

    /* ——— Home page, Chapter VII: the door to the studio ——— */
    defineField({
      name: "practiceLine",
      title: "The practice: line",
      type: "string",
      description:
        "Optional. The large line beside the House of Singh Studios panel. Shown when empty: Beyond the personal work, a studio for brands.",
    }),

    /* ——— The 404 page ——— */
    defineField({
      name: "notFoundImage",
      title: "Page not found: photograph",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional. The photograph on the page not found (404) page. When empty, the cover of the Range day journal entry is used.",
      fields: imageAltFields,
    }),

    /* ——— Global SEO defaults ——— */
    defineField({
      name: "defaultMetaDescription",
      title: "Default Meta Description",
      type: "text",
      rows: 3,
      description:
        "Site-wide fallback description for pages that don't set their own. Aim for ~160 characters.",
      validation: (rule) =>
        rule
          .max(180)
          .warning("Descriptions longer than ~160 characters are often truncated."),
    }),
    defineField({
      name: "organizationName",
      title: "Organization / Brand Name",
      type: "string",
      description: "Used in structured data and Open Graph (e.g. House of Singh).",
    }),
    defineField({
      name: "founderName",
      title: "Founder Name",
      type: "string",
      description: "Used in Person/Organization structured data (e.g. Maninder Singh).",
    }),
    defineField({
      name: "sameAs",
      title: "Social Profiles",
      type: "array",
      of: [{ type: "url" }],
      description:
        "Full URLs to official social profiles (Instagram, etc.). Output as sameAs links in structured data.",
    }),
    defineField({
      name: "googleVerification",
      title: "Google Site Verification Code",
      type: "string",
      description:
        "The content value from Google Search Console's HTML-tag verification method.",
    }),
  ],
});
