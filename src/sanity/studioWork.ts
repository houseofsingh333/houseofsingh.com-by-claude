import { createClient } from "next-sanity";
import { apiVersion } from "./env";

/*
 * House of Singh Studios' public content (its own Sanity project, read only,
 * no token), for the "Recent studio work" row in Chapter VII. Fetched on
 * the server and cached like other content (revalidated every 60 s).
 *
 * Unlike sanityFetch, this never throws: the studio's data is a small extra,
 * so if it cannot be reached the row is simply hidden and the rest of the
 * page renders as usual.
 */

const STUDIO_PROJECT_ID = "00iree4d";
const STUDIO_SITE = "https://studios.houseofsingh.com";

const studioClient = createClient({
  projectId: STUDIO_PROJECT_ID,
  dataset: "production",
  apiVersion,
  useCdn: true,
  timeout: 5000,
  maxRetries: 0,
});

export type StudioWork = {
  name: string;
  href: string;
  image: { url: string; lqip?: string | null; alt?: string | null };
};

type RawCaseStudy = {
  title?: unknown;
  clientName?: unknown;
  clientRef?: unknown;
  client?: unknown;
  slug?: unknown;
  url?: unknown;
  image?: { url?: unknown; lqip?: unknown; alt?: unknown } | null;
};

// Field names vary between schemas, so each value is read from the first
// of several likely fields that is filled.
const FIELDS = `{
  title, clientName, "clientRef": client->name, client,
  "slug": slug.current,
  "url": coalesce(url, link, externalUrl),
  "image": coalesce(thumbnail, coverImage, cover, heroImage, mainImage, featuredImage, image, images[0], gallery[0]){
    "url": asset->url, "lqip": asset->metadata.lqip, alt
  }
}`;
const ORDER = `order(coalesce(publishedAt, date, completedAt, _createdAt) desc)`;

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** The client's name: a plain field, a referenced client, or the title. */
function nameOf(r: RawCaseStudy): string | null {
  const client = r.client as { name?: unknown } | string | null | undefined;
  return (
    str(r.clientName) ??
    str(r.clientRef) ??
    str(client) ??
    str(typeof client === "object" && client ? client.name : null) ??
    str(r.title)
  );
}

/**
 * Up to three case studies: the hand picked slugs when given (in that
 * order), otherwise the three most recent. Null when the studio's data
 * cannot be reached or nothing usable comes back.
 */
export async function fetchStudioWork(
  slugs: string[] | null | undefined,
  caseStudyBase: string,
): Promise<StudioWork[] | null> {
  const picked = (slugs ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 3);
  try {
    const raw = await studioClient.fetch<RawCaseStudy[]>(
      picked.length
        ? `*[_type == "caseStudy" && slug.current in $slugs]${FIELDS}`
        : `*[_type == "caseStudy" && defined(slug.current)] | ${ORDER}[0...6]${FIELDS}`,
      picked.length ? { slugs: picked } : {},
      { next: { revalidate: 60 } },
    );
    const base = caseStudyBase.endsWith("/") ? caseStudyBase : `${caseStudyBase}/`;
    const items = (raw ?? [])
      .map((r) => {
        const name = nameOf(r);
        const slug = str(r.slug);
        const url = str(r.image?.url);
        const own = str(r.url);
        const href = own && own.startsWith(STUDIO_SITE) ? own : slug ? `${base}${slug}` : null;
        if (!name || !href || !url) return null;
        const work: StudioWork = { name, href, image: { url, lqip: str(r.image?.lqip), alt: str(r.image?.alt) } };
        return { slug, work };
      })
      .filter((x): x is { slug: string | null; work: StudioWork } => x !== null);
    const ordered = picked.length
      ? picked.map((slug) => items.find((x) => x.slug === slug)?.work).filter((w): w is StudioWork => !!w)
      : items.map((x) => x.work);
    return ordered.length ? ordered.slice(0, 3) : null;
  } catch (error) {
    console.warn("[studio] Recent studio work could not be read; the row is hidden.", error);
    return null;
  }
}
