import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import ReadingProgress from "@/components/ReadingProgress";
import SanityImage from "@/components/SanityImage";
import { sanityFetch } from "@/sanity/fetch";
import { journalBySlugQuery, journalFeedQuery } from "@/sanity/queries";
import {
  fallbackJournalEntries,
  type JournalEntry,
} from "@/lib/placeholder-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const entry = await sanityFetch<JournalEntry | null>({
    query: journalBySlugQuery,
    params: { slug },
  });

  const fallback = fallbackJournalEntries.find((e) => e.slug === slug);
  const title = entry?.title ?? fallback?.title;

  if (!title) return { title: "Not Found" };

  const description =
    entry?.excerpt ??
    fallback?.excerpt ??
    "Reflections and observations from Maninder Singh — House of Singh";

  return { title, description };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function JournalDetailPage({ params }: Props) {
  const { slug } = await params;

  const entry = await sanityFetch<JournalEntry | null>({
    query: journalBySlugQuery,
    params: { slug },
  });

  const fallback = fallbackJournalEntries.find((e) => e.slug === slug);
  const resolved = entry ?? fallback;

  if (!resolved) notFound();

  /* Fetch all entries for prev/next navigation */
  const allData = await sanityFetch<JournalEntry[] | null>({
    query: journalFeedQuery,
  });
  const all = allData?.length ? allData : fallbackJournalEntries;
  const sorted = [...all].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const currentIdx = sorted.findIndex((e) => e.slug === resolved.slug);
  const prevEntry = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const nextEntry =
    currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  return (
    <>
      {/* Reading progress bar */}
      <ReadingProgress />

      <div className="px-6 md:px-16 page-top-offset section-pb-sm max-w-4xl mx-auto">
        {/* Back to journal */}
        <Link
          href="/journal"
          className="inline-block text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          &larr; Back to journal
        </Link>

        {/* Cover image */}
        {resolved.coverImage && (
          <div className="relative w-full h-[50vh] bg-secondary mb-8">
            <SanityImage
              image={resolved.coverImage}
              context="hero"
              alt={resolved.title}
              priority
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="font-editorial text-3xl md:text-4xl font-light tracking-wide text-foreground mb-3">
          {resolved.title}
        </h1>

        {/* Date */}
        <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-10">
          {formatDate(resolved.date)}
        </p>

        {/* Body */}
        <div className="text-muted-foreground leading-relaxed space-y-6 mb-16">
          {resolved.body && resolved.body.length > 0 ? (
            <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.9] [&>p]:mb-6 last:[&>p]:mb-0">
              <PortableText
                value={resolved.body}
                components={{
                  types: {
                    image: ({ value }: { value: Record<string, unknown> }) => (
                      <figure className="my-8">
                        <SanityImage
                          image={value as unknown as import("@/lib/sanityImage").SanityImageAsset}
                          context="body"
                          alt={(value.alt as string) ?? ""}
                          className="w-full"
                        />
                        {typeof value.caption === "string" && (
                          <figcaption className="text-xs text-muted-foreground/60 mt-2">
                            {value.caption}
                          </figcaption>
                        )}
                      </figure>
                    ),
                  },
                }}
              />
            </div>
          ) : (
            <p>{resolved.excerpt}</p>
          )}
        </div>

        {/* Prev / Next navigation */}
        <div className="border-t border-border pt-10">
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {/* Previous (newer) */}
            <div>
              {prevEntry ? (
                <Link
                  href={`/journal/${prevEntry.slug}`}
                  className="group block"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">
                    Previous
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/30 mb-2">
                    Newer entry
                  </p>
                  <p className="text-[11px] md:text-xs uppercase tracking-[0.12em] text-foreground group-hover:text-muted-foreground transition-colors leading-relaxed">
                    {prevEntry.title}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mt-1">
                    {formatDate(prevEntry.date)}
                  </p>
                </Link>
              ) : (
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/20">
                  No previous entry
                </p>
              )}
            </div>

            {/* Next (older) */}
            <div className="text-right">
              {nextEntry ? (
                <Link
                  href={`/journal/${nextEntry.slug}`}
                  className="group block"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">
                    Next
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/30 mb-2">
                    Older entry
                  </p>
                  <p className="text-[11px] md:text-xs uppercase tracking-[0.12em] text-foreground group-hover:text-muted-foreground transition-colors leading-relaxed">
                    {nextEntry.title}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mt-1">
                    {formatDate(nextEntry.date)}
                  </p>
                </Link>
              ) : (
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/20">
                  No next entry
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
