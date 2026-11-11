import type { Metadata } from "next";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import CollectionSquare from "@/components/editions/CollectionSquare";
import { Spine, SpineSealed } from "@/components/editions/Spine";
import { hotspotPosition } from "@/lib/projectHero";
import { loadCollections } from "@/lib/editions/load";
import { available } from "@/lib/editions/state";
import { collectionTitle, monthIn, pad2, piecesInWords } from "@/lib/editions/format";
import { allSold, closedSentence, collectionsInWords } from "@/lib/editions/view";
import { requireEditions } from "@/lib/editions/enabled";

export const metadata: Metadata = { title: "Archive" };

/**
 * The archive (canvas FL5-Shelf): every closed Collection as a spine on a
 * shelf, oldest first, then the next one's place, outlined while it is
 * sealed, with its square beside the shelf. Below, what each closed
 * Collection held, every piece marked sold or not.
 */
export default async function ArchivePage() {
  await requireEditions();
  const collections = await loadCollections();
  const closed = collections.filter((c) => c.state === "closed").sort((a, b) => a.number - b.number);
  const upcoming = collections.find((c) => c.state !== "closed");

  return (
    <div className="ed-page">
      <section className="ed-shelf-view" aria-labelledby="ed-archive-title">
        <div className="ed-shelf-words">
          <span className="type-label text-muted-foreground">Archive</span>
          <h1 id="ed-archive-title" className="font-editorial font-normal text-display-xl leading-[1.05] text-foreground">
            {closed.length ? collectionsInWords(closed.length) : "The archive"}
          </h1>
          <p className="text-body-l text-muted-foreground">
            {closed.length
              ? "Every Collection, once closed, rests here in the order it was released. Point at a spine to draw it out."
              : `The archive begins when ${collectionTitle(upcoming?.number ?? 1)} closes.`}
          </p>
          {closed.length > 0 && (
            <div className="ed-shelf" role="list" aria-label="Closed Collections">
              {closed.map((c) => (
                <div role="listitem" key={c._id}>
                  <Spine number={c.number} season={c.season} colour={c.colour} href={`#collection-${pad2(c.number)}`} />
                </div>
              ))}
              {upcoming && upcoming.state === "sealed" && (
                <div role="listitem">
                  <SpineSealed number={upcoming.number} />
                </div>
              )}
            </div>
          )}
        </div>
        {upcoming && (
          <div className="ed-shelf-square">
            <Link href="/editions" aria-label={`${collectionTitle(upcoming.number)}, in the Shop`} className="ed-shelf-square-link">
              <CollectionSquare number={upcoming.number} season={upcoming.season} colour={upcoming.colour} pieces={upcoming.pieces.length} state={upcoming.state} soldOut={allSold(upcoming.pieces)} />
            </Link>
          </div>
        )}
      </section>

      {[...closed].reverse().map((c) => (
        <section key={c._id} id={`collection-${pad2(c.number)}`} className="ed-held ed-anchor" aria-labelledby={`held-${c.number}`}>
          <div className="ed-held-head">
            <span className="type-label text-muted-foreground">{`Closed · ${monthIn(c.closes ?? c.opens)}`}</span>
            <h2 id={`held-${c.number}`} className="font-editorial font-normal text-display-l leading-[1.05] text-foreground">
              {`${collectionTitle(c.number)}, ${c.season}`}
            </h2>
            <p className="text-body text-muted-foreground">{closedSentence(c, c.pieces)}</p>
          </div>
          <ul className="ed-held-list" aria-label={piecesInWords(c.pieces.length)}>
            {c.pieces.map((p) => {
              const sold = available(p) === 0;
              return (
                <li key={p._id} className="ed-held-piece">
                  <Link href={`/editions/${p.slug}`} className="ed-held-photo" tabIndex={-1} aria-hidden="true">
                    {p.photographs?.[0] && (
                      <SanityImage image={p.photographs[0]} context="thumbnail" alt="" fill sizes="160px" className="object-cover" objectPosition={hotspotPosition(p.photographs[0])} develop={false} />
                    )}
                  </Link>
                  <Link href={`/editions/${p.slug}`} className="ed-card-name hairline">
                    {p.name}
                  </Link>
                  <span className="type-label text-muted-foreground">{sold ? "Sold" : "Not sold"}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
