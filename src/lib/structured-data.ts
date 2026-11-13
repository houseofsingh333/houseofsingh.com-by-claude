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
import type { SanityImageAsset } from "@/lib/sanityImage";
import { toIsoTimestamp } from "@/lib/dates";
import { placesNamedIn } from "@/lib/places";

const SITE_URL = "https://houseofsingh.com";
const STUDIO_URL = "https://studios.houseofsingh.com";

/**
 * Stable entity @ids, shared with studios.houseofsingh.com.
 *
 * This site OWNS the Person and the parent-brand Organization: it is the only
 * place they are defined. The studio Organization is owned by the studio site
 * and is only ever REFERENCED here by @id, never redefined.
 *
 * Do not change these strings. They are the join keys that let search engines
 * and language models treat both sites as one entity graph. Renaming an @id
 * silently splits the entity in two.
 */
const PERSON_ID = `${SITE_URL}/#maninder-singh`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const STUDIO_ORGANIZATION_ID = `${STUDIO_URL}/#organization`;
/** Added alongside the three shared ids: lets every page say which site it belongs to. */
const WEBSITE_ID = `${SITE_URL}/#website`;
/** The journal as a Blog, referenced by every entry and month. */
const BLOG_ID = `${SITE_URL}/journal#blog`;

/**
 * The Person's portrait: the About portrait, in this site's own Sanity
 * project (31g7gu7n), pinned here so the Person node never changes by
 * accident. Approved 13 Nov: until then it pointed at an image in the
 * studio site's project (00iree4d); that project stays (it is the live
 * studio site's) and the studio site keeps its own Person image, so the two
 * sites now publish different portrait addresses for the same Person.
 * If the About portrait is replaced in the Studio, update this address
 * (the old image stays in Sanity until it is deleted, so nothing breaks).
 */
const PERSON_IMAGE =
  "https://cdn.sanity.io/images/31g7gu7n/production/8e7fb67313ccf4dd67303e8e782a7d0f23f23cec-1121x1403.jpg";

/**
 * Person sameAs is pinned here rather than read from Sanity: these profiles
 * must stay identical to the studio site's Person node. The Organization's
 * sameAs stays CMS-driven.
 */
const PERSON_SAME_AS = [
  "https://rgd.ca/members/profile/manindersingh",
  "https://www.linkedin.com/in/manindersingh333",
  "https://www.instagram.com/houseofsingh/",
  "https://x.com/houseofsingh",
  "https://ca.pinterest.com/houseofsingh",
];

const DEFAULTS = {
  organizationName: "House of Singh",
  founderName: "Maninder Singh",
  // The House of Singh brand mark, a real and stable asset, used as the
  // Organization logo. The Person image is PERSON_IMAGE above.
  logo: "/images/hos-logo.svg",
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

// ——— Organization nodes ———

function orgName(settings?: SiteSettings | null): string {
  return settings?.organizationName?.trim() || DEFAULTS.organizationName;
}

function orgSameAs(settings?: SiteSettings | null): string[] {
  return settings?.sameAs && settings.sameAs.length > 0
    ? settings.sameAs
    : DEFAULTS.sameAs;
}

function orgLogo(): Json {
  return compact({
    "@type": "ImageObject",
    url: absoluteUrl(DEFAULTS.logo),
  });
}

/**
 * The full parent-brand Organization, defined once in the sitewide @graph.
 *
 * subOrganization references the studio by @id only. The studio site owns that
 * node and defines its own name, founding date and description there.
 */
function organizationNode(settings?: SiteSettings | null): Json {
  return compact({
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: orgName(settings),
    url: SITE_URL,
    logo: orgLogo(),
    foundingDate: "2014",
    founder: { "@id": PERSON_ID },
    description:
      "The creative practice and parent brand of Maninder Singh. HOUSE OF SINGH is a registered Canadian trademark.",
    sameAs: orgSameAs(settings),
    subOrganization: [
      {
        "@type": "Organization",
        "@id": STUDIO_ORGANIZATION_ID,
        name: "House of Singh Studios",
        url: STUDIO_URL,
      },
    ],
  });
}

/**
 * Lean publisher node for Article and CreativeWork.
 *
 * Shares the Organization's @id, so consumers merge it with the full node in
 * the sitewide @graph on the same page. Kept deliberately minimal: repeating
 * founder and subOrganization in every article's publisher adds bytes without
 * adding meaning.
 */
function publisherNode(settings?: SiteSettings | null): Json {
  return compact({
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: orgName(settings),
    url: SITE_URL,
    logo: orgLogo(),
    sameAs: orgSameAs(settings),
  });
}

// ——— Sitewide: Person + Organization + WebSite ———

/**
 * Sitewide structured data rendered once in the root layout.
 *
 * Emitted as a single @graph with one shared @context, so the three nodes are
 * explicitly connected instead of sitting in the page as unrelated items.
 * Cross-references use @id only, which is what lets the studio site's Person
 * and this site's Person resolve to the same entity.
 *
 * No SearchAction is included: the site has no search endpoint. Add one here
 * (WebSite → potentialAction → SearchAction) if/when site search ships.
 */
export function buildSiteJsonLd(settings?: SiteSettings | null): Json {
  const founderName =
    settings?.founderName?.trim() || DEFAULTS.founderName;
  const name = orgName(settings);
  const description =
    settings?.defaultMetaDescription?.trim() || DEFAULTS.description;

  const person = compact({
    "@type": "Person",
    "@id": PERSON_ID,
    name: founderName,
    alternateName: name,
    honorificSuffix: "RGD",
    url: SITE_URL,
    jobTitle: "Founder and Creative Director",
    description:
      "Creative director, photographer and multidisciplinary designer based in Toronto, Canada.",
    image: PERSON_IMAGE,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toronto",
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
    memberOf: {
      "@type": "Organization",
      name: "RGD (Registered Graphic Designers of Canada)",
      url: "https://rgd.ca",
    },
    knowsAbout: [
      "Brand identity",
      "Creative direction",
      "Art direction",
      "Photography",
      "Packaging design",
      "Web design",
    ],
    worksFor: { "@id": STUDIO_ORGANIZATION_ID },
    sameAs: PERSON_SAME_AS,
  });

  const website = compact({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name,
    url: SITE_URL,
    description,
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORGANIZATION_ID },
  });

  return {
    "@context": "https://schema.org",
    "@graph": [person, organizationNode(settings), website],
  };
}

