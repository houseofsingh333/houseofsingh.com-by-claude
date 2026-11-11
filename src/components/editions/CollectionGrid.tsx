"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import TextLink from "@/components/TextLink";
import { hotspotPosition } from "@/lib/projectHero";
import { cad } from "@/lib/editions/format";
import DrawnTimes from "./DrawnTimes";
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
  /** How many are left, when few (never for a one of one). */
  fewLeft?: number | null;
  /** A one of one: its type line reads "One of one", never a count. */
  oneOfOne?: boolean;
  /** Made with: a collaborator or maker, shown after the kind with the drawn ×. */
  partner?: string | null;
};

type Filter = { id: string; label: string };

/**
 * The Collection (canvas "Shop, decisions" and Shop design round 3): the
 * Collection's label over "The pieces"; filters for the categories it
 * holds; two across, each card whole on one screen; name in Playfair and
 * price, the kind beneath, then " · 2 left" in dark brass when few are
 * left and " · × Sample Artist" for a collaboration. Buy on pointing,
 * always shown on touch. Sold out: the photograph greys and softens, name
 * and price turn grey, the price reads Sold out, and the action becomes
 * Notify me of the next Collection, leading to the field.
 */
export default function CollectionGrid({ pieces, filters, label, next }: { pieces: GridPiece[]; filters: Filter[]; label: string; next: string }) {
  const [active, setActive] = useState<string>("all");
  const shown = useMemo(() => (active === "all" ? pieces : pieces.filter((p) => p.categoryId === active)), [active, pieces]);

  return (
    <section id="collection" aria-labelledby="ed-collection-heading" className="ed-collection">
      <div className="ed-collection-head">
        <div className="ed-collection-title">
          <span className="type-label text-muted-foreground">{label}</span>
          <h2 id="ed-collection-heading" className="font-editorial font-normal text-display-l leading-[1.05] text-foreground">
            The pieces
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
            <span className="type-label text-muted-foreground ed-card-kind">
              <span>{p.descriptor}</span>
              {p.oneOfOne ? <span>{" · One of one"}</span> : !p.soldOut && p.fewLeft ? <span className="ed-few">{` · ${p.fewLeft} left`}</span> : null}
              {p.partner ? (
                <span>
                  {" · "}
                  <DrawnTimes className="ed-x-label" />
                  <span className="sr-only">with </span>
                  {p.partner}
                </span>
              ) : null}
            </span>
            {p.buyable !== false && (
              <div className="ed-card-action">
                {p.soldOut ? (
                  <TextLink href="#notify">{next}</TextLink>
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
