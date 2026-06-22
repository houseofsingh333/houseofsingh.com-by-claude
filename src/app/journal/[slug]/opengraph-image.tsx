import { sanityFetch } from "@/sanity/fetch";
import { journalBySlugQuery } from "@/sanity/queries";
import { fallbackJournalEntries } from "@/lib/placeholder-data";
import type { JournalEntry } from "@/lib/placeholder-data";
import {
  renderOgImage,
  coverUrlFromImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "House of Singh — journal";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;

  const entry = await sanityFetch<JournalEntry | null>({
    query: journalBySlugQuery,
    params: { slug },
  });

  const fallback = fallbackJournalEntries.find((e) => e.slug === slug);
  const resolved = entry ?? fallback;

  const title =
    resolved?.seo?.metaTitle ||
    resolved?.seoTitle ||
    resolved?.title ||
    "House of Singh";
  const coverUrl = coverUrlFromImage(resolved?.coverImage);

  return renderOgImage({ title, coverUrl });
}
