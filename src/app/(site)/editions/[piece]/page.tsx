import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PortableText } from "@portabletext/react";
import SanityImage from "@/components/SanityImage";
import TextLink from "@/components/TextLink";
import BuyForm from "@/components/editions/BuyForm";
import PhoneBuyBar from "@/components/editions/PhoneBuyBar";
import { proseComponents } from "@/components/proseComponents";
import { hotspotPosition } from "@/lib/projectHero";
import { sanityFetch } from "@/sanity/fetch";
import { editionsPieceQuery } from "@/lib/editions/queries";
import { accessCookie, loadSettings, loadShipping, withDefaults } from "@/lib/editions/load";
import { hasAccess } from "@/lib/editions/access";
import { available, canBuy, collectionState, sizeAvailable } from "@/lib/editions/state";
import { shippingTable, ZONES } from "@/lib/editions/shipping";
import { REFUSAL_WORDS, type BuyRefusal } from "@/lib/editions/checkout";
import { cad, collectionTitle } from "@/lib/editions/format";
import { editionLine } from "@/lib/editions/view";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";
import type { EditionsCollection, EditionsPiece } from "@/lib/editions/types";

type PieceView = EditionsPiece & {
  collection: (EditionsCollection & { pieces: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes">[] }) | null;
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
  const piece = await load((await params).piece);
  if (!piece) return {};
  return { title: piece.name, description: piece.statement };
}

/** The maker line, with each collaborator's name a link to their page. */
function makerLine(maker: string, collaborators: PieceView["collaborators"]): ReactNode {
  const people = collaborators ?? [];
  if (!people.length) return maker;
  const parts: ReactNode[] = [];
  let rest = maker;
  const missing = [];
  for (const c of people) {
    const at = rest.indexOf(c.name);
    if (at === -1) {
      missing.push(c);
      continue;
    }
    parts.push(rest.slice(0, at));
    parts.push(
      <Link key={c._id} href={`/editions/collaborators/${c.slug}`} className="hairline-rest text-foreground">
        {c.name}
      </Link>,
    );
    rest = rest.slice(at + c.name.length);
  }
  parts.push(rest);
  missing.forEach((c, i) => {
    parts.push(i === 0 ? " with " : " and ");
    parts.push(
      <Link key={c._id} href={`/editions/collaborators/${c.slug}`} className="hairline-rest text-foreground">
        {c.name}
      </Link>,
    );
  });
  return parts;
}

function Fold({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="ed-fold">
      <summary>
        <span>{title}</span>
        <span aria-hidden="true" className="ed-fold-mark" />
      </summary>
      <div className="ed-fold-body">{children}</div>
    </details>
  );
}

/**
 * A piece (canvas Y4b-PieceLuxe): its photographs stacked on the left; on
 * the right, held in place while they scroll, the category and Collection,
 * the name, the price, the statement, the maker, Buy, and the folding
 * sections. Phones: one column, with the price and Buy held at the foot.
 * A piece of a sealed Collection is not shown (404).
 */
export default async function PiecePage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<{ buy?: string }> }) {
  const [{ piece: slug }, { buy }] = await Promise.all([params, searchParams]);
  const [piece, rawSettings, routes, cookie] = await Promise.all([load(slug), loadSettings(), loadShipping(), accessCookie()]);
  if (!piece || !piece.collection) notFound();

  const c = piece.collection;
  const state = collectionState(c, c.pieces ?? [], new Date(), hasAccess(cookie, c.earlyAccessCodeHash));
  if (state === "sealed") notFound();

  const settings = withDefaults(rawSettings);
  const left = available(piece);
  const buying = canBuy(state) && left > 0;
  const prices = shippingTable(routes, piece.shipsFrom, piece.packedWeight);
  const sizes = (piece.sizes ?? []).map((s) => ({ key: s._key, label: s.label, left: sizeAvailable(piece, s._key) }));
  const message = buy ? (BACK_WORDS[buy as BuyRefusal] ?? null) : null;
  const next = collectionTitle(c.number + 1);
  const photos = piece.photographs ?? [];

  return (
    <div className="ed-page">
      <div className="ed-piece-back">
        <TextLink href="/editions#collection" back>
          {collectionTitle(c.number)}
        </TextLink>
      </div>
      <article className="ed-piece" aria-labelledby="ed-piece-name">
        <div className="ed-piece-photos">
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
        </div>
        <div className="ed-piece-panel">
          <span className="type-label text-muted-foreground">
            {piece.category ? `${piece.category.singular} · ` : ""}
            {collectionTitle(c.number)}
          </span>
          <h1 id="ed-piece-name" className="font-editorial font-normal text-display-m leading-[1.1] text-foreground">
            {piece.name}
          </h1>
          <span className="ed-piece-price">{left === 0 ? "Sold out" : cad(piece.price)}</span>
          <p className="ed-piece-statement">{piece.statement}</p>
          <span className="ed-piece-maker">{makerLine(piece.maker, piece.collaborators)}</span>

          <div id="buy" className="ed-anchor">
            {buying ? (
              <BuyForm
                slug={piece.slug}
                sizes={sizes}
                zones={ZONES.map((z) => ({ value: z.value, label: z.label, price: prices[z.value] }))}
                quiet={`${editionLine(piece)} · Secure checkout by Stripe`}
                taxLine={EDITIONS_DEFAULTS.taxLine}
                message={message}
              />
            ) : (
              <div className="ed-buy ed-buy-closed">
                <p className="ed-buy-quiet">{left === 0 ? editionLine(piece) : `${collectionTitle(c.number)} has closed.`}</p>
                <TextLink href="/editions#notify">{`Notify me of ${next}`}</TextLink>
              </div>
            )}
          </div>

          <div className="ed-folds">
            {piece.story && piece.story.length > 0 && (
              <Fold title="The story">
                <PortableText value={piece.story} components={proseComponents} />
              </Fold>
            )}
            {piece.details && <Fold title="Details">{piece.details}</Fold>}
            {piece.sizeAndFit && <Fold title="Size and fit">{piece.sizeAndFit}</Fold>}
            <Fold title="Shipping and returns">
              {`Ships from ${ORIGIN_WORDS[piece.shipsFrom] ?? "Canada"}. ${EDITIONS_DEFAULTS.shippingLine} ${settings.returnsLine}`}
            </Fold>
            {piece.care && <Fold title="Care">{piece.care}</Fold>}
          </div>

          <p className="ed-piece-foot">
            A question about this piece?{" "}
            <Link href="/contact" className="hairline-rest text-foreground">
              Write to Maninder
            </Link>
            {" · "}
            <Link href="/editions#before-you-buy" className="hairline-rest text-foreground">
              Before you buy
            </Link>
            {piece.journal && (
              <>
                {" · "}
                <Link href={`/journal/${piece.journal.slug}`} className="hairline-rest text-foreground">
                  From the Journal
                </Link>
              </>
            )}
          </p>
        </div>
      </article>
      {buying && <PhoneBuyBar price={cad(piece.price)} label={sizes.length ? "Choose a size" : "Buy"} />}
    </div>
  );
}
