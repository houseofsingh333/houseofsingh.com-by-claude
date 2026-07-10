import type { PullQuoteBlock } from "@/lib/placeholder-data";

type Props = { section: PullQuoteBlock };

export default function PullQuoteRenderer({ section }: Props) {
  return (
    <figure className="project-section mx-auto max-w-3xl px-6 md:px-16 text-center">
      <blockquote className="font-editorial text-2xl md:text-3xl lg:text-4xl font-light leading-[1.3] text-foreground text-balance">
        {section.quote}
      </blockquote>
      {section.attribution?.trim() && (
        <figcaption className="mt-6 text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">
          {section.attribution}
        </figcaption>
      )}
    </figure>
  );
}
