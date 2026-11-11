import type { Metadata } from "next";
import Link from "next/link";
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
import { makingEntries, closedSentence, collectionLine, gridFilters, gridPiece, stateLine } from "@/lib/editions/view";
import { cardDate, cityTimes, daysUntilShort, earlyEyebrow, sealedEyebrow } from "@/lib/editions/release";
import { keepLastWords } from "@/lib/keepLastWords";
import { shopColour } from "@/lib/editions/palette";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";
import { requireEditions, siteMode } from "@/lib/editions/enabled";

/** In anticipation the live site lets /editions be indexed; otherwise noindex (the layout's). */
export async function generateMetadata(): Promise<Metadata> {
  const indexable = siteMode() === "anticipation";
  return {
    title: { absolute: "Shop, House of Singh Editions" },
    ...(indexable ? { robots: { index: true, follow: true }, alternates: { canonical: "/editions" } } : {}),
  };
}

/** Placeholder answers (a question still to be written) show on previews and locally, never on the live site. */
const showPlaceholders = () => process.env.VERCEL_ENV !== "production";

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
  const { access, preview, code } = await searchParams;
  if (preview) redirect(`/api/editions/preview?secret=${encodeURIComponent(preview.slice(0, 128))}`);
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
  const buying = canBuy(state);
  const before = state === "sealed" || state === "early";
  const title = collectionTitle(current.number);
  const numeral = gurmukhi(current.number).padStart(2, "੦");
  // The fallback for an early access link that did not arrive: a field for the code, once early access has opened.
  const askForCode = !anticipation && state === "sealed" && Boolean(current.earlyAccessCodeHash) && Boolean(current.earlyAccessOpens) && now.getTime() >= Date.parse(current.earlyAccessOpens!);
  const archived = closed.length > 0 || state === "closed";
  const gold = shopColour(current.colour).square;
  // Sealed: the list for this Collection; closed: for the next.
  const notifyFor = collectionTitle(state === "closed" ? current.number + 1 : current.number);

  return (
    <div className="ed-page">
      <section className="ed-open2" aria-labelledby="ed-title">
        <CollectionCard number={current.number} colour={current.colour} date={cardDate(current.opens)} label={`${title}, released once, on ${dayIn(current.opens)}`} />
        <div className="ed-open2-text">
          <span className="type-label text-muted-foreground ed-open2-eyebrow">
            {state === "early" ? earlyEyebrow(current, now) : state === "sealed" ? sealedEyebrow(current, now) : stateLine(current, state, now, untilWords(current.opens, now))}
          </span>
          <h1 id="ed-title" className="font-editorial font-normal text-display-xl leading-none text-foreground">
            {title}
          </h1>
          <p className="ed-open2-sentence">{keepLastWords(state === "closed" ? closedSentence(current, current.pieces) : current.intro)}</p>
          {before && (
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
        {buying && (
          <a href="#collection" className="ed-cue">
            <span className="type-label">The Collection</span>
            <span aria-hidden="true" className="ed-cue-line" />
          </a>
        )}
      </section>

      {buying && !anticipation && (
        <CollectionGrid
          pieces={current.pieces.map((p) => gridPiece(p))}
          filters={gridFilters(current, current.pieces)}
          label={collectionLine(current)}
          next={`Notify me of ${collectionTitle(current.number + 1)}`}
        />
      )}
      {buying && !anticipation && state === "open" && (
        <div id="notify" className="ed-anchor ed-notify-band">
          <span className="type-label text-muted-foreground">The next Collection</span>
          <NotifyMe collection={collectionTitle(current.number + 1)} thanks={`You are on the list for ${collectionTitle(current.number + 1)}.`} idSuffix="next" />
        </div>
      )}

      {before && <HowItWorks steps={EDITIONS_DEFAULTS.howItWorks.map((s) => ({ ...s }))} />}
      <InTheMaking entries={makingEntries(current.journal)} />
      {below}

      {archived && (
        <section className="ed-archive-line" aria-label="The archive">
          <span className="type-label text-muted-foreground">The archive</span>
          <TextLink href="/editions/archive">See the archive</TextLink>
        </section>
      )}

      {state === "sealed" && <ShopBar numeral={numeral} title={title} when={daysUntilShort(current.opens, now)} action="Notify me" target="notify" colour={gold} />}
      {buying && !anticipation && (
        <ShopBar numeral={numeral} title={title} when={state === "early" ? "Early access" : "Open now"} action="Shop the Collection" target="collection" colour={gold} />
      )}
    </div>
  );
}
