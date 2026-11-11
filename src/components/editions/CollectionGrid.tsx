"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import TextLink from "@/components/TextLink";
import { hotspotPosition } from "@/lib/projectHero";
import { cad, piecesInWords } from "@/lib/editions/format";
import type { SanityImageAsset } from "@/lib/sanityImage";
import { keepLastWords } from "@/lib/keepLastWords";

export type GridPiece = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  soldOut: boolean;
  hasSizes: boolean;
  categoryId: string | null;
  descriptor: string;
  image: SanityImageAsset | null;
  /** False where the piece's Collection is not open (a collaborator's page): no Buy. */
  buyable?: boolean;
};

type Filter = { id: string; label: string };

/**
 * The Collection (canvas "Shop, decisions": two across, full bleed 4:5
 * with generous white space; name and price, the kind beneath; Buy on
 * pointing, always shown on touch). Filters are the Collection's
 * categories; the heading counts what is shown ("Eight pieces", "Prints,
 * three pieces"). Sold out: the price reads Sold out, the photograph
 * softens, and the action becomes Notify me of the next Collection.
 */
export default function CollectionGrid({ pieces, filters, label, next }: { pieces: GridPiece[]; filters: Filter[]; label: string; next: string }) {
  const [active, setActive] = useState<string>("all");
  const shown = useMemo(() => (active === "all" ? pieces : pieces.filter((p) => p.categoryId === active)), [active, pieces]);
  const activeLabel = filters.find((f) => f.id === active)?.label;
  const heading = active === "all" ? piecesInWords(pieces.length) : `${activeLabel}, ${piecesInWords(shown.length).toLowerCase()}`;

  return (
    <section id="collection" aria-labelledby="ed-collection-heading" className="ed-collection">
      <div className="ed-collection-head">
        <div className="ed-collection-title">
          <span className="type-label text-muted-foreground">{label}</span>
          <h2 id="ed-collection-heading" className="font-editorial font-normal text-display-l leading-[1.05] text-foreground" aria-live="polite">
            {heading}
          </h2>
        </div>
        {filters.length > 1 && (
          <div role="group" aria-label="Filter the Collection" className="ed-filters">
            {[{ id: "all", label: "All" }, ...filters].map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={active === f.id}
                onClick={() => setActive(f.id)}
                className="type-label hairline ed-filter"
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <ul className="ed-grid">
        {shown.map((p) => (
          <li key={p._id} className="ed-card" data-sold={p.soldOut ? "" : undefined}>
            <Link href={`/editions/${p.slug}`} className="ed-card-photo" tabIndex={-1} aria-hidden="true">
              {p.image && (
                <SanityImage
                  image={p.image}
                  context="body"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                  objectPosition={hotspotPosition(p.image)}
                  develop={false}
                />
              )}
            </Link>
            <div className="ed-card-line">
              <Link href={`/editions/${p.slug}`} className="ed-card-name hairline">
                {keepLastWords(p.name)}
              </Link>
              <span className="ed-card-price">{p.soldOut ? "Sold out" : cad(p.price)}</span>
            </div>
            <span className="type-label text-muted-foreground">{p.descriptor}</span>
            {p.buyable !== false && (
              <div className="ed-card-action">
                {p.soldOut ? (
                  <TextLink href="/editions#notify">{next}</TextLink>
                ) : (
                  <TextLink href={p.hasSizes ? `/editions/${p.slug}` : `/editions/${p.slug}#buy`}>{p.hasSizes ? "Choose a size" : "Buy"}</TextLink>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
