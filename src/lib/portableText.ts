import type { PortableTextBlock } from "@portabletext/react";

/**
 * Portable Text as plain paragraphs: one string per text block, marks and
 * links dropped. For layouts that set a block's words differently (a lifted
 * statement, a pull quote), not for rich reading text, which still goes
 * through proseComponents.
 */
export function plainParagraphs(blocks: PortableTextBlock[] | null | undefined): string[] {
  if (!blocks) return [];
  return blocks
    .filter((b) => b._type === "block" && Array.isArray(b.children))
    .map((b) =>
      (b.children as { text?: string }[])
        .map((c) => c.text ?? "")
        .join("")
        .trim(),
    )
    .filter(Boolean);
}

/** A text split into sentences (each keeps its closing mark and quotes). */
function sentences(text: string): string[] {
  return (text.match(/[^.!?]+(?:[.!?]+["”’)]*|$)/g) ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Sentences joined into short paragraphs: at most 3 sentences or about 320 characters. */
function shortParagraphs(text: string): string[] {
  const out: string[] = [];
  let current: string[] = [];
  for (const s of sentences(text)) {
    const length = current.join(" ").length + s.length;
    if (current.length && (current.length >= 3 || length > 320)) {
      out.push(current.join(" "));
      current = [];
    }
    current.push(s);
  }
  if (current.length) out.push(current.join(" "));
  return out;
}

export type StoryItem =
  | { kind: "block"; block: PortableTextBlock }
  | { kind: "text"; text: string }
  | { kind: "quote"; text: string };

type Span = { _type?: string; text?: string; marks?: string[] };

/** A plain paragraph: normal style, not a list, no marks or links. */
function plainText(b: PortableTextBlock): string | null {
  if (b._type !== "block" || (b.style && b.style !== "normal") || "listItem" in b) return null;
  const children = (b.children ?? []) as Span[];
  if (!children.every((c) => c._type === "span" && !(c.marks && c.marks.length))) return null;
  return children.map((c) => c.text ?? "").join("").trim();
}

/**
 * A bio as a story: plain paragraphs split into short ones, with one
 * sentence lifted out as a pull quote, set where it stood. The sentence is
 * `chosen` when it appears in a plain paragraph, otherwise the longest
 * sentence of 60 to 220 characters after the first. Paragraphs with links,
 * emphasis or other formatting are kept whole, for proseComponents.
 */
export function storyFlow(
  blocks: PortableTextBlock[] | null | undefined,
  chosen?: string | null,
): StoryItem[] {
  if (!blocks) return [];
  const texts = blocks.map(plainText);
  let quote = chosen?.trim() || "";
  if (!quote || !texts.some((t) => t?.includes(quote))) {
    quote = texts
      .flatMap((t) => (t ? sentences(t) : []))
      .slice(1)
      .filter((s) => s.length >= 60 && s.length <= 220)
      .reduce((best, s) => (s.length > best.length ? s : best), "");
  }

  const out: StoryItem[] = [];
  let placed = false;
  blocks.forEach((block, i) => {
    const text = texts[i];
    if (text === null) return void out.push({ kind: "block", block });
    if (!text) return;
    const at = !placed && quote ? text.indexOf(quote) : -1;
    if (at < 0) {
      shortParagraphs(text).forEach((t) => out.push({ kind: "text", text: t }));
      return;
    }
    placed = true;
    shortParagraphs(text.slice(0, at)).forEach((t) => out.push({ kind: "text", text: t }));
    out.push({ kind: "quote", text: quote });
    shortParagraphs(text.slice(at + quote.length)).forEach((t) => out.push({ kind: "text", text: t }));
  });
  return out;
}
