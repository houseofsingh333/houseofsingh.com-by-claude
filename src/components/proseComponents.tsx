import { PortableText, type PortableTextBlock, type PortableTextComponents } from "@portabletext/react";

/** Headings inside rich text: Playfair, sized for a section within a page. */
const HEADING = "font-editorial font-normal text-foreground leading-[1.2] text-balance mt-10 mb-5 first:mt-0";
const H2 = `${HEADING} text-[26px] md:text-[32px]`;
const H3 = `${HEADING} text-[22px] md:text-[26px]`;

type Span = { _type?: string; _key?: string; text?: string; marks?: string[] };

/** A heading's text: short, and not a sentence. */
function headingText(text: string): string | null {
  const t = text.trim();
  return t.length > 0 && t.length <= 60 && !/[.!?]$/.test(t) ? t : null;
}

/**
 * A paragraph that opens with a short bold run followed by a line break,
 * then its text (for example "Inspiration", a line break, and the story),
 * as typed in Sanity: the bold run is the paragraph's heading. Returns the
 * heading and the rest of the block, or null.
 */
function leadingHeading(value: PortableTextBlock): { heading: string; rest: PortableTextBlock } | null {
  const children = (value.children ?? []) as Span[];
  if (!children.length || value.listItem) return null;
  let heading = "";
  for (let i = 0; i < children.length; i++) {
    const c = children[i];
    const text = c.text ?? "";
    const isBold = c._type === "span" && !!c.marks?.includes("strong");
    const lineBreak = text.indexOf("\n");
    let after: string;
    if (isBold) {
      if (lineBreak < 0) {
        heading += text;
        continue;
      }
      heading += text.slice(0, lineBreak);
      after = text.slice(lineBreak + 1);
    } else {
      // The first plain text must begin with the line break.
      if (lineBreak < 0 || text.slice(0, lineBreak).trim() !== "") return null;
      after = text.slice(lineBreak + 1);
    }
    const title = headingText(heading);
    const restChildren = [...(after.trim() ? [{ ...c, text: after.replace(/^\n+/, "") }] : []), ...children.slice(i + 1)];
    if (!title || !restChildren.some((r) => (r.text ?? "").trim())) return null;
    return { heading: title, rest: { ...value, children: restChildren } as PortableTextBlock };
  }
  return null;
}

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
 * so gaps are guaranteed regardless of arbitrary CSS selectors. Headings,
 * lone bold lines used as headings, and a bold run opening a paragraph
 * before a line break are set in Playfair. Use this everywhere
 * rich text is rendered (about, project text blocks) rather than relying on
 * fragile descendant selectors like [&>p].
 */
export const proseComponents: PortableTextComponents = {
  block: {
    normal: ({ children, value }) => {
      const heading = loneBoldLine(value);
      if (heading) return <h3 className={H3}>{heading}</h3>;
      const lead = leadingHeading(value);
      if (lead) {
        return (
          <>
            <h3 className={H3}>{lead.heading}</h3>
            <PortableText value={[lead.rest]} components={proseComponents} />
          </>
        );
      }
      return <p className="mb-6 last:mb-0">{children}</p>;
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
