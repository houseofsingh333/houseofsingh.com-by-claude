import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { hotspotPosition } from "@/lib/projectHero";
import { formatEntryDate } from "@/lib/dates";
import { pad2 } from "@/lib/editions/format";
import { keepLastWords } from "@/lib/keepLastWords";
import type { EditionsCollection } from "@/lib/editions/types";
import ArtistsInvite from "./ArtistsInvite";

/**
 * The Shop page's sections below the opening (Shop design round 2): How
 * the release works, In the making, Before you buy, Questions and For
 * artists. Each is calm and short: a label, a heading where there is one,
 * and a few lines.
 */

type Step = { title: string; text: string };

/** Numbered titles with one line each: How the release works, and Before you buy. */
function Steps({ steps, className }: { steps: Step[]; className: string }) {
  return (
    <ol className={`ed-steps2 ${className}`}>
      {steps.map((s, i) => (
        <li key={s.title}>
          <span aria-hidden="true" className="ed-steps2-numeral">
            {pad2(i + 1)}
          </span>
          <span className="ed-steps2-title">{keepLastWords(s.title)}</span>
          <span className="ed-steps2-text">{keepLastWords(s.text)}</span>
        </li>
      ))}
    </ol>
  );
}

/** How the release works: join the list, early access, opens to everyone. */
export function HowItWorks({ steps }: { steps: Step[] }) {
  return (
    <section id="how" className="ed-section ed-how ed-anchor" aria-labelledby="ed-how-label">
      <h2 id="ed-how-label" className="type-label text-muted-foreground">
        How the release works
      </h2>
      <Steps steps={steps} className="ed-how-steps" />
    </section>
  );
}

/** In the making: up to three Journal entries chosen on the Collection; nothing when none are. */
export function InTheMaking({ entries: given }: { entries: NonNullable<EditionsCollection["journal"]> }) {
  // Never let one entry break the page: anything without a title and an address is skipped.
  const entries = (given ?? []).filter((e) => e && e.slug && e.title);
  if (!entries.length) return null;
  return (
    <section className="ed-section ed-making" aria-labelledby="ed-making-heading">
      <div className="ed-making-head">
        <div className="ed-making-titles">
          <span className="type-label text-muted-foreground">Journal</span>
          <h2 id="ed-making-heading" className="ed-serif-heading">
            In the making
          </h2>
        </div>
        <Link href="/journal" className="text-link ed-making-all">
          <span className="text-link-text">All entries</span>
          <span aria-hidden="true" className="text-link-arrow">
            {"→"}
          </span>
        </Link>
      </div>
      <ul className="ed-making-rail">
        {entries.map((e) => (
          <li key={e._id} className="ed-making-card">
            <Link href={`/journal/${e.slug}`} className="ed-making-link">
              <span className="ed-making-photo">
                {e.image?.url && (
                  <SanityImage
                    image={e.image}
                    context="body"
                    alt=""
                    fill
                    sizes="(min-width: 768px) 30vw, 268px"
                    className="object-cover"
                    objectPosition={hotspotPosition(e.image)}
                    develop={false}
                  />
                )}
              </span>
              <span className="type-label text-muted-foreground">{e.date ? `Journal · ${formatEntryDate(e.date)}` : "Journal"}</span>
              <span className="ed-making-title">{keepLastWords(e.title)}</span>
            </Link>
          </li>
        ))}
        <li className="ed-making-card ed-making-more">
          <Link href="/journal" className="ed-making-more-link">
            <span>{keepLastWords("All entries in the Journal")}</span>
            <span aria-hidden="true">{"→"}</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}

/** Before you buy: what this is, and what it is not, in five short notes. */
export function BeforeYouBuy({ heading, notes }: { heading: string; notes: Step[] }) {
  return (
    <section id="before-you-buy" className="ed-section ed-before2 ed-anchor" aria-labelledby="ed-before-heading">
      <span className="type-label text-muted-foreground">Before you buy</span>
      <h2 id="ed-before-heading" className="ed-serif-heading">
        {heading}
      </h2>
      <Steps steps={notes} className="ed-before-steps" />
    </section>
  );
}

/**
 * Questions, folding. A question without an answer yet is a placeholder:
 * marked as such on previews, left out on the live site.
 */
export function Questions({ questions, showPlaceholders }: { questions: { question: string; answer: string }[]; showPlaceholders: boolean }) {
  const shown = questions.filter((q) => q.answer || showPlaceholders);
  if (!shown.length) return null;
  return (
    <section id="questions" className="ed-section ed-questions ed-anchor" aria-labelledby="ed-questions-heading">
      <div className="ed-questions-head">
        <span className="type-label text-muted-foreground">Questions</span>
        <h2 id="ed-questions-heading" className="ed-serif-heading">
          Good to know
        </h2>
      </div>
      <div className="ed-questions-list">
        {shown.map((q) => (
          <details key={q.question} className="ed-question">
            <summary>
              <span>{q.question}</span>
              <span aria-hidden="true" className="ed-question-mark" />
            </summary>
            <p className="ed-question-answer" data-placeholder={q.answer ? undefined : ""}>
              {q.answer || "To be written. This answer is still to come; it shows on previews only and is left out of the live site."}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** For artists: the heading, one sentence, and "House of Singh × …" leading to the proposal form. */
export function ForArtists({ heading, teaser, words }: { heading: string; teaser: string; words: string[] }) {
  return (
    <section id="for-artists" className="ed-section ed-artists2 ed-anchor" aria-labelledby="ed-artists-heading">
      <span className="type-label text-muted-foreground">For artists</span>
      <h2 id="ed-artists-heading" className="ed-serif-heading">
        {heading}
      </h2>
      <p className="ed-artists2-teaser">{keepLastWords(teaser)}</p>
      <ArtistsInvite words={words} href="/editions/artists" />
    </section>
  );
}
