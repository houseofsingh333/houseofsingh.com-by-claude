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

/**
 * The first sentence of a text and what follows it. A sentence ends at ".",
 * "!" or "?" followed by a space or the end. With no sentence end, the
 * whole text is the first sentence.
 */
export function splitFirstSentence(text: string): { first: string; rest: string } {
  const m = text.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/);
  return m ? { first: m[1].trim(), rest: m[2].trim() } : { first: text.trim(), rest: "" };
}
