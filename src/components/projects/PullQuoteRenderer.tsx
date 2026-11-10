import type { PullQuoteBlock } from "@/lib/types";

type Props = { section: PullQuoteBlock };

export default function PullQuoteRenderer({ section }: Props) {
  return (
    <figure className="project-section mx-auto max-w-3xl px-6 md:px-16 text-center">
      <blockquote className="text-statement leading-[1.4] text-foreground text-balance">
        {section.quote}
      </blockquote>
      {section.attribution?.trim() && (
        <figcaption className="mt-6 type-label text-muted-foreground">
          {section.attribution}
        </figcaption>
      )}
    </figure>
  );
}
