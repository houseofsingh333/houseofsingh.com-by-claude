import type { PortableTextBlock } from "@portabletext/react";

/*
 * How a rich text block typed in Sanity is laid out (proseComponents).
 * Editors often type a whole story into ONE block: paragraphs separated by
 * a blank line ("\n\n" inside the span text) and a short bold line, such as
 * "INSPIRATION", standing alone between line breaks as a heading. This
 * splits such a block into its paragraphs and headings, keeping every
 * span's marks and links. A single "\n" inside a paragraph stays a line
 * break.
 */

type Child = { _type?: string; _key?: string; text?: string; marks?: string[] };

export type ProsePart =
  | { kind: "paragraph"; block: PortableTextBlock }
  | { kind: "heading"; text: string };

/** The longest bold line read as a heading. */
const HEADING_MAX = 40;

const textOf = (c: Child) => (c._type === "span" ? (c.text ?? "") : "￼");
const joined = (children: Child[]) => children.map(textOf).join("");
const isStrongOnly = (c: Child) =>
  c._type === "span" && !!c.marks?.length && c.marks.every((m) => m === "strong");

/** Remove line breaks and spaces from the start or end of a run of children. */
function trimEdge(children: Child[], edge: "start" | "end"): Child[] {
  const out = [...children];
  const pattern = edge === "start" ? /^[\s]+/ : /[\s]+$/;
  while (out.length) {
    const i = edge === "start" ? 0 : out.length - 1;
    const c = out[i];
    if (c._type !== "span") break;
    const text = (c.text ?? "").replace(pattern, "");
    if (text) {
      out[i] = { ...c, text };
      break;
    }
    out.splice(i, 1);
  }
  return out;
}

/** Split children wherever span text holds a blank line ("\n\n"). */
function paragraphsOf(children: Child[]): Child[][] {
  const paragraphs: Child[][] = [[]];
  for (const c of children) {
    if (c._type !== "span" || !/\n\s*\n/.test(c.text ?? "")) {
      paragraphs[paragraphs.length - 1].push(c);
      continue;
    }
    (c.text ?? "").split(/\n\s*\n/).forEach((text, i) => {
      if (i > 0) paragraphs.push([]);
      if (text) paragraphs[paragraphs.length - 1].push({ ...c, _key: `${c._key}-${i}`, text });
    });
  }
  return paragraphs;
}

/** All capitals become sentence case: headings are never all caps. */
export function headingCase(text: string): string {
  const t = text.trim();
  if (!/[A-Z]/.test(t) || t !== t.toUpperCase()) return t;
  return (t.charAt(0) + t.slice(1).toLowerCase()).replace(/\bi\b/g, "I");
}

/**
 * A paragraph's children as paragraphs and headings: a run of spans marked
 * only "strong", under HEADING_MAX characters, standing alone between line
 * breaks (or at the paragraph's start or end) is a heading.
 */
function withHeadings(children: Child[]): (Child[] | string)[] {
  for (let i = 0; i < children.length; i++) {
    if (!isStrongOnly(children[i])) continue;
    let j = i;
    while (j + 1 < children.length && isStrongOnly(children[j + 1])) j++;
    const run = joined(children.slice(i, j + 1));
    const title = run.trim();
    const before = joined(children.slice(0, i)) + run.slice(0, run.length - run.trimStart().length);
    const after = run.slice(run.trimEnd().length) + joined(children.slice(j + 1));
    const aloneBefore = !before.trim() || /\n[ \t]*$/.test(before);
    const aloneAfter = !after.trim() || /^[ \t]*\n/.test(after);
    if (title && title.length <= HEADING_MAX && !title.includes("\n") && aloneBefore && aloneAfter) {
      return [
        trimEdge(children.slice(0, i), "end"),
        title,
        ...withHeadings(trimEdge(children.slice(j + 1), "start")),
      ];
    }
    i = j;
  }
  return [children];
}

/**
 * A block as paragraphs and headings. A block with nothing to split comes
 * back as one paragraph holding the original block, untouched.
 */
export function proseParts(value: PortableTextBlock): ProsePart[] {
  const children = (value.children ?? []) as Child[];
  if (!children.length || value.listItem) return [{ kind: "paragraph", block: value }];
  const parts: ProsePart[] = [];
  paragraphsOf(children).forEach((paragraph, p) => {
    withHeadings(paragraph).forEach((piece, h) => {
      if (typeof piece === "string") {
        parts.push({ kind: "heading", text: headingCase(piece) });
        return;
      }
      const trimmed = trimEdge(trimEdge(piece, "start"), "end");
      if (!joined(trimmed).trim()) return;
      parts.push({
        kind: "paragraph",
        block: { ...value, _key: `${value._key ?? "b"}-${p}-${h}`, children: trimmed } as PortableTextBlock,
      });
    });
  });
  // Nothing to split: keep the block exactly as it came.
  if (parts.length === 1 && parts[0].kind === "paragraph" && joined(children) === joined(parts[0].block.children as Child[])) {
    return [{ kind: "paragraph", block: value }];
  }
  return parts;
}
