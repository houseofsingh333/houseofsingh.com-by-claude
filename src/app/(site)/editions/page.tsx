import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CollectionSquare from "@/components/editions/CollectionSquare";
import CollectionGrid from "@/components/editions/CollectionGrid";
import NotifyMe from "@/components/editions/NotifyMe";
import { Spine } from "@/components/editions/Spine";
import TextLink from "@/components/TextLink";
import { loadCollections, loadSettings, withDefaults } from "@/lib/editions/load";
import { canBuy, releaseTimes, shopNow, untilWords } from "@/lib/editions/state";
import { collectionTitle, dayIn } from "@/lib/editions/format";
import { allSold, closedSentence, collectionLine, gridFilters, gridPiece, stateLine } from "@/lib/editions/view";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";
import EarlyAccessForm from "@/components/editions/EarlyAccessForm";
import { requireEditions, siteMode } from "@/lib/editions/enabled";

/** In anticipation the live site lets /editions be indexed; otherwise noindex (the layout's). */
export async function generateMetadata(): Promise<Metadata> {
  const indexable = siteMode() === "anticipation";
  return {
    title: { absolute: "House of Singh Editions" },
    ...(indexable ? { robots: { index: true, follow: true }, alternates: { canonical: "/editions" } } : {}),
  };
}

/**
 * The Shop (canvas "Shop, the flow", SF-ShopFinal, FL3-Closed and
 * FL4-Second): the current Collection's square beside its title and
 * sentence; Notify me while it is sealed or once it has closed; the
 * Collection itself in early access and open; then Before you buy, For
 * artists and the archive line. The current Collection is the one with
 * the highest number.
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

  if (!current) {
    return (
      <div className="ed-page">
        <section className="ed-open ed-open-empty">
          <div className="ed-open-text">
            <h1 className="font-editorial font-normal text-display-xl leading-[1.05] text-foreground">{EDITIONS_DEFAULTS.brand}</h1>
            <p className="text-body-l text-muted-foreground">{EDITIONS_DEFAULTS.beforeYouBuy[3]}</p>
            <NotifyMe collection="Collection 01" thanks="You are on the list for Collection 01." idSuffix="shop" />
          </div>
        </section>
        {!anticipation && <BeforeYouBuy notes={settings.beforeYouBuy} />}
      </div>
    );
  }

  // Anticipation: always the sealed Collection, whatever its dates say.
  const state = anticipation ? "sealed" : current.state;
  const buying = canBuy(state);
  const nextNumber = state === "closed" ? current.number + 1 : current.number;
  const nextTitle = collectionTitle(nextNumber);
  const sentence =
    state === "closed"
      ? closedSentence(current, current.pieces)
      : state === "sealed"
        ? `${current.intro} Opens at ${releaseTimes(current.opens)}.`
        : current.intro;
  const previous = state === "sealed" && !anticipation ? closed[0] : undefined;
  // The fallback for an early access link that did not arrive: a field for the code, once early access has opened.
  const askForCode = !anticipation && state === "sealed" && Boolean(current.earlyAccessCodeHash) && Boolean(current.earlyAccessOpens) && now.getTime() >= Date.parse(current.earlyAccessOpens!);

  return (
    <div className="ed-page">
      <section className="ed-open" aria-labelledby="ed-title">
        <CollectionSquare number={current.number} season={current.season} colour={current.colour} pieces={current.pieces.length} state={state} soldOut={allSold(current.pieces)} />
        <div className="ed-open-text">
          <div className="ed-open-words">
            <span className="type-label text-muted-foreground">{stateLine(current, state, now, untilWords(current.opens, now))}</span>
            <h1 id="ed-title" className="font-editorial font-normal text-display-xl leading-none text-foreground">
              {collectionTitle(current.number)}
            </h1>
            <p className="ed-open-sentence">{sentence}</p>
            {(state === "sealed" || state === "closed") && (
              <div id="notify" className="ed-anchor">
                <NotifyMe collection={nextTitle} thanks={`You are on the list for ${nextTitle}.`} idSuffix="shop" />
              </div>
            )}
            {askForCode && <EarlyAccessForm wrong={code === "wrong"} />}
          </div>
          <div className="ed-open-foot">
            {state === "closed" ? (
              <>
                <span>{`Collectors of ${collectionTitle(current.number)} hear first.`}</span>
                <Link href="/editions/archive" className="hairline text-foreground">{`See what ${collectionTitle(current.number)} held`}</Link>
              </>
            ) : previous ? (
              <>
                <span className="ed-open-archive">
                  <span className="type-label">Archive</span>
                  <Spine number={previous.number} season={previous.season} colour={previous.colour} href="/editions/archive" small />
                </span>
                <span>{`Collectors of ${collectionTitle(previous.number)} enter first.`}</span>
              </>
            ) : anticipation ? (
              <span>{settings.honestLine}</span>
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

      {!anticipation && (
        <>
      {buying && (
        <CollectionGrid
          pieces={current.pieces.map((p) => gridPiece(p))}
          filters={gridFilters(current, current.pieces)}
          label={collectionLine(current)}
          next={`Notify me of ${collectionTitle(current.number + 1)}`}
        />
      )}
      {buying && (
        <div id="notify" className="ed-anchor ed-notify-band">
          <span className="type-label text-muted-foreground">The next Collection</span>
          <NotifyMe collection={collectionTitle(current.number + 1)} thanks={`You are on the list for ${collectionTitle(current.number + 1)}.`} idSuffix="next" />
        </div>
      )}

      <BeforeYouBuy notes={settings.beforeYouBuy} />

      <section className="ed-artists-teaser" aria-labelledby="ed-artists-heading">
        <div className="ed-artists-words">
          <span className="type-label text-muted-foreground">For artists</span>
          <h2 id="ed-artists-heading" className="ed-sentence-heading">
            {settings.artistsHeading}
          </h2>
          <p className="text-body text-muted-foreground">
            {settings.artistsInvitation}
            {settings.proposalsFor && settings.proposalDeadline && ` Proposals for ${settings.proposalsFor} are open until ${dayIn(settings.proposalDeadline)}.`}
          </p>
        </div>
        <div className="ed-artists-act">
          <TextLink href="/editions/artists">Propose a collaboration</TextLink>
        </div>
      </section>

      {(closed.length > 0 || state === "closed") && (
        <section className="ed-archive-line" aria-label="The archive">
          <span className="type-label text-muted-foreground">The archive</span>
          <TextLink href="/editions/archive">See the archive</TextLink>
        </section>
      )}
        </>
      )}
    </div>
  );
}

/** Before you buy: what this is, and what it is not (numbered notes), and the terms of sale. */
function BeforeYouBuy({ notes }: { notes: string[] }) {
  return (
    <section id="before-you-buy" className="ed-before ed-anchor" aria-labelledby="ed-before-heading">
      <div className="ed-before-head">
        <span className="type-label text-muted-foreground">Before you buy</span>
        <h2 id="ed-before-heading" className="ed-sentence-heading">
          {EDITIONS_DEFAULTS.beforeYouBuyHeading}
        </h2>
        <TextLink href="/editions/terms">Terms of sale</TextLink>
      </div>
      <ol className="ed-before-notes">
        {notes.map((n, i) => (
          <li key={i}>
            <span aria-hidden="true" className="ed-before-numeral">
              {i + 1}
            </span>
            <span>{n}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
