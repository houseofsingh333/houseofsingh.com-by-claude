import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageAsset } from "@/lib/sanityImage";

/*
 * Automatic project photographs (frames "Automatic layout" and "Your
 * control in Sanity"). A project's Photographs are an ordered list; each
 * has a Layout, Auto unless the editor chose otherwise. Auto reads the
 * photograph's shape from its Sanity metadata:
 *
 *   a landscape stands alone at the full content width;
 *   two portraits or squares in a row become a pair, three a row of three;
 *   a single portrait between landscapes stands alone, offset right, with
 *   the next paragraph of the story beside it.
 *
 * The story's paragraphs are placed between the groups: one after every
 * two groups, never two text blocks in a row; whatever is left closes the
 * story. Pure functions: the page renders what these return.
 */

export type PhotoLayout = "auto" | "fullWidth" | "fullBleed" | "half" | "offsetLeft" | "offsetRight" | "newRow";

export type StoryPhoto = SanityImageAsset & { _key: string; layout?: PhotoLayout | null };

export type PhotoGroup =
  | { kind: "wide"; photos: [StoryPhoto] }
  | { kind: "bleed"; photos: [StoryPhoto] }
  | { kind: "half"; photos: [StoryPhoto] }
  | { kind: "pair"; photos: [StoryPhoto, StoryPhoto] }
  | { kind: "three"; photos: [StoryPhoto, StoryPhoto, StoryPhoto] }
  | { kind: "single"; align: "left" | "right"; photos: [StoryPhoto] };

export type StoryItem =
  | { type: "group"; group: PhotoGroup; beside: PortableTextBlock[] | null }
  | { type: "text"; blocks: PortableTextBlock[] };

/** Wider than tall, by more than a hair. */
export function isLandscape(p: StoryPhoto): boolean {
  return !!p.width && !!p.height && p.width / p.height > 1.05;
}

/** Split a run of portraits and squares into pairs and rows of three. */
function runToGroups(run: StoryPhoto[]): PhotoGroup[] {
  const out: PhotoGroup[] = [];
  const halves = run.some((p) => p.layout === "half");
  let rest = run.slice();
  if (rest.length === 1) {
    return [rest[0].layout === "half" ? { kind: "half", photos: [rest[0]] } : { kind: "single", align: "right", photos: [rest[0]] }];
  }
  while (rest.length) {
    // Rows of three where possible (never for halves), pairs otherwise; no one left alone.
    const n = rest.length;
    const take = halves ? 2 : n === 2 || n === 4 ? 2 : 3;
    if (take === 3 && n >= 3) {
      out.push({ kind: "three", photos: [rest[0], rest[1], rest[2]] });
      rest = rest.slice(3);
    } else if (n >= 2) {
      out.push({ kind: "pair", photos: [rest[0], rest[1]] });
      rest = rest.slice(2);
    } else {
      out.push(rest[0].layout === "half" ? { kind: "half", photos: [rest[0]] } : { kind: "single", align: "right", photos: [rest[0]] });
      rest = [];
    }
  }
  return out;
}

/** The photographs as groups, in their order. */
export function groupPhotos(photos: StoryPhoto[]): PhotoGroup[] {
  const groups: PhotoGroup[] = [];
  let run: StoryPhoto[] = [];
  const flush = () => {
    if (run.length) groups.push(...runToGroups(run));
    run = [];
  };
  for (const p of photos) {
    if (!p?.url) continue;
    const layout = p.layout ?? "auto";
    if (layout === "newRow") flush();
    if (layout === "fullWidth") {
      flush();
      groups.push({ kind: "wide", photos: [p] });
    } else if (layout === "fullBleed") {
      flush();
      groups.push({ kind: "bleed", photos: [p] });
    } else if (layout === "offsetLeft" || layout === "offsetRight") {
      flush();
      groups.push({ kind: "single", align: layout === "offsetLeft" ? "left" : "right", photos: [p] });
    } else if (layout === "half") {
      if (run.some((q) => q.layout !== "half")) flush();
      run.push(p);
      if (run.length === 2) flush();
    } else if ((layout === "auto" || layout === "newRow") && isLandscape(p)) {
      flush();
      groups.push({ kind: "wide", photos: [p] });
    } else {
      if (run.some((q) => q.layout === "half")) flush();
      run.push(p);
    }
  }
  flush();
  return groups;
}

/** The story as units: each paragraph, with any heading kept with the paragraph after it. */
export function storyUnits(blocks: PortableTextBlock[] | null | undefined): PortableTextBlock[][] {
  const units: PortableTextBlock[][] = [];
  let heading: PortableTextBlock[] = [];
  for (const b of blocks ?? []) {
    const style = (b as { style?: string }).style ?? "normal";
    if (/^h\d$/.test(style)) {
      heading.push(b);
      continue;
    }
    units.push([...heading, b]);
    heading = [];
  }
  if (heading.length) units.push(heading);
  return units;
}

/**
 * Weave the story between the groups: a single portrait takes the next
 * paragraph beside it; otherwise one paragraph after every two groups;
 * never two text blocks in a row; what is left closes the story.
 */
export function weaveStory(groups: PhotoGroup[], units: PortableTextBlock[][]): StoryItem[] {
  const items: StoryItem[] = [];
  const queue = units.slice();
  let sinceText = 0;
  for (const group of groups) {
    const beside = group.kind === "single" && queue.length ? queue.shift()! : null;
    items.push({ type: "group", group, beside });
    sinceText = beside ? 0 : sinceText + 1;
    if (sinceText >= 2 && queue.length) {
      items.push({ type: "text", blocks: queue.shift()! });
      sinceText = 0;
    }
  }
  if (queue.length) {
    const rest = queue.flat();
    const last = items[items.length - 1];
    if (last?.type === "text") last.blocks = [...last.blocks, ...rest];
    else items.push({ type: "text", blocks: rest });
  }
  return items;
}
