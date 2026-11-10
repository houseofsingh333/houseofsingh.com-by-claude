import { Children, Fragment, type ReactNode } from "react";

/**
 * "House of Singh Studios", wherever it appears in text from Sanity, links
 * to the studio site: the first mention in each paragraph or text block,
 * in the shared drawn hairline (.hairline-rest: running text links show a
 * faint line at rest), opening in a new tab.
 *
 * Used by every renderer of Sanity reading text: the shared Portable Text
 * renderer (lib proseComponents, so journal entries, project stories and
 * About's text) through linkStudioChildren, and plain text fields (About's
 * answers and pull quote, the home introduction, project excerpts and
 * intros, journal notes, the Journey description on touch screens, the
 * legal summaries) through linkStudio.
 *
 * Not used for headings, buttons, labels, navigation, the footer, alt text,
 * metadata or structured data, and never inside a link: those render their
 * text as it is. The words may be joined by no-break spaces (keepLastWords),
 * and are matched either way.
 */
const STUDIO_URL = "https://studios.houseofsingh.com";
const PHRASE = /House[\s ]+of[\s ]+Singh[\s ]+Studios/;

function StudioAnchor({ text }: { text: string }) {
  return (
    <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer" className="hairline-rest">
      {text}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** A plain text with its first "House of Singh Studios" linked; unchanged when there is none. */
export function linkStudio(text: string | null | undefined): ReactNode {
  if (!text) return text;
  const m = PHRASE.exec(text);
  if (!m) return text;
  return (
    <>
      {text.slice(0, m.index)}
      <StudioAnchor text={m[0]} />
      {text.slice(m.index + m[0].length)}
    </>
  );
}

/**
 * A paragraph's rendered children (Portable Text) with the first mention in
 * its plain text linked. Text already inside a link, or inside any other
 * mark (which renders as an element), is left as it is.
 */
export function linkStudioChildren(children: ReactNode): ReactNode {
  let done = false;
  return Children.map(children, (child) => {
    if (done || typeof child !== "string" || !PHRASE.test(child)) return child;
    done = true;
    return <Fragment>{linkStudio(child)}</Fragment>;
  });
}
