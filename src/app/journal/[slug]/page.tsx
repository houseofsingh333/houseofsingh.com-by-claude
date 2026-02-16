import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { journalEntries } from "@/lib/placeholder-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = journalEntries.find((e) => e.slug === slug);
  if (!entry) return { title: "Not Found" };
  return { title: entry.title };
}

export default async function JournalDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = journalEntries.find((e) => e.slug === slug);

  if (!entry) notFound();

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <time dateTime={entry.date} className="text-sm text-neutral-400">
        {new Date(entry.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </time>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        {entry.title}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-neutral-600">
        {entry.excerpt}
      </p>
      <p className="mt-8 text-sm text-neutral-400">
        Full journal content with Portable Text will render here once Sanity is
        connected.
      </p>
    </section>
  );
}
