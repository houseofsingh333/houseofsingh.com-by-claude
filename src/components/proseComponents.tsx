import type { PortableTextBlock, PortableTextComponents } from "@portabletext/react";

/** Headings inside rich text: Playfair, sized for a section within a page. */
const HEADING = "font-editorial font-normal text-foreground leading-[1.2] text-balance mt-10 mb-5 first:mt-0";
const H2 = `${HEADING} text-[26px] md:text-[32px]`;
const H3 = `${HEADING} text-[22px] md:text-[26px]`;

type Span = { _type?: string; text?: string; marks?: string[] };

/**
 * A short line that is bold from start to end and stands alone (for
 * example "Inspiration"): an editor's heading typed as a paragraph. Shown
 * as a Playfair heading, without the bold.
 */
function loneBoldLine(value: PortableTextBlock): string | null {
  const children = (value.children ?? []) as Span[];
  if (!children.length || value.listItem) return null;
  const text = children.map((c) => c.text ?? "").join("").trim();
  const allBold = children.every((c) => !c.text?.trim() || c.marks?.includes("strong"));
  return allBold && text.length > 0 && text.length <= 60 && !/[.!?]$/.test(text) ? text : null;
}

/**
 * Shared PortableText renderer: each paragraph gets an explicit bottom margin
 * so gaps are guaranteed regardless of arbitrary CSS selectors. Headings (and
 * lone bold lines used as headings) are set in Playfair. Use this everywhere
 * rich text is rendered (about, project text blocks) rather than relying on
 * fragile descendant selectors like [&>p].
 */
export const proseComponents: PortableTextComponents = {
  block: {
    normal: ({ children, value }) => {
      const heading = loneBoldLine(value);
      return heading ? <h3 className={H3}>{heading}</h3> : <p className="mb-6 last:mb-0">{children}</p>;
    },
    h1: ({ children }) => <h2 className={H2}>{children}</h2>,
    h2: ({ children }) => <h2 className={H2}>{children}</h2>,
    h3: ({ children }) => <h3 className={H3}>{children}</h3>,
    h4: ({ children }) => <h4 className={H3}>{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="my-8 font-editorial italic text-[22px] md:text-[26px] leading-[1.4] text-foreground">
        {children}
      </blockquote>
    ),
  },
};
