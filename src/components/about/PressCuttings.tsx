import SanityImage from "@/components/SanityImage";
import { parseSanityDate } from "@/lib/dates";
import type { FeaturedOutlet } from "@/lib/types";

/** The year of a Sanity date, read as a local date. */
function yearOf(date?: string): string | null {
  if (!date) return null;
  const d = parseSanityDate(date);
  return Number.isNaN(d.getTime()) ? null : String(d.getFullYear());
}

/**
 * Chapter IV on the About page, in print: each Featured On entry as a
 * framed press cutting (a white paper mat with a soft shadow) with the
 * publication and year and the title beneath. Entries with a link open the
 * article in a new tab.
 */
export default function PressCuttings({ outlets }: { outlets: FeaturedOutlet[] }) {
  return (
    <ul className="press-grid">
      {outlets.map((outlet) => {
        const year = yearOf(outlet.date);
        const body = (
          <>
            <span className="press-mat">
              <span className="press-photo">
                {outlet.image ? (
                  <SanityImage
                    image={outlet.image}
                    context="thumbnail"
                    alt={outlet.title || outlet.name}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <span aria-hidden="true" className="press-masthead">
                    {outlet.name}
                  </span>
                )}
              </span>
            </span>
            <span className="press-meta">
              {outlet.name}
              {year && `, ${year}`}
            </span>
            <span className="press-title">{outlet.title || outlet.name}</span>
          </>
        );
        return (
          <li key={(outlet.title || "") + outlet.name}>
            {outlet.url ? (
              <a href={outlet.url} target="_blank" rel="noopener noreferrer" className="press-cutting group">
                {body}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <div className="press-cutting">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
