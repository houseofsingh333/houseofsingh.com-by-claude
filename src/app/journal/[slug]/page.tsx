import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  return { title };
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
  const currentIdx = all.findIndex((e) => e.slug === resolved.slug);
  const prevEntry = currentIdx > 0 ? all[currentIdx - 1] : null;
  const nextEntry = currentIdx < all.length - 1 ? all[currentIdx + 1] : null;

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <section className="px-8 md:px-16 pt-32 md:pt-44 pb-16 md:pb-24">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 mb-12"
        >
          <span className="transition-transform duration-300 hover:-translate-x-1">
            ←
          </span>
          Back to Journal
        </Link>

        <time
          dateTime={resolved.date}
          className="block text-xs tracking-widest text-muted-foreground mb-4"
        >
          {new Date(resolved.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>

        <h1 className="font-editorial text-3xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1] max-w-3xl animate-editorial-fade-in">
          {resolved.title}
        </h1>
      </section>

      {/* Cover image */}
      {resolved.coverImage && (
        <section className="px-8 md:px-16 pb-16 md:pb-24">
          <div className="w-full aspect-[16/9] overflow-hidden bg-secondary">
            <img
              src={resolved.coverImage}
              alt={resolved.title}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {/* Body */}
      <section className="px-8 md:px-16 pb-24 md:pb-36">
        <div className="max-w-2xl">
          <p className="text-lg md:text-xl text-foreground leading-[1.8] font-editorial font-light mb-8">
            {resolved.excerpt}
          </p>
          <p className="text-sm text-muted-foreground leading-[1.8]">
            Full journal content with rich text will render here once Sanity is
            connected.
          </p>
        </div>
      </section>

      {/* Prev / Next navigation */}
      <section className="px-8 md:px-16 pb-24 md:pb-36 border-t border-border pt-12">
        <div className="flex items-stretch justify-between gap-8">
          {prevEntry ? (
            <Link
              href={`/journal/${prevEntry.slug}`}
              className="group flex-1 text-left"
            >
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                Previous
              </p>
              <p className="font-editorial text-lg md:text-xl font-light text-foreground group-hover:text-muted-foreground transition-colors duration-300 leading-tight">
                {prevEntry.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextEntry ? (
            <Link
              href={`/journal/${nextEntry.slug}`}
              className="group flex-1 text-right"
            >
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                Next
              </p>
              <p className="font-editorial text-lg md:text-xl font-light text-foreground group-hover:text-muted-foreground transition-colors duration-300 leading-tight">
                {nextEntry.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </section>
    </div>
  );
}
