import { sanityFetch } from "@/sanity/fetch";
import { devPlaceholder } from "@/lib/placeholders";
import { journalBySlugQuery } from "@/sanity/queries";
import { fallbackJournalEntries } from "@/lib/placeholder-data";
import type { JournalEntry } from "@/lib/types";
import {
  renderOgImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "House of Singh | journal";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;

  // Share images are rendered on demand, not cached by ISR, so a Sanity
  // failure here draws the generic branded card instead of erroring.
  const entry = await sanityFetch<JournalEntry | null>({
    query: journalBySlugQuery,
    params: { slug },
  }).catch(() => null);

  const fallback = devPlaceholder(fallbackJournalEntries, []).find(
    (e) => e.slug === slug,
  );
  const resolved = entry ?? fallback;

  const title =
    resolved?.seo?.metaTitle ||
    resolved?.seoTitle ||
    resolved?.title ||
    "House of Singh";
  return renderOgImage({ title });
}
