import { Fragment } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { shareCard } from "@/lib/share-metadata";
import Link from "@/components/Link";
import { redirect } from "next/navigation";
import CollectionCard from "@/components/editions/CollectionCard";
import CollectionGrid from "@/components/editions/CollectionGrid";
import NotifyMe from "@/components/editions/NotifyMe";
import ReleaseTimes from "@/components/editions/ReleaseTimes";
import ShopBar from "@/components/editions/ShopBar";
import EarlyAccessForm from "@/components/editions/EarlyAccessForm";
import { BeforeYouBuy, ForArtists, HowItWorks, InTheMaking, Questions } from "@/components/editions/ShopSections";
import TextLink from "@/components/TextLink";
import { loadCollections, loadSettings, withDefaults } from "@/lib/editions/load";
import { canBuy, shopNow, untilWords } from "@/lib/editions/state";
import { collectionTitle, dayIn, gurmukhi } from "@/lib/editions/format";
import { makingEntries, shopSections, showPlaceholders, stillAvailable, visibleQuestions, closedSentence, gridFilters, gridPiece, stateLine } from "@/lib/editions/view";
import { cardDate, cityTimes, daysUntilShort, earlyEyebrow, sealedEyebrow } from "@/lib/editions/release";
import { keepLastWords } from "@/lib/keepLastWords";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";
import { previewAllowed, requireEditions, siteMode } from "@/lib/editions/enabled";

// Prepared ahead and refreshed every minute, like the other pages (on
// Production; a preview reads the preview cookie, so it renders on each visit).
export const revalidate = 60;

/** The share image for Collection 01 (public/images): its card on the canvas, 1200 by 630. */
const SHARE_IMAGES: Record<number, string> = { 1: "/images/og-editions-collection-01.png" };

/**
 * In anticipation the live site lets /editions be indexed; otherwise
 * noindex (the layout's). The share card: "Collection 01 · House of Singh
 * Editions", its sentence and when it opens, and the Collection's card.
 */
export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const indexable = siteMode() === "anticipation";
  const current = (await loadCollections().catch(() => []))[0];
  const share = current
    ? await shareCard(parent, `${collectionTitle(current.number)} · ${EDITIONS_DEFAULTS.brand}`, `${current.intro.trim()} Opens ${dayIn(current.opens)}.`, "/editions")
    : {};
  const image = current && SHARE_IMAGES[current.number];
  const images = image ? [{ url: image, width: 1200, height: 630, alt: `${collectionTitle(current!.number)}, ${EDITIONS_DEFAULTS.brand}: the Collection's card` }] : undefined;
  return {
    title: { absolute: "Shop, House of Singh Editions" },
    ...(current ? { description: `${current.intro.trim()} Opens ${dayIn(current.opens)}.` } : {}),
    ...share,
    ...(images ? { openGraph: { ...share.openGraph, url: "/editions", images }, twitter: { ...share.twitter, card: "summary_large_image", images } } : {}),
    ...(indexable ? { robots: { index: true, follow: true }, alternates: { canonical: "/editions" } } : {}),
  };
}

/**
 * The Shop (Shop design round 2). In every state the Collection card
 * beside the line above the title, the title and the sentence. Sealed and
 * in early access: the release time in five cities and Add to my
 * calendar; sealed: Notify me and the early access link, then How the
 * release works. Open: the Collection itself while it can be bought.
 * Closed: Notify me for the next, and the way to what it held. Every state then has In the
 * making (when Journal entries are chosen), Before you buy, Questions,
 * For artists and, once a Collection has closed, the archive. On phones a
 * floating bar leads back to Notify me (or the Collection). The current
 * Collection is the one with the highest number.
 */
