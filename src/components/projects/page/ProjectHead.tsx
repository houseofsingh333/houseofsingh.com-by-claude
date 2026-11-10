import Link from "next/link";
import { linkStudio } from "@/components/StudioLink";

type Props = {
  title: string;
  /** Position in the Projects page order, for example "01 / 04". */
  counter: string | null;
  /** Category, year and role, in small capitals (each only when filled). */
  meta: string[];
  isUpcoming?: boolean;
  excerpt?: string | null;
  /** Back to this project on the Projects page (the hero shrinks into its plate). */
  allProjectsHref: string;
  allProjectsLabel: string;
};

/**
 * Beneath the hero (frame "Zamana, refined"): "All projects", then the
 * title block laid out like the One by one caption: the counter, the title
 * in Playfair at about 88px, category, year and role in small capitals,
 * and the excerpt on the right, both standing on the same line. It rises
 * in once the hero has settled (styles/projects.css).
 */
export default function ProjectHead({ title, counter, meta, isUpcoming, excerpt, allProjectsHref, allProjectsLabel }: Props) {
  return (
    <div className="pp-col">
      <Link href={allProjectsHref} className="pp-back hairline">
        <span aria-hidden="true">&larr;</span> {allProjectsLabel}
      </Link>
      <header className="pp-head">
        <div className="pp-head-main">
          {counter && <span className="pp-counter">{counter}</span>}
          <h1 className="pp-title">{title}</h1>
          {(meta.length > 0 || isUpcoming) && (
            <p className="pp-meta">
              {meta.join(", ")}
              {isUpcoming && (
                <span className="pp-upcoming">
                  <span className="upcoming-dot" aria-hidden="true" />
                  Upcoming
                </span>
              )}
            </p>
          )}
        </div>
        {excerpt && <p className="pp-excerpt">{linkStudio(excerpt)}</p>}
      </header>
    </div>
  );
}
