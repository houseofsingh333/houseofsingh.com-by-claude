import type { Metadata } from "next";
import Link from "next/link";
import { fallbackJournalEntries as journalEntries } from "@/lib/placeholder-data";

export const metadata: Metadata = {
  title: "Journal",
};

export default function JournalPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Journal</h1>
      <p className="mt-4 text-neutral-600">
        Thoughts, process notes, and behind-the-scenes stories. Month/year
        filtering will be added once Sanity is wired.
      </p>

      <div className="mt-12 space-y-10">
        {journalEntries.map((entry) => (
          <article key={entry._id}>
            <Link href={`/journal/${entry.slug}`} className="group">
              <time
                dateTime={entry.date}
                className="text-sm text-neutral-400"
              >
                {new Date(entry.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-1 text-xl font-medium group-hover:underline">
                {entry.title}
              </h2>
              <p className="mt-2 text-neutral-600">{entry.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
