/**
 * scripts/import/markdown.mjs
 *
 * The Markdown body of an item.md, as Sanity rich text (Portable Text):
 * paragraphs, headings (## and ###), quotes (>), bulleted and numbered
 * lists, **bold**, *italic* and [links](https://...). A line holding only
 * an image, ![](file.jpg), places that photograph there (Journal only); its
 * alt text and caption come from the images list.
 */
import { randomUUID } from "node:crypto";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** Inline Markdown to Portable Text spans and link definitions. */
export function inline(text) {
  const children = [];
  const markDefs = [];
  // Links first, then bold and italic within each piece.
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_/g;
  let last = 0;
  let m;
  const push = (t, marks = []) => t && children.push({ _type: "span", _key: key(), text: t, marks });
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      const k = key();
      markDefs.push({ _type: "link", _key: k, href: m[2] });
      push(m[1], [k]);
    } else if (m[3] !== undefined || m[4] !== undefined) push(m[3] ?? m[4], ["strong"]);
    else push(m[5] ?? m[6], ["em"]);
    last = m.index + m[0].length;
  }
  push(text.slice(last));
  if (!children.length) push(" ");
  return { children, markDefs };
}

function block(text, style = "normal", list) {
  const { children, markDefs } = inline(text);
  return { _type: "block", _key: key(), style, markDefs, children, ...(list ? { listItem: list, level: 1 } : {}) };
}

/**
 * Markdown to Portable Text. `imageFor(file)` returns the image member for
 * a ![](file) line, or null when images are not allowed there; unknown
 * files are reported through `problems`.
 */
export function markdownToBlocks(md, { imageFor = () => null, problems = [] } = {}) {
  const blocks = [];
  const paragraphs = String(md ?? "").replace(/\r\n/g, "\n").split(/\n{2,}/);
  for (const para of paragraphs) {
    const lines = para.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim());
    if (!lines.length) continue;
    const img = lines.length === 1 && lines[0].trim().match(/^!\[[^\]]*\]\(([^)]+)\)$/);
    if (img) {
      const member = imageFor(img[1].trim());
      if (member) blocks.push(member);
      else problems.push(`![](${img[1]}) in the text: images can only be placed in the text of a Journal entry, and the file must be in the images list`);
      continue;
    }
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      for (const l of lines) blocks.push(block(l.replace(/^\s*[-*]\s+/, ""), "normal", "bullet"));
      continue;
    }
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      for (const l of lines) blocks.push(block(l.replace(/^\s*\d+[.)]\s+/, ""), "normal", "number"));
      continue;
    }
    const h = lines[0].match(/^(#{2,4})\s+(.*)$/);
    if (h && lines.length === 1) {
      blocks.push(block(h[2], `h${h[1].length}`));
      continue;
    }
    if (lines.every((l) => l.startsWith(">"))) {
      blocks.push(block(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), "blockquote"));
      continue;
    }
    blocks.push(block(lines.join(" ")));
  }
  return blocks;
}
