import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import type { JournalEntry } from "@/lib/placeholder-data";
import { parseSanityDate } from "@/lib/dates";
import JournalRowLink from "./JournalRowLink";
import JournalStack from "./JournalStack";

type Props = {
  entries: JournalEntry[];
};

/* ── Date formatter (desktop list) ── */

const fmtDate = (d: string) =>
  parseSanityDate(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const MAX_CARDS = 4;

/**
 * Home page journal. Server rendered: headers and the desktop list rows.
 * Client leaves: each row's floating cover (JournalRowLink) and the phone
 * and tablet stacked cards (JournalStack).
 */
export default function JournalPreview({ entries }: Props) {
  /* Sort newest-first and cap at 4 */
  const displayed = entries
    .slice()
    .sort((a, b) => parseSanityDate(b.date).getTime() - parseSanityDate(a.date).getTime())
    .slice(0, MAX_CARDS);

  return (
    <section className="px-6 md:px-16 section-py">
      {/* ── Section header — desktop: with scroll reveal ── */}
      <ScrollReveal className="hidden lg:block">
        <div className="flex items-baseline justify-between mb-14">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground">
            Journal
          </h2>
          <Link
            href="/journal"
            aria-label="See all journal entries"
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            See all
          </Link>
        </div>
      </ScrollReveal>

      {/* ── Section header — mobile/tablet: sticky, no ScrollReveal ── */}
      <div className="lg:hidden journal-section-header">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground">
            Journal
          </h2>
          <Link
            href="/journal"
            aria-label="See all journal entries"
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            See all
          </Link>
        </div>
      </div>

      {/* ═══ DESKTOP (lg+): text-row list — unchanged ═══ */}
      <div className="hidden lg:block relative">
        {displayed.map((entry, index) => (
          <JournalRowLink
            key={entry._id}
            href={`/journal/${entry.slug}`}
            title={entry.title}
            coverImage={entry.coverImage}
          >
            <div className="flex items-baseline justify-between gap-4 md:gap-8">
              {/* Index number */}
              <span className="hidden md:block text-xs tracking-widest text-muted-foreground w-12 shrink-0 transition-colors duration-300 group-hover:text-foreground group-focus-visible:text-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Title / excerpt */}
              <div className="flex-1 min-w-0">
                <h3 className="font-editorial text-lg md:text-3xl lg:text-4xl font-normal text-foreground leading-tight">
                  {entry.title || entry.excerpt}
                </h3>
              </div>

              {/* Date + arrow */}
              <div className="hidden md:flex items-center gap-6 shrink-0">
                <time className="text-xs tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-foreground group-focus-visible:text-foreground">
                  {fmtDate(entry.date)}
                </time>
                <span className="text-foreground/0 group-hover:text-foreground group-focus-visible:text-foreground transition-[color,transform] duration-500 translate-x-[-8px] group-hover:translate-x-0 group-focus-visible:translate-x-0">
                  →
                </span>
              </div>
            </div>

            {/* Excerpt: revealed on hover, and on keyboard focus of the row */}
            <div className="hidden md:block transition-[opacity,transform] duration-500 opacity-0 translate-y-2 group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:translate-y-0 group-focus-visible:translate-y-0">
              <p className="text-sm text-muted-foreground mt-3 ml-12 max-w-lg leading-relaxed">
                {entry.excerpt}
              </p>
            </div>

          </JournalRowLink>
        ))}

        {/* Bottom border */}
        <div className="border-t border-border" />
      </div>

      {/* ═══ MOBILE / TABLET (<lg): sticky stacked image cards (client) ═══ */}
      <JournalStack displayed={displayed} />
    </section>
  );
}
