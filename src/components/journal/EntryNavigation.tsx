import Link from "next/link";
import type { JournalEntry } from "@/lib/types";
import { formatEntryDate } from "@/lib/dates";

type Side = "previous" | "next";

const SIDES: Record<Side, { label: string; empty: string; arrow: string; nudge: string; align?: string }> = {
  previous: { label: "Previous", empty: "No previous entry", arrow: "←", nudge: "motion-safe:group-hover:-translate-x-0.5" },
  next: { label: "Next", empty: "No next entry", arrow: "→", nudge: "motion-safe:group-hover:translate-x-0.5", align: "text-right" },
};

function NavSide({ side, entry }: { side: Side; entry: JournalEntry | null }) {
  const s = SIDES[side];
  return (
    <div className={s.align}>
      {entry ? (
        <Link href={`/journal/${entry.slug}`} className="group block">
          <span
            aria-hidden="true"
            className={`block text-sm text-muted-foreground mb-2 transition-[transform,color] duration-(--dur-hover) ease-(--ease-soft-out) group-hover:text-foreground ${s.nudge}`}
          >
            {s.arrow}
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {s.label}
          </p>
          <p className="text-xs md:text-sm uppercase tracking-[0.1em] text-foreground group-hover:text-muted-foreground transition-colors leading-relaxed">
            {entry.title}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-1">
            {formatEntryDate(entry.date)}
          </p>
        </Link>
      ) : (
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {s.empty}
        </p>
      )}
    </div>
  );
}

/**
 * Previous (newer) and next (older) entry links at the end of a journal
 * article, inside the text column after a hairline rule.
 */
export default function EntryNavigation({
  prev,
  next,
}: {
  prev: JournalEntry | null;
  next: JournalEntry | null;
}) {
  return (
    <div className="border-t border-border pt-10">
      <div className="grid grid-cols-2 gap-4 md:gap-8">
        <NavSide side="previous" entry={prev} />
        <NavSide side="next" entry={next} />
      </div>
    </div>
  );
}
