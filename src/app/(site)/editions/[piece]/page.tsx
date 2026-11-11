import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import SanityImage from "@/components/SanityImage";
import TextLink from "@/components/TextLink";
import BuyForm from "@/components/editions/BuyForm";
import PhoneBuyBar from "@/components/editions/PhoneBuyBar";
import PieceGallery, { PhotoCount } from "@/components/editions/PieceGallery";
import DrawnTimes from "@/components/editions/DrawnTimes";
import { hotspotPosition } from "@/lib/projectHero";
import { sanityFetch } from "@/sanity/fetch";
import { editionsPieceQuery } from "@/lib/editions/queries";
import { accessCookie, loadSettings, loadShipping, withDefaults } from "@/lib/editions/load";
import { hasAccess } from "@/lib/editions/access";
import { available, canBuy, collectionState, shopNow, sizeAvailable } from "@/lib/editions/state";
import { shippingTable, ZONES } from "@/lib/editions/shipping";
import { REFUSAL_WORDS, type BuyRefusal } from "@/lib/editions/checkout";
import { cad, collectionTitle } from "@/lib/editions/format";
import { editionLine, fewLeft, madeBy } from "@/lib/editions/view";
import { taxMode } from "@/lib/editions/tax-rates";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";
import type { EditionsCollection, EditionsPiece } from "@/lib/editions/types";
import { requireEditions, viewerMode } from "@/lib/editions/enabled";
import { keepLastWords } from "@/lib/keepLastWords";

type PieceView = EditionsPiece & {
  collection: (EditionsCollection & { pieces: (Pick<EditionsPiece, "_id" | "name" | "slug" | "quantity" | "soldCount" | "sizes"> & { photo?: EditionsPiece["photographs"][number] | null })[] }) | null;
};

type Params = { piece: string };

/** The words for a refusal that comes back from checkout (?buy=…). */
const BACK_WORDS: Record<string, string> = {
  ...REFUSAL_WORDS,
  "no-zone": "Choose where it ships.",
  busy: "Too many tries at once. Wait a minute, then try again.",
  unavailable: "Checkout is not available just now. Please try again shortly.",
};

const ORIGIN_WORDS = { canada: "Canada", india: "India" } as const;

async function load(slug: string) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  return sanityFetch<PieceView | null>({ query: editionsPieceQuery, params: { slug }, revalidate: 30 });
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  if ((await viewerMode()) !== "full") return {};
  const piece = await load((await params).piece);
  if (!piece) return {};
  return { title: piece.name, description: piece.statement };
}

/** A folding section, styled like the Shop's Questions (the plus turns to a cross). */
function Fold({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="ed-question ed-fold2">
      <summary>
        <span>{title}</span>
        <span aria-hidden="true" className="ed-question-mark" />
      </summary>
      <div className="ed-question-answer ed-fold2-body">{children}</div>
    </details>
  );
}

/**
 * A piece (Shop design round 3). Desktop: "← Collection 01", the
 * photographs stacked on the left; on the right, held in place while they
 * scroll, the kind, the name, the price (and "2 left" when few), Made by
 * between two hairlines, the statement, sizes, Ships to and Buy, then the
 * folding sections. Phones: the photographs as a rail to swipe, with "1 of
 * 3" beside the way back, then the same column, and a bar with the price
 * and Buy once Buy has scrolled away. At the end: the way back on the
 * left, the next piece (with its photograph) on the right. A piece of a
 * sealed Collection is not shown (404).
 */
