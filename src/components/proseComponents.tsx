import type { PortableTextComponents } from "@portabletext/react";

/**
 * Shared PortableText renderer: each paragraph gets an explicit bottom margin
 * so gaps are guaranteed regardless of arbitrary CSS selectors. Use this
 * everywhere rich text is rendered (about, project text blocks) rather than
 * relying on fragile descendant selectors like [&>p].
 */
export const proseComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-6 last:mb-0">{children}</p>,
  },
};
