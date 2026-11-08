import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { JournalEntry } from "@/lib/types";
import { formatDayOfMonth, formatMonthYear } from "@/lib/dates";

/**
 * One journal entry in the homepage filmstrip: a 4:5 photograph, the day as
 * a large Playfair numeral beside the month and year, and the title.
 * Everything is always visible; nothing waits for hover.
 *
 * `copy` marks a duplicate used only to make the drifting loop seamless: it
 * is inert (never reachable by Tab) and hidden from screen readers.
 */
export default function FilmstripCard({
  entry,
  copy = false,
}: {
  entry: JournalEntry;
  copy?: boolean;
}) {
  return (
    <Link
      href={`/journal/${entry.slug}`}
      draggable={false}
      data-filmstrip-card={copy ? "copy" : "real"}
      className="block shrink-0 w-[260px] md:w-[300px]"
      {...(copy ? { "aria-hidden": true, inert: true, tabIndex: -1 } : {})}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <SanityImage
          image={entry.coverImage}
          context="thumbnail"
          fill
          sizes="(min-width: 768px) 300px, 260px"
          className="object-cover"
          // A copy shows an entry the visitor has already watched develop.
          develop={!copy}
        />
      </div>
      <p className="mt-3 md:mt-4 flex items-baseline gap-2.5 md:gap-3">
        <span className="font-editorial text-[length:clamp(34px,calc(31.37px_+_0.674vw),40px)] leading-none text-foreground">
          {formatDayOfMonth(entry.date)}
        </span>
        <span className="type-label text-muted-foreground">
          {formatMonthYear(entry.date)}
        </span>
      </p>
      <h3 className="mt-2.5 md:mt-3 font-editorial font-normal text-[length:clamp(20px,calc(19.12px_+_0.225vw),22px)] leading-[1.25] text-foreground text-balance">
        {entry.title}
      </h3>
    </Link>
  );
}
