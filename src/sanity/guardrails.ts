/**
 * Studio guardrails (approved 13 Nov): the Studio warns before a photograph
 * or a description that would hurt the site's quality or speed is
 * published, so a mistake like a PNG portrait cannot slip in unnoticed.
 *
 * Photographs (every image field, except logos):
 * - a PNG with no transparency: warn, suggest a JPEG;
 * - a file over 5 MB: warn;
 * - narrower than the field needs (a hero slide or a project cover:
 *   2400px; any other photograph, Journal covers included: 1600px): warn;
 * - a hero slide or project cover under 1600px wide: an error (it cannot
 *   be published).
 * Alt text (required as before, unless marked decorative):
 * - generic ("House of Singh", "image", "photo", the file's name): warn;
 * - over 125 characters: warn.
 * Search titles and descriptions: in the SEO block (seo.ts).
 *
 * The checks are plain functions (tested in scripts/guardrails-test.ts);
 * withGuardrails() attaches them to every matching field when the Studio
 * loads (schemas/index.ts), so a new photograph field is covered without
 * remembering to. The Studio's own Content rules page explains them
 * (components/ContentRules.tsx; docs/studio-guardrails.md).
 */

export const MAX_BYTES = 5 * 1024 * 1024;
export const COVER_MIN = 2400;
export const PHOTO_MIN = 1600;
export const COVER_REFUSE = 1600;
export const ALT_MAX = 125;

export type PhotoKind = "cover" | "photo";

/** What the Studio knows about an uploaded file (its asset). */
export type AssetInfo = {
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  hasAlpha?: boolean | null;
  originalFilename?: string | null;
};

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** The warnings for a photograph, and the one problem that blocks publishing. */
export function photoChecks(a: AssetInfo, kind: PhotoKind): { warnings: string[]; error: string | null } {
  const warnings: string[] = [];
  let error: string | null = null;
  if (a.mimeType === "image/png" && a.hasAlpha === false) {
    warnings.push("This photograph is a PNG with no transparency: a JPEG of the same photograph is usually several times smaller and looks the same. Export it as JPEG (quality about 83) and upload that instead.");
  }
  if (typeof a.size === "number" && a.size > MAX_BYTES) {
    warnings.push(`This file is ${mb(a.size)}, over 5 MB. Export it smaller (JPEG, about 2800px wide for a cover, quality about 83).`);
  }
  if (typeof a.width === "number") {
    const need = kind === "cover" ? COVER_MIN : PHOTO_MIN;
    if (kind === "cover" && a.width < COVER_REFUSE) {
      error = `This cover is only ${a.width}px wide; a hero slide or project cover must be at least ${COVER_REFUSE}px (${COVER_MIN}px recommended), or it looks soft on large screens.`;
    } else if (a.width < need) {
      warnings.push(`This photograph is ${a.width}px wide; ${kind === "cover" ? "a hero slide or project cover" : "a photograph here"} should be at least ${need}px wide to stay sharp on large screens.`);
    }
  }
  return { warnings, error };
}

/** Words that describe nothing on their own. */
const GENERIC = new Set(["house of singh", "houseofsingh", "image", "photo", "photograph", "picture", "img", "untitled", "cover", "hero", "portrait", "maninder singh", "maninder"]);

/** A file's name as words: "IMG_1234-final.jpg" becomes "img 1234 final". */
const fileWords = (name: string) =>
  name
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[_\-.]+/g, " ")
    .trim()
    .toLowerCase();

/** The warnings for alt text (its absence is an error elsewhere). */
export function altChecks(alt: string | null | undefined, filename?: string | null): string[] {
  const text = (alt ?? "").trim();
  if (!text) return [];
  const warnings: string[] = [];
  const plain = text.toLowerCase().replace(/[.!]+$/, "").trim();
  const looksLikeFile = /\.(jpe?g|png|heic|webp|tiff?)$/i.test(text) || /^(img|dsc|dscf|pxl|photo)[\s_-]?\d+/i.test(text);
  if (GENERIC.has(plain) || looksLikeFile || (filename && plain === fileWords(filename))) {
    warnings.push("This alt text does not describe the photograph. Say what is in it, as you would to someone who cannot see it (for example: Maninder in a dark turban, seated on a wooden stool).");
  }
  if (text.length > ALT_MAX) {
    warnings.push(`This alt text is ${text.length} characters; keep it under ${ALT_MAX}, the most a screen reader reads comfortably. Put the rest in a caption.`);
  }
  return warnings;
}

/** Search title and description limits (the SEO block). */
export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 70;
export const DESCRIPTION_MAX = 160;

