import { defineField } from "sanity";

/**
 * Shared image metadata fields enforcing accessible, SEO-friendly alt text.
 *
 * Alt text is hard-required for meaningful images. If an image is purely
 * decorative, the editor marks it "Decorative" — alt then becomes optional
 * and the front-end renders an empty alt attribute (screen readers skip it).
 *
 * Spread `imageAltFields` into an image field's `fields` array. Append
 * `captionField` where a visible caption is also wanted.
 */

export const altField = defineField({
  name: "alt",
  title: "Alt Text",
  type: "string",
  description:
    "Describe the image for screen readers, SEO, and AI engines. Required unless the image is marked decorative.",
  validation: (rule) =>
    rule.custom((value, context) => {
      const parent = context.parent as { isDecorative?: boolean } | undefined;
      if (parent?.isDecorative) return true;
      if (typeof value !== "string" || value.trim().length === 0) {
        return "Alt text is required. If this image is purely decorative, mark it as decorative.";
      }
      return true;
    }),
});

export const decorativeField = defineField({
  name: "isDecorative",
  title: "Decorative image",
  type: "boolean",
  initialValue: false,
  description:
    "Enable only if this image is purely decorative and conveys no information. Screen readers and AI will skip it.",
});

export const captionField = defineField({
  name: "caption",
  title: "Caption",
  type: "string",
});

/** Alt + decorative toggle — the standard pair for every image field. */
export const imageAltFields = [altField, decorativeField];
