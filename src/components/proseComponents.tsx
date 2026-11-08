import { Fragment } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { proseParts } from "@/lib/proseBlocks";

/** Headings inside rich text: Playfair, sized for a section within a page. */
const HEADING = "font-editorial font-normal text-foreground leading-[1.2] text-balance mt-10 mb-5 first:mt-0";
const H2 = `${HEADING} text-[length:clamp(26px,calc(23.37px_+_0.674vw),32px)]`;
const H3 = `${HEADING} text-[length:clamp(22px,calc(20.25px_+_0.449vw),26px)]`;

/**
 * Shared PortableText renderer: each paragraph gets an explicit bottom margin
 * so gaps are guaranteed regardless of arbitrary CSS selectors. A block typed
 * as one long story is split into its paragraphs at each blank line, and a
 * short bold line standing alone becomes a Playfair heading (proseParts in
 * lib/proseBlocks). Heading styles are set in Playfair too. Use this everywhere
 * rich text is rendered (about, project text blocks) rather than relying on
 * fragile descendant selectors like [&>p].
 */
/**
 * The renderer, with headings inside the text at a given level: h3 within a
 * section that has its own h2 (the default), h2 where the text sits directly
 * under the page title (a project's story), so the outline never skips a level.
 */
function makeProse(level: 2 | 3): PortableTextComponents {
  const Sub = level === 2 ? "h2" : "h3";
  const components: PortableTextComponents = {
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
                <Sub key={i} className={H3}>
                  {part.text}
                </Sub>
              ) : (
                <Fragment key={i}>
                  <PortableText value={[part.block]} components={components} />
                </Fragment>
              ),
            )}
          </>
        );
      },
      h1: ({ children }) => <h2 className={H2}>{children}</h2>,
      h2: ({ children }) => <h2 className={H2}>{children}</h2>,
      h3: ({ children }) => <Sub className={H3}>{children}</Sub>,
      h4: ({ children }) => (level === 2 ? <h3 className={H3}>{children}</h3> : <h4 className={H3}>{children}</h4>),
      blockquote: ({ children }) => (
        <blockquote className="my-8 font-editorial text-[length:clamp(22px,calc(20.25px_+_0.449vw),26px)] leading-[1.4] text-foreground">
          {children}
        </blockquote>
      ),
    },
  };
  return components;
}

export const proseComponents = makeProse(3);

/** For text directly under the page title, with no section heading above it (a project's story). */
export const storyProseComponents = makeProse(2);