// ——— ProfilePage (home page only) ———

/**
 * Marks the home page as the authoritative profile page for the Person.
 *
 * mainEntity is an @id reference: the Person itself is defined once, in the
 * sitewide @graph, which is present on this same page.
 */
export function buildProfilePageJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@id": PERSON_ID },
  };
}

// ——— Authors ———

/**
 * The author field as Person nodes. A field naming several people
 * ("Maninder Singh, Simranjeet Singh") becomes one Person each, and
 * Maninder is always the site's own Person by its @id, so search engines
 * and language models never see him as a second, unnamed entity.
 */
function authorNodes(raw?: string | null): Json | Json[] {
  const names = (raw?.trim() || DEFAULTS.founderName)
    .split(/\s*(?:,|&|\band\b)\s*/i)
    .map((n) => n.trim())
    .filter(Boolean);
  const nodes = names.map((name) =>
    name.toLowerCase() === DEFAULTS.founderName.toLowerCase()
      ? { "@type": "Person", "@id": PERSON_ID, name }
      : { "@type": "Person", name },
  );
  return nodes.length === 1 ? nodes[0] : nodes;
}

// ——— Journal: the Blog, its months and its entries ———

/** The Blog, referenced by @id; name and url so it reads on its own too. */
function blogRef(): Json {
  return { "@type": "Blog", "@id": BLOG_ID, name: "Journal", url: `${SITE_URL}/journal` };
}

type EntryRef = { slug: string; title: string; date?: string | null };

/** A short BlogPosting naming an entry: its @id, headline, address and day. */
function postingRef(entry: EntryRef): Json {
  const url = `${SITE_URL}/journal/${entry.slug}`;
  return compact({
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    headline: entry.title,
    url,
    datePublished: toIsoTimestamp(entry.date),
  });
}

/**
 * The Journal page: a CollectionPage whose main entity is the Blog, with
 * the most recent entries as its posts.
 */
export function buildJournalJsonLd(
  recent: EntryRef[],
  copy: { title: string; description: string },
  settings?: SiteSettings | null,
): Json {
  const url = `${SITE_URL}/journal`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      compact({
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: copy.title,
        description: copy.description,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": BLOG_ID },
      }),
      compact({
        ...blogRef(),
        description: copy.description,
        inLanguage: "en-CA",
        author: { "@id": PERSON_ID },
        publisher: publisherNode(settings),
        blogPost: recent.map(postingRef),
      }),
    ],
  };
}

/** One month of the journal: a CollectionPage in the Blog, listing its entries. */
export function buildJournalMonthJsonLd(
  path: string,
  copy: { title: string; description: string },
  entries: EntryRef[],
): Json {
  const url = absoluteUrl(path)!;
  return {
    "@context": "https://schema.org",
    "@graph": [
      compact({
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: copy.title,
        description: copy.description,
        isPartOf: [{ "@id": WEBSITE_ID }, { "@id": BLOG_ID }],
        mainEntity: entries.length
          ? {
              "@type": "ItemList",
              numberOfItems: entries.length,
              itemListElement: entries.map((e, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: e.title,
                item: postingRef(e),
              })),
            }
          : undefined,
      }),
      blogRef(),
    ],
  };
}

