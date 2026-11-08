import { PAGE_COLUMN } from "./story";

/**
 * The title block under the hero: the project title in Playfair at display
 * size, then one small label line with the category and the year, each only
 * where it exists, and "Upcoming" with the brass dot for upcoming work.
 * Not a scroll reveal: it is often the first text on screen (and the largest
 * paint when there is no photograph), so it paints at once.
 */
export default function ProjectTitle({
  title,
  category,
  year,
  isUpcoming,
}: {
  title: string;
  category?: string | null;
  year?: number | null;
  isUpcoming?: boolean;
}) {
  const labels = [category?.trim(), year ? String(year) : null].filter(
    (l): l is string => !!l,
  );
  return (
    <div className={`${PAGE_COLUMN} pt-(--section-space-sm)`}>
      <h1
        className="font-editorial font-light text-foreground leading-[1.05] tracking-[-0.01em] text-balance break-words"
        style={{ fontSize: "clamp(42px, 6vw, 88px)" }}
      >
        {title}
      </h1>
      {(labels.length > 0 || isUpcoming) && (
        <p className="mt-6 md:mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 type-label text-muted-foreground">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
          {isUpcoming && (
            <span className="flex items-center gap-2">
              <span className="upcoming-dot" aria-hidden="true" />
              Upcoming
            </span>
          )}
        </p>
      )}
    </div>
  );
}
