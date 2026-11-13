import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import { ARTISTS_DESCRIPTION } from "@/lib/pageDescriptions";
import Link from "@/components/Link";
import ProposalForm from "@/components/editions/ProposalForm";
import { loadCollections, loadSettings, withDefaults } from "@/lib/editions/load";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";
import { collectionTitle, dayIn, pad2 } from "@/lib/editions/format";
import { requireEditions } from "@/lib/editions/enabled";
import { keepLastWords } from "@/lib/keepLastWords";

// Prepared ahead and refreshed every minute, like the other pages (on
// Production; a preview reads the preview cookie, so it renders on each visit).
export const revalidate = 60;

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: "For artists",
    description: ARTISTS_DESCRIPTION,
    alternates: { canonical: "/editions/artists" },
    ...(await shareCard(parent, fullTitle("For artists"), ARTISTS_DESCRIPTION)),
  };
}

/**
 * For artists (canvas FL6-Artists), always open: the invitation and the
 * four steps on the left, the proposal form on the right. Beneath, the
 * artists already in a released Collection, each with their own page.
 */
export default async function ArtistsPage() {
  await requireEditions("any");
  const [rawSettings, collections] = await Promise.all([loadSettings(), loadCollections()]);
  const s = withDefaults(rawSettings);
  const intro = s.artistsInvitation;
  const footnote =
    s.proposalsFor && s.proposalDeadline
      ? `Proposals for ${s.proposalsFor} are open until ${dayIn(s.proposalDeadline)}. ${EDITIONS_DEFAULTS.proposalPromise}`
      : EDITIONS_DEFAULTS.proposalPromise;

  const released = collections.filter((c) => c.state !== "sealed");
  const artists = released
    .map((c) => {
      const seen = new Map<string, { name: string; slug: string }>();
      for (const p of c.pieces) for (const a of p.collaborators ?? []) if (a?.slug) seen.set(a._id, { name: a.name, slug: a.slug });
      return { number: c.number, people: [...seen.values()] };
    })
    .filter((g) => g.people.length > 0);

  return (
    <div className="ed-page">
      <section className="ed-artists" aria-labelledby="ed-artists-title">
        <div className="ed-artists-words">
          <span className="type-label text-muted-foreground">For artists</span>
          <h1 id="ed-artists-title" className="ed-serif-heading">
            {s.artistsHeading}
          </h1>
          <p className="text-body-l text-muted-foreground">{intro}</p>
          <ol className="ed-steps">
            {s.artistsSteps.map((step, i) => (
              <li key={step.title}>
                <span aria-hidden="true" className="ed-step-numeral">
                  {pad2(i + 1)}
                </span>
                <span className="ed-step-title">{step.title}</span>
                <span className="ed-step-text">{keepLastWords(step.text)}</span>
              </li>
            ))}
          </ol>
        </div>
        <ProposalForm footnote={footnote} />
      </section>

      {artists.length > 0 && (
        <section className="ed-artists-list" aria-label="The artists">
          {artists.map((g) => (
            <div key={g.number} className="ed-artists-group">
              <span className="type-label text-muted-foreground">{`The artists of ${collectionTitle(g.number)}`}</span>
              <ul>
                {g.people.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/editions/collaborators/${a.slug}`} className="hairline font-editorial text-display-s text-foreground">
                      {a.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