export default async function EditionsPage({ searchParams }: { searchParams: Promise<{ access?: string; preview?: string; code?: string }> }) {
  const mode = await requireEditions("any");
  // The address's query (the preview link, early access) matters only on a
  // preview or in the full Shop. On Production in anticipation it is never
  // read, so this page is prepared ahead and cached like the others.
  const { access, preview, code } = previewAllowed() || mode === "full" ? await searchParams : {};
  if (preview && previewAllowed()) redirect(`/api/editions/preview?secret=${encodeURIComponent(preview.slice(0, 128))}`);
  if (access && mode === "full") redirect(`/api/editions/access?code=${encodeURIComponent(access.slice(0, 64))}`);
  const anticipation = mode === "anticipation";

  const [collections, rawSettings] = await Promise.all([loadCollections(), loadSettings()]);
  const settings = withDefaults(rawSettings);
  const current = collections[0];
  const closed = collections.filter((c) => c.state === "closed" && c !== current);
  const now = shopNow();

  const below = (
    <>
      <BeforeYouBuy heading={EDITIONS_DEFAULTS.beforeYouBuyHeading} notes={settings.beforeYouBuy} />
      <Questions questions={settings.questions} showPlaceholders={showPlaceholders()} />
      <ForArtists heading={settings.artistsHeading} teaser={settings.artistsTeaser} words={settings.artistsWords} />
    </>
  );

  if (!current) {
    return (
      <div className="ed-page">
        <section className="ed-open ed-open-empty">
          <div className="ed-open-text">
            <h1 className="font-editorial font-normal text-display-xl leading-[1.05] text-foreground">{EDITIONS_DEFAULTS.brand}</h1>
            <div id="notify" className="ed-anchor">
              <NotifyMe collection="Collection 01" thanks="You are on the list for Collection 01." idSuffix="shop" />
            </div>
          </div>
        </section>
        {below}
      </div>
    );
  }

  // Anticipation: always the sealed Collection, whatever its dates say.
  const state = anticipation ? "sealed" : current.state;
  // The same rule the Shop's menu uses (layout.tsx), so it only offers what is here.
  const sections = shopSections({ state, anticipation, questions: visibleQuestions(settings.questions, showPlaceholders()).length });
  const buying = canBuy(state);
  const until = current.closes ? dayIn(current.closes) : null;
  const eyebrow =
    state === "early"
      ? earlyEyebrow(current, now)
      : state === "sealed"
        ? sealedEyebrow(current, now)
        : state === "open"
          ? until
            ? `Open · until ${until}`
            : "Open"
          : stateLine(current, state, now, untilWords(current.opens, now));
  const nextName = settings.nextCollection;
  const title = collectionTitle(current.number);
  const numeral = gurmukhi(current.number).padStart(2, "੦");
  // The fallback for an early access link that did not arrive: a field for the code, once early access has opened.
  const askForCode = !anticipation && state === "sealed" && Boolean(current.earlyAccessCodeHash) && Boolean(current.earlyAccessOpens) && now.getTime() >= Date.parse(current.earlyAccessOpens!);
  const archived = closed.length > 0 || state === "closed";
  // Sealed: the list for this Collection; closed: for the next.
  const notifyFor = collectionTitle(state === "closed" ? current.number + 1 : current.number);

  return (
    <div className="ed-page">
      <section className="ed-open2" data-state={state} aria-labelledby="ed-title">
        <CollectionCard number={current.number} colour={current.colour} date={cardDate(current.opens)} label={`${title}, released once, on ${dayIn(current.opens)}`} />
        <div className="ed-open2-text">
          <span className="type-label text-muted-foreground ed-open2-eyebrow">
            {/* Where the screen is too narrow, the label breaks at its "·",
                each half whole; the space between them is the only break (audit M2). */}
            {String(eyebrow)
              .split(" · ")
              .map((part, i, all) => (
                <Fragment key={i}>
                  <span className="ed-open2-eyebrow-part">{i < all.length - 1 ? `${part} ·` : part}</span>
                  {i < all.length - 1 ? " " : null}
                </Fragment>
              ))}
          </span>
          <h1 id="ed-title" className="font-editorial font-normal text-display-xl leading-none text-foreground">
            {title}
          </h1>
          <p className="ed-open2-sentence">{keepLastWords(state === "closed" ? closedSentence(current, current.pieces) : current.intro)}</p>
          {buying && (
            <>
              <p className="ed-open2-avail">{keepLastWords(`${stillAvailable(current.pieces)} still available, ${until ? `until ${until} or until gone` : "until gone"}.`)}</p>
              <dl className="ed-facts">
                <div>
                  <dt className="type-label text-muted-foreground">Still available</dt>
                  <dd>{stillAvailable(current.pieces)}</dd>
                </div>
                <div>
                  <dt className="type-label text-muted-foreground">Open until</dt>
                  <dd>{until ? `${until}, or until gone` : "Until gone"}</dd>
                </div>
              </dl>
              <a href="#collection" className="text-link ed-see">
                <span className="text-link-text">See the Collection</span>
                <span aria-hidden="true" className="text-link-arrow">
                  {"\u2193"}
                </span>
              </a>
            </>
          )}
          {state === "sealed" && (
            <>
              <ReleaseTimes opens={current.opens} times={cityTimes(current.opens, settings.releaseCities)} />
              <a href="/api/editions/calendar" download className="ed-calendar">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3.5" y="5" width="17" height="15.5" rx="1" />
                  <path d="M3.5 10h17M8 3v4M16 3v4" />
                </svg>
                <span>Add to my calendar</span>
              </a>
            </>
          )}
          {(state === "sealed" || state === "closed") && (
            <div id="notify" className="ed-notify2 ed-anchor">
              <h2 className="ed-notify2-heading">Be the first to know</h2>
              <NotifyMe collection={notifyFor} thanks={`You are on the list for ${notifyFor}.`} idSuffix="shop" />
              {askForCode && <EarlyAccessForm wrong={code === "wrong"} />}
            </div>
          )}
          {state === "closed" && (
            <Link href="/editions/archive" className="ed-calendar">
              <span>{`See what ${title} held`}</span>
            </Link>
          )}
        </div>
      </section>

      {sections.collection && (
        <CollectionGrid
          pieces={current.pieces.map((p) => gridPiece(p, true, settings.fewLeft))}
          filters={gridFilters(current, current.pieces)}
          label={title}
          next={`Notify me of ${nextName}`}
        />
      )}
      {buying && !anticipation && (
        <div id="notify" className="ed-anchor ed-notify-band">
          <span className="type-label text-muted-foreground">The next Collection</span>
          <NotifyMe collection={collectionTitle(current.number + 1)} thanks={`You are on the list for ${collectionTitle(current.number + 1)}.`} idSuffix="next" />
        </div>
      )}

      {sections.how && <HowItWorks steps={EDITIONS_DEFAULTS.howItWorks.map((s) => ({ ...s }))} />}
      <InTheMaking entries={makingEntries(current.journal)} />
      {below}

      {archived && (
        <section className="ed-archive-line" aria-label="The archive">
          <span className="type-label text-muted-foreground">The archive</span>
          <TextLink href="/editions/archive">See the archive</TextLink>
        </section>
      )}

      {state === "sealed" && <ShopBar numeral={numeral} title={title} when={daysUntilShort(current.opens, now)} action="Notify me" target="notify" />}

    </div>
  );
}