export function titleCheck(title: string | null | undefined): string | null {
  const t = (title ?? "").trim();
  return t.length > TITLE_MAX ? `This title is ${t.length} characters; search results cut titles after about ${TITLE_MAX}.` : null;
}

export function descriptionCheck(text: string | null | undefined): string | null {
  const t = (text ?? "").trim();
  if (!t) return null;
  if (t.length < DESCRIPTION_MIN) return `This description is ${t.length} characters; ${DESCRIPTION_MIN} to ${DESCRIPTION_MAX} gives search results a full sentence to show.`;
  if (t.length > DESCRIPTION_MAX) return `This description is ${t.length} characters; search results cut it after about ${DESCRIPTION_MAX}.`;
  return null;
}

/* ——— Attaching the checks to the schema ——— */

// The Studio's rule and context, loosely typed: these run inside Sanity's validation.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Rule = any;
type Field = Record<string, any>;

const API_VERSION = "2024-01-01";
const assetCache = new Map<string, Promise<AssetInfo | null>>();

/** The uploaded file's details, read once per file. */
function assetInfo(context: any, ref: string | undefined): Promise<AssetInfo | null> {
  if (!ref) return Promise.resolve(null);
  if (!assetCache.has(ref)) {
    const client = context.getClient({ apiVersion: API_VERSION });
    assetCache.set(
      ref,
      client
        .fetch(`*[_id == $id][0]{mimeType, size, originalFilename, "width": metadata.dimensions.width, "hasAlpha": metadata.hasAlpha}`, { id: ref })
        .catch(() => null),
    );
  }
  return assetCache.get(ref)!;
}

const refOf = (value: any): string | undefined => value?.asset?._ref;

/** The photograph rules for one image field: warnings, and the one error. */
export function photoRules(kind: PhotoKind) {
  return (rule: Rule) => [
    rule
      .custom(async (value: any, context: any) => {
        const info = await assetInfo(context, refOf(value));
        if (!info) return true;
        const { warnings } = photoChecks(info, kind);
        return warnings.length ? warnings.join(" ") : true;
      })
      .warning(),
    rule.custom(async (value: any, context: any) => {
      const info = await assetInfo(context, refOf(value));
      if (!info) return true;
      return photoChecks(info, kind).error ?? true;
    }),
  ];
}

/** The alt text warnings (the image's own file name comes from its parent). */
export function altRules() {
  return (rule: Rule) =>
    rule
      .custom(async (value: any, context: any) => {
        if (context.parent?.isDecorative) return true;
        const info = await assetInfo(context, refOf(context.parent));
        const warnings = altChecks(value, info?.originalFilename);
        return warnings.length ? warnings.join(" ") : true;
      })
      .warning();
}

/**
 * Fields that hold a hero or a project cover (2400px; an error under
 * 1600px), by document type and field name. Everything else, Journal covers
 * included, is a photograph (1600px, a warning only).
 */
const COVERS: Record<string, string[]> = {
  heroSlide: ["image"],
  project: ["coverImage"],
};

const isLogo = (name: string) => /logo|crest|icon|favicon/i.test(name);

/** Keeps a field's own validation and adds the guardrails after it. */
function addRules(field: Field, extra: (rule: Rule) => unknown) {
  const own = field.validation;
  return {
    ...field,
    validation: (rule: Rule) => {
      const mine = own ? own(rule) : [];
      const added = extra(rule);
      return [...(Array.isArray(mine) ? mine : [mine]), ...(Array.isArray(added) ? added : [added])];
    },
  };
}

function guardField(field: Field, docType: string): Field {
  let f = field;
  if (f.type === "image" && !isLogo(f.name ?? "") && f.options?.guardrails !== false) {
    const kind: PhotoKind = f.options?.photoKind ?? (COVERS[docType]?.includes(f.name) ? "cover" : "photo");
    f = addRules(f, photoRules(kind));
    if (Array.isArray(f.fields)) f = { ...f, fields: f.fields.map((x: Field) => (x.name === "alt" ? addRules(x, altRules()) : guardField(x, docType))) };
    return f;
  }
  if (Array.isArray(f.fields)) f = { ...f, fields: f.fields.map((x: Field) => guardField(x, docType)) };
  if (Array.isArray(f.of)) f = { ...f, of: f.of.map((x: Field) => guardField(x, docType)) };
  return f;
}

/** Every schema type, with the guardrails attached to its photographs and alt text. */
export function withGuardrails<T extends Field>(types: T[]): T[] {
  return types.map((t) => guardField(t, t.name) as T);
}