export default async function PiecePage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<{ buy?: string }> }) {
  await requireEditions();
  const [{ piece: slug }, { buy }] = await Promise.all([params, searchParams]);
  const [piece, rawSettings, routes, cookie] = await Promise.all([load(slug), loadSettings(), loadShipping(), accessCookie()]);
  if (!piece || !piece.collection) notFound();

  const c = piece.collection;
  const state = collectionState(c, c.pieces ?? [], shopNow(), hasAccess(cookie, c.earlyAccessCodeHash));
  if (state === "sealed") notFound();

  const settings = withDefaults(rawSettings);
  const left = available(piece);
  const buying = canBuy(state) && left > 0;
  const few = buying ? fewLeft(piece, settings.fewLeft) : null;
  const prices = shippingTable(routes, piece.shipsFrom, piece.packedWeight);
  const sizes = (piece.sizes ?? []).map((s) => ({ key: s._key, label: s.label, left: sizeAvailable(piece, s._key) }));
  const message = buy ? (BACK_WORDS[buy as BuyRefusal] ?? null) : null;
  const title = collectionTitle(c.number);
  const photos = piece.photographs ?? [];
  const order = c.pieces ?? [];
  const at = order.findIndex((p) => p._id === piece._id);
  const following = order.length > 1 && at !== -1 ? order[(at + 1) % order.length] : null;
  const made = madeBy(piece);

  return (
    <div className="ed-page">
      <div className="ed-piece-back">
        <TextLink href="/editions#collection" back>
          {title}
        </TextLink>
        {photos.length > 1 && <PhotoCount total={photos.length} />}
      </div>
      <article className="ed-piece ed-piece3" aria-labelledby="ed-piece-name">
        <PieceGallery>
          {photos.map((p, i) => (
            <div key={p.url + i} className="ed-piece-photo">
              <SanityImage
                image={p}
                context="hero"
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
                objectPosition={hotspotPosition(p)}
                develop={false}
              />
            </div>
          ))}
        </PieceGallery>
        <div className="ed-piece-panel">
          <span className="type-label text-muted-foreground">
            {piece.category ? `${piece.category.singular} · ` : ""}
            {title}
          </span>
          <h1 id="ed-piece-name" className="font-editorial font-normal text-display-l leading-[1.1] text-foreground">
            {keepLastWords(piece.name)}
          </h1>
          <p className="ed-piece-price">
            <span>{left === 0 ? "Sold out" : cad(piece.price)}</span>
            {piece.editionType === "one-of-one" ? <span className="ed-piece-one">One of one</span> : few ? <span className="ed-few">{`${few} left`}</span> : null}
          </p>

          <div className="ed-madeby">
            <span className="type-label text-muted-foreground">Made by</span>
            <p className="ed-madeby-line">
              House of Singh
              {made.partner && (
                <>
                  <DrawnTimes className="ed-x-madeby" />
                  <span className="sr-only">with </span>
                  {made.partner}
                </>
              )}
            </p>
            {made.about && (
              <Link href={made.about.href} className="ed-madeby-about hairline-rest">
                {`About ${made.about.first}`}
              </Link>
            )}
          </div>

          <p className="ed-piece-statement">{keepLastWords(piece.statement)}</p>

          <div id="buy" className="ed-anchor ed-piece-buy">
            {buying ? (
              <BuyForm
                slug={piece.slug}
                price={piece.price}
                sizes={sizes}
                zones={ZONES.map((z) => ({ value: z.value, label: z.label, price: prices[z.value] }))}
                taxMode={taxMode()}
                message={message}
                words={BACK_WORDS}
              />
            ) : (
              <div className="ed-buy ed-buy-closed">
                <p className="ed-buy-quiet">{left === 0 ? editionLine(piece) : `${title} has closed.`}</p>
                <TextLink href="/editions#notify">{keepLastWords(`Notify me of ${settings.nextCollection}`)}</TextLink>
              </div>
            )}
          </div>

          <div className="ed-folds2">
            {piece.details && <Fold title="Details">{piece.details}</Fold>}
            {sizes.length > 0 && piece.sizeAndFit && <Fold title="Size and fit">{piece.sizeAndFit}</Fold>}
            <Fold title="Shipping and returns">{`Ships from ${ORIGIN_WORDS[piece.shipsFrom] ?? "Canada"}. ${EDITIONS_DEFAULTS.shippingLine} ${settings.returnsLine}`}</Fold>
            {piece.care && <Fold title="Care">{piece.care}</Fold>}
          </div>
        </div>
      </article>

      <nav className="ed-piece-next2" aria-label="More from the Collection">
        <Link href="/editions#collection" className="ed-back-small">
          <span aria-hidden="true">{"\u2190"}</span>
          <span className="ed-back-wide">Back to the Collection</span>
          <span className="ed-back-narrow">Collection</span>
        </Link>
        {following && (
          <Link href={`/editions/${following.slug}`} className="ed-next">
            <span className="type-label text-muted-foreground">Next</span>
            <span className="ed-next-name">
              {keepLastWords(following.name)} <span aria-hidden="true">{"\u2192"}</span>
            </span>
            {following.photo?.url && (
              <span className="ed-next-photo">
                <SanityImage image={following.photo} context="body" alt="" fill sizes="160px" className="object-cover" objectPosition={hotspotPosition(following.photo)} develop={false} />
              </span>
            )}
          </Link>
        )}
      </nav>
      {buying && <PhoneBuyBar name={piece.name} price={cad(piece.price)} />}
    </div>
  );
}
