import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { JournalEntry } from "@/lib/types";
import { formatEntryDate } from "@/lib/dates";

/**
 * One journal entry in the journal grid: cover (grey on desktop until
 * hover), date, title and a quiet "Read more". The cover frame carries
 * data-journal-card for the phone colour reveal (useJournalCardColour).
 */
export default function JournalCard({
  entry,
  reducedMotion,
}: {
  entry: JournalEntry;
  reducedMotion: boolean;
}) {
  return (
    <Link
      href={`/journal/${entry.slug}`}
      className={`block group ${
        reducedMotion
          ? ""
          : "transition-transform duration-(--dur-hover) ease-(--ease-soft-out) hover:-translate-y-1"
      }`}
    >
      {/* Image */}
      <div data-journal-card className="relative overflow-hidden bg-secondary mb-5 shadow-sm group-hover:shadow-md transition-shadow duration-(--dur-hover) ease-(--ease-soft-out) aspect-[3/4]">
        <SanityImage
          image={entry.coverImage}
          context="thumbnail"
          alt={entry.title}
          fill
          className={`object-cover lg:grayscale ${
            reducedMotion
              ? ""
              : "transition-all duration-(--dur-image) ease-(--ease-slow) group-hover:scale-[1.03] lg:group-hover:grayscale-0"
          }`}
        />
      </div>

      {/* Date */}
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
        {formatEntryDate(entry.date)}
      </p>

      {/* Title */}
      <h2 className="font-editorial text-base md:text-lg font-light text-foreground leading-snug mb-3 line-clamp-2">
        {entry.title}
      </h2>

      {/* Read more */}
      <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground group-hover:text-foreground transition-colors duration-(--dur-hover) ease-(--ease-soft-out) border-b border-muted-foreground/30 group-hover:border-foreground pb-px">
        Read more
      </span>
    </Link>
  );
}
