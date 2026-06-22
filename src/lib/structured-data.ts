/**
 * JSON-LD structured data builders.
 *
 * Pure, side-effect-free functions that return plain objects ready to be
 * serialized into <script type="application/ld+json">. Every builder degrades
 * gracefully: missing fields (author, date, image, …) are omitted rather than
 * emitted as empty or invalid values.
 *
 * Values come from Sanity (with sensible fallbacks) — nothing user-facing here
 * is hardcoded to a single document.
 */

import type {
  SiteSettings,
  JournalEntry,
  ProjectDetail,
  RapidFireItem,
  SanityImage,
} from "@/lib/types";

export const SITE_URL = "https://houseofsingh.com";

const DEFAULTS = {
  organizationName: "House of Singh",
  founderName: "Maninder Singh",
  // The House of Singh brand mark — a real, stable asset. Used as both the
  // Organization logo and the Person image: it's the canonical identity image
  // for the "House of Singh" persona (the Person node's alternateName), and is
  // more semantically correct here than the wide 1200x630 social OG card.
  logo: "/images/hos-logo.svg",
  personImage: "/images/hos-logo.svg",
  description:
    "The creative world of Maninder Singh. Design, photography, and intentional living. Based in Toronto.",
  sameAs: ["https://www.instagram.com/houseofsingh"],
};

type Json = Record<string, unknown>;

/** Drop undefined/null, empty strings, and empty arrays so output stays valid. */
function compact(obj: Json): Json {
  const out: Json = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

/** Turn a relative path or CDN URL into an absolute URL; undefined if empty. */
function absoluteUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Extract an absolute image URL from a Sanity image field (object or string). */
function imageUrl(image?: SanityImage | null): string | undefined {
  if (!image) return undefined;
  const raw = typeof image === "string" ? image : image.url;
  return absoluteUrl(raw);
}

/** Normalize a date string to ISO 8601; undefined if missing/invalid. */
function toIso(date?: string | null): string | undefined {
  if (!date) return undefined;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

// ——— Shared organization node (used standalone + as publisher) ———

function organizationNode(settings?: SiteSettings | null): Json {
  const name =
    settings?.organizationName?.trim() || DEFAULTS.organizationName;
  const sameAs =
    settings?.sameAs && settings.sameAs.length > 0
      ? settings.sameAs
      : DEFAULTS.sameAs;

  return compact({
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name,
    url: SITE_URL,
    logo: compact({
      "@type": "ImageObject",
      url: absoluteUrl(DEFAULTS.logo),
    }),
    sameAs,
  });
}

// ——— Sitewide: Person + Organization + WebSite ———

/**
 * Sitewide structured data rendered once in the root layout.
 *
 * No SearchAction is included: the site has no search endpoint. Add one here
 * (WebSite → potentialAction → SearchAction) if/when site search ships.
 */
export function buildSiteJsonLd(settings?: SiteSettings | null): Json[] {
  const founderName =
    settings?.founderName?.trim() || DEFAULTS.founderName;
  const orgName =
    settings?.organizationName?.trim() || DEFAULTS.organizationName;
  const description =
    settings?.defaultMetaDescription?.trim() || DEFAULTS.description;
  const sameAs =
    settings?.sameAs && settings.sameAs.length > 0
      ? settings.sameAs
      : DEFAULTS.sameAs;

  const person = compact({
    "@context": "https://schema.org",
    "@type": "Person",
    name: founderName,
    alternateName: orgName,
    url: SITE_URL,
    image: absoluteUrl(DEFAULTS.personImage),
    jobTitle: "Creative Director",
    description:
      "Multidisciplinary designer and photographer based in Toronto",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toronto",
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
    sameAs,
  });

  const organization = {
    "@context": "https://schema.org",
    ...organizationNode(settings),
  };

  const website = compact({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: orgName,
    url: SITE_URL,
    description,
    author: { "@type": "Person", name: founderName },
  });

  return [person, organization, website];
}

// ——— Journal entry: BlogPosting (Article subtype) ———

export function buildArticleJsonLd(
  entry: JournalEntry,
  settings?: SiteSettings | null,
): Json {
  const datePublished = toIso(entry.date);
  const dateModified = toIso(entry.updatedAt) ?? datePublished;
  const author = entry.author?.trim() || DEFAULTS.founderName;

  return {
    "@context": "https://schema.org",
    ...compact({
      "@type": "BlogPosting",
      headline: entry.title,
      description: entry.excerpt,
      image: imageUrl(entry.coverImage),
      datePublished,
      dateModified,
      author: compact({ "@type": "Person", name: author }),
      publisher: organizationNode(settings),
      mainEntityOfPage: `${SITE_URL}/journal/${entry.slug}`,
    }),
  };
}

// ——— Project: CreativeWork ———

export function buildCreativeWorkJsonLd(
  project: ProjectDetail,
  settings?: SiteSettings | null,
): Json {
  const author = project.author?.trim() || DEFAULTS.founderName;

  return {
    "@context": "https://schema.org",
    ...compact({
      "@type": "CreativeWork",
      name: project.title,
      description: project.excerpt,
      genre: project.category,
      image: imageUrl(project.coverImage),
      dateCreated: toIso(project.publishedAt),
      dateModified: toIso(project.updatedAt),
      author: compact({ "@type": "Person", name: author }),
      publisher: organizationNode(settings),
      url: `${SITE_URL}/projects/${project.slug}`,
    }),
  };
}

// ——— Breadcrumbs (detail pages) ———

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// ——— FAQ (About page Rapid Fire) ———

/** Returns null when there are no valid Q&A pairs, so the caller can omit it. */
export function buildFaqJsonLd(
  rapidFire?: RapidFireItem[] | null,
): Json | null {
  const items = (rapidFire ?? []).filter(
    (qa) => qa?.question?.trim() && qa?.answer?.trim(),
  );
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: { "@type": "Answer", text: qa.answer },
    })),
  };
}
