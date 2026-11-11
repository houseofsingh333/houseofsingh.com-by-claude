import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CollectionSquare from "@/components/editions/CollectionSquare";
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
import { allSold, closedSentence, collectionLine, gridFilters, gridPiece, stateLine } from "@/lib/editions/view";
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
 * The Shop. Sealed and in early access (Shop design round 2): the
 * Collection card beside the line before the release, the title, the
 * sentence, the release time in five cities, Add to my calendar, Notify me
 * (sealed) and the early access link; then, sealed, How the release works.
 * Open and closed: the square beside the Collection's words, and the
 * Collection itself while it can be bought. Every state then has In the
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

  return (
    <div className="ed-page">
      {before ? (
        <section className="ed-open2" aria-labelledby="ed-title">
          <CollectionCard number={current.number} colour={current.colour} date={cardDate(current.opens)} label={`${title}, released once, on ${dayIn(current.opens)}`} />
          <div className="ed-open2-text">
            <span className="type-label text-muted-foreground ed-open2-eyebrow">{state === "early" ? earlyEyebrow(current, now) : sealedEyebrow(current, now)}</span>
            <h1 id="ed-title" className="font-editorial font-normal text-display-xl leading-none text-foreground">
              {title}
            </h1>
            <p className="ed-open2-sentence">{keepLastWords(current.intro)}</p>
            <ReleaseTimes opens={current.opens} times={cityTimes(current.opens, settings.releaseCities)} />
            <a href="/api/editions/calendar" download className="ed-calendar">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3.5" y="5" width="17" height="15.5" rx="1" />
                <path d="M3.5 10h17M8 3v4M16 3v4" />
              </svg>
              <span>Add to my calendar</span>
            </a>
            {state === "sealed" && (
              <div id="notify" className="ed-notify2 ed-anchor">
                <h2 className="ed-notify2-heading">Be the first to know</h2>
                <NotifyMe collection={title} thanks={`You are on the list for ${title}.`} idSuffix="shop" />
                {askForCode && <EarlyAccessForm wrong={code === "wrong"} />}
              </div>
            )}
          </div>
          {buying && (
            <a href="#collection" className="ed-cue">
              <span className="type-label">The Collection</span>
              <span aria-hidden="true" className="ed-cue-line" />
            </a>
          )}
        </section>
      ) : (
        <section className="ed-open" aria-labelledby="ed-title">
          <CollectionSquare number={current.number} season={current.season} colour={current.colour} pieces={current.pieces.length} state={state} soldOut={allSold(current.pieces)} />
          <div className="ed-open-text">
            <div className="ed-open-words">
              <span className="type-label text-muted-foreground">{stateLine(current, state, now, untilWords(current.opens, now))}</span>
              <h1 id="ed-title" className="font-editorial font-normal text-display-xl leading-none text-foreground">
                {title}
              </h1>
              <p className="ed-open-sentence">{state === "closed" ? closedSentence(current, current.pieces) : current.intro}</p>
              {state === "closed" && (
                <div id="notify" className="ed-anchor">
                  <NotifyMe collection={collectionTitle(current.number + 1)} thanks={`You are on the list for ${collectionTitle(current.number + 1)}.`} idSuffix="shop" />
                </div>
              )}
            </div>
            <div className="ed-open-foot">
              {state === "closed" ? (
                <>
                  <span>{`Collectors of ${title} hear first.`}</span>
                  <Link href="/editions/archive" className="hairline text-foreground">{`See what ${title} held`}</Link>
                </>
              ) : (
                <>
                  <span>{settings.honestLine}</span>
                  <a href="#before-you-buy" className="hairline text-foreground">
                    Before you buy
                  </a>
                </>
              )}
            </div>
          </div>
          {buying && (
            <a href="#collection" className="ed-cue">
              <span className="type-label">The Collection</span>
              <span aria-hidden="true" className="ed-cue-line" />
            </a>
          )}
        </section>
      )}

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
      <InTheMaking entries={current.journal ?? []} />
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
