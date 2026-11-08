/**
 * A statement never ends on a single word: its last two words are joined
 * by a no break space, so they move to the last line together. Only when
 * the pair is short enough (24 characters) to fit any line on a phone, so
 * it can never push text past the edge. Text without a space is returned
 * as it is. Used for short statements and titles that are longer than
 * the six lines CSS text-wrap: balance can even out (BRAND_BOOK.md,
 * Typography, line breaks).
 */
export function keepLastWords(text: string | null | undefined): string {
  const t = (text ?? "").trim();
  const i = t.lastIndexOf(" ");
  if (i <= 0) return t;
  const before = t.lastIndexOf(" ", i - 1);
  const pair = t.slice(before + 1);
  return pair.length <= 24 ? `${t.slice(0, i)} ${t.slice(i + 1)}` : t;
}
