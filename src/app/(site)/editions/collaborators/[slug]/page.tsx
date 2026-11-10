import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SanityImage from "@/components/SanityImage";
import TextLink from "@/components/TextLink";
import CollectionGrid from "@/components/editions/CollectionGrid";
import { hotspotPosition } from "@/lib/projectHero";
import { sanityFetch } from "@/sanity/fetch";
import { editionsCollaboratorQuery } from "@/lib/editions/queries";
import { canBuy, collectionState, shopNow } from "@/lib/editions/state";
import { gridPiece } from "@/lib/editions/view";
import type { EditionsCollaborator, EditionsCollection, EditionsPiece } from "@/lib/editions/types";
import { editionsEnabled, requireEditions } from "@/lib/editions/enabled";

type Collaborator = EditionsCollaborator & {
  pieces: (EditionsPiece & { collection: Pick<EditionsCollection, "number" | "season" | "opens" | "closes" | "earlyAccessOpens"> | null })[];
};

async function load(slug: string) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  return sanityFetch<Collaborator | null>({ query: editionsCollaboratorQuery, params: { slug }, revalidate: 60 });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  if (!editionsEnabled()) return {};
  const c = await load((await params).slug);
  return c ? { title: c.name } : {};
}

/**
 * A collaborator's page ("Released: in the next Collection, with your own
 * page"): their portrait, name, what they make and where, a few lines,
 * their links, and the pieces made together that have been released.
 */
export default async function CollaboratorPage({ params }: { params: Promise<{ slug: string }> }) {
  requireEditions();
  const c = await load((await params).slug);
  if (!c) notFound();
  const now = shopNow();
  // Released pieces only, and Buy only where the Collection is open to
  // everyone (early access is the Shop page's, with its code).
  const pieces = (c.pieces ?? [])
    .map((p) => ({ p, state: p.collection ? collectionState(p.collection, [p], now, false) : "sealed" }))
    .filter(({ state }) => state !== "sealed");

  return (
    <div className="ed-page">
      <div className="ed-piece-back">
        <TextLink href="/editions/artists" back>
          For artists
        </TextLink>
      </div>
      <section className="ed-person" aria-labelledby="ed-person-name">
        {c.portrait && (
          <div className="ed-person-photo">
            <SanityImage image={c.portrait} context="body" fill priority sizes="(min-width: 1024px) 400px, 100vw" className="object-cover" objectPosition={hotspotPosition(c.portrait)} develop={false} />
          </div>
        )}
        <div className="ed-person-words">
          <span className="type-label text-muted-foreground">{[c.discipline, c.city].filter(Boolean).join(" · ") || "Collaborator"}</span>
          <h1 id="ed-person-name" className="font-editorial font-normal text-display-xl leading-[1.05] text-foreground">
            {c.name}
          </h1>
          {c.text && <p className="text-body-l text-muted-foreground">{c.text}</p>}
          {c.links && c.links.length > 0 && (
            <ul className="ed-person-links">
              {c.links.map((l) => (
                <li key={l._key}>
                  <TextLink href={l.url} external>
                    {l.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      {pieces.length > 0 && (
        <CollectionGrid
          pieces={pieces.map(({ p, state }) => gridPiece(p, canBuy(state)))}
          filters={[]}
          label="Made together"
          next="Notify me of the next Collection"
        />
      )}
    </div>
  );
}