/** One entry: a BlogPosting in the Blog, with the places it names. */
export function buildArticleJsonLd(
  entry: JournalEntry,
  settings?: SiteSettings | null,
): Json {
  const datePublished = toIsoTimestamp(entry.date);
  const dateModified = toIsoTimestamp(entry.updatedAt) ?? datePublished;
  const url = `${SITE_URL}/journal/${entry.slug}`;
  const cover = typeof entry.coverImage === "string" ? null : entry.coverImage;
  const places = placesNamedIn(`${entry.title} ${entry.excerpt ?? ""}`).map((name) => ({
    "@type": "Place",
    name,
  }));
  return {
    "@context": "https://schema.org",
    ...compact({
      "@type": "BlogPosting",
      "@id": `${url}#post`,
      headline: entry.title,
      description: entry.excerpt?.trim(),
      image: cover?.url ? imageObject(cover) : imageUrl(entry.coverImage),
      datePublished,
      dateModified,
      inLanguage: "en-CA",
      author: authorNodes(entry.author),
      publisher: publisherNode(settings),
      contentLocation: places.length === 1 ? places[0] : places,
      isPartOf: blogRef(),
      url,
      mainEntityOfPage: url,
    }),
  };
}

// ——— Projects ———

/** An image as an ImageObject: its address, size, caption and alt text. */
function imageObject(image: SanityImageAsset): Json {
  const url = absoluteUrl(image.url);
  return compact({
    "@type": "ImageObject",
    contentUrl: url,
    url,
    // The caption from Sanity; where none is written, the photograph's own
    // alt text, which describes it.
    caption: image.caption?.trim() || (image.isDecorative ? undefined : image.alt?.trim()),
  });
}

/**
 * Every meaningful photograph on a project page, in the order the page
 * shows them: the hero (lib/projectHero.ts), the Photographs, then the
 * images in its content sections. Decorative images and repeats are left out.
 */
function projectImages(project: ProjectDetail, hero?: SanityImageAsset | null): SanityImageAsset[] {
  const out: SanityImageAsset[] = [];
  const seen = new Set<string>();
  const add = (image?: SanityImageAsset | null) => {
    if (!image?.url || image.isDecorative || seen.has(image.url)) return;
    seen.add(image.url);
    out.push(image);
  };
  add(hero);
  for (const p of project.photographs ?? []) add(p);
  for (const section of project.contentSections ?? []) {
    const s = section as { image?: SanityImageAsset | null; images?: (SanityImageAsset | null)[] | null };
    add(s.image);
    for (const image of s.images ?? []) add(image);
  }
  return out;
}

/** Split "Photography, Collaborations" into its categories. */
function categoriesOf(category?: string | null): string[] {
  return (category ?? "").split(",").map((c) => c.trim()).filter(Boolean);
}

/**
 * A project page: a VisualArtwork when it is filed under Photography (a
 * photographic work), otherwise a CreativeWork, with its photographs as
 * ImageObjects.
 */
export function buildCreativeWorkJsonLd(
  project: ProjectDetail,
  settings?: SiteSettings | null,
  hero?: SanityImageAsset | null,
): Json {
  const url = `${SITE_URL}/projects/${project.slug}`;
  const genres = categoriesOf(project.category);
  const photographic = genres.some((g) => g.toLowerCase() === "photography");
  const images = projectImages(project, hero).map(imageObject);
  return {
    "@context": "https://schema.org",
    ...compact({
      "@type": photographic ? "VisualArtwork" : "CreativeWork",
      "@id": `${url}#work`,
      name: project.title,
      description: project.excerpt?.trim() || project.shortIntro?.trim(),
      genre: genres.length === 1 ? genres[0] : genres,
      artform: photographic ? "Photography" : undefined,
      image: images,
      dateCreated: project.year ? String(project.year) : undefined,
      datePublished: toIsoTimestamp(project.publishedAt),
      dateModified: toIsoTimestamp(project.updatedAt),
      inLanguage: "en-CA",
      creator: authorNodes(project.author),
      author: authorNodes(project.author),
      publisher: publisherNode(settings),
      url,
      mainEntityOfPage: url,
    }),
  };
}

/** The Projects page: a CollectionPage listing every project in its order. */
export function buildProjectsJsonLd(
  projects: { slug: string; title: string }[],
  copy: { title: string; description: string },
): Json {
  const url = `${SITE_URL}/projects`;
  return {
    "@context": "https://schema.org",
    ...compact({
      "@type": "CollectionPage",
      "@id": `${url}#page`,
      url,
      name: copy.title,
      description: copy.description,
      isPartOf: { "@id": WEBSITE_ID },
      author: { "@id": PERSON_ID },
      mainEntity: {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: projects.length,
        itemListElement: projects.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: `${url}/${p.slug}`,
        })),
      },
    }),
  };
}

// ——— About ———

/** The About page, about the Person defined in the sitewide @graph. */
export function buildAboutPageJsonLd(copy: { title: string; description: string }): Json {
  const url = `${SITE_URL}/about`;
  return {
    "@context": "https://schema.org",
    ...compact({
      "@type": "AboutPage",
      "@id": `${url}#page`,
      url,
      name: copy.title,
      description: copy.description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      mainEntity: { "@id": PERSON_ID },
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
