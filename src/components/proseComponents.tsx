import { Fragment } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { proseParts } from "@/lib/proseBlocks";

/** Headings inside rich text: Playfair, sized for a section within a page. */
const HEADING = "font-editorial font-normal text-foreground leading-[1.2] text-balance mt-10 mb-5 first:mt-0";
const H2 = `${HEADING} text-[26px] md:text-[32px]`;
const H3 = `${HEADING} text-[22px] md:text-[26px]`;

/**
 * Shared PortableText renderer: each paragraph gets an explicit bottom margin
 * so gaps are guaranteed regardless of arbitrary CSS selectors. A block typed
 * as one long story is split into its paragraphs at each blank line, and a
 * short bold line standing alone becomes a Playfair heading (proseParts in
 * lib/proseBlocks). Heading styles are set in Playfair too. Use this everywhere
 * rich text is rendered (about, project text blocks) rather than relying on
 * fragile descendant selectors like [&>p].
 */
export const proseComponents: PortableTextComponents = {
  block: {
    normal: ({ children, value }) => {
      const parts = proseParts(value);
      if (parts.length === 1 && parts[0].kind === "paragraph" && parts[0].block === value) {
        return <p className="mb-6 last:mb-0">{children}</p>;
      }
      return (
        <>
          {parts.map((part, i) =>
            part.kind === "heading" ? (
              <h3 key={i} className={H3}>
                {part.text}
              </h3>
            ) : (
              <Fragment key={i}>
                <PortableText value={[part.block]} components={proseComponents} />
              </Fragment>
            ),
          )}
        </>
      );
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
