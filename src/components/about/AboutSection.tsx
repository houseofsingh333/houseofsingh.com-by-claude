import type { ReactNode } from "react";
import { PortableText } from "@portabletext/react";
import { proseComponents } from "@/components/proseComponents";
import { storyFlow } from "@/lib/portableText";
import type { AboutPageData } from "@/lib/types";
import { FALLBACK_BIO_PARAGRAPHS, FALLBACK_MONIKER_PARAGRAPHS } from "./about-constants";
import AboutPortrait from "./AboutPortrait";
import Conversation from "./Conversation";
import JourneyWalk from "./JourneyWalk";
import PracticeReveal from "./PracticeReveal";
import PressCuttings from "./PressCuttings";

/*
 * The About page in six chapters:
 *   I    the portrait, the opening quote, the name and roles
 *   II   the story: the founder bio in short paragraphs, one sentence lifted
 *   III  the practice: the crest and the practice text, centred
 *   IV   in print: Featured On as framed press cuttings
 *   V    a walk through the years: the Journey milestones
 *   VI   in conversation: Rapid Fire
 * All text comes from the About page in Sanity.
 */

/** "Creative director, photographer and multidisciplinary designer" from the roles list. */
function rolesLine(roles: string[]): string {
  const lower = roles.map((r, i) => (i === 0 ? r.charAt(0).toUpperCase() + r.slice(1).toLowerCase() : r.toLowerCase()));
  if (lower.length < 2) return lower.join("");
  return `${lower.slice(0, -1).join(", ")} and ${lower[lower.length - 1]}`;
}

/** A chapter's brass numeral with its small label. */
function ChapterMark({ numeral, label, children }: { numeral: string; label?: string; children?: ReactNode }) {
  return (
    <div className="flex items-baseline gap-4">
      <span aria-hidden="true" className="font-editorial italic text-[30px] leading-none text-accent">
        {numeral}
      </span>
      {label && (
        <span className="text-[13px] tracking-[0.14em] uppercase text-muted-foreground">{label}</span>
      )}
      {children}
    </div>
  );
}

export default function AboutSection({ data }: { data: AboutPageData }) {
  const {
    introQuote,
    founderName,
    founderRoles,
    founderBio,
    bioPullQuote,
    portrait,
    monikerLogo,
    monikerText,
    featuredOn,
    milestones,
    rapidFire,
  } = data;

  const roles = founderRoles?.length
    ? founderRoles
    : ["Creative Director", "Photographer", "Multidisciplinary Designer"];
  const story = storyFlow(founderBio, bioPullQuote);

  return (
    <div className="about-chapters">
      {/* ——— I · The opening ——— */}
      <section aria-labelledby="about-name" className="about-opening px-6 md:px-16 page-top-offset section-pb">
        <AboutPortrait image={portrait} alt={`${founderName}, ${roles[0]}`} />
        <div className="about-opening-text">
          <ChapterMark numeral="I" />
          {introQuote && (
            <blockquote className="font-editorial italic text-[30px] md:text-[40px] lg:text-[48px] leading-[1.2] text-foreground">
              &ldquo;{introQuote}&rdquo;
            </blockquote>
          )}
          <div className="flex flex-col gap-1.5 border-t border-border pt-5">
            <h2 id="about-name" className="font-editorial font-normal text-[24px] leading-[1.3] text-foreground">
              {founderName}
            </h2>
            <p className="text-[14px] leading-[1.6] text-muted-foreground">{rolesLine(roles)}</p>
          </div>
        </div>
      </section>

      {/* ——— II · The story ——— */}
      <section aria-labelledby="about-story" className="about-story px-6 md:px-16 section-py">
        <ChapterMark numeral="II">
          <h2 id="about-story" className="text-[13px] tracking-[0.14em] uppercase text-muted-foreground font-normal">
            The story
          </h2>
        </ChapterMark>
        <div className="about-story-text">
          {story.length > 0
            ? story.map((item, i) =>
                item.kind === "block" ? (
                  <div key={i} className="about-story-p">
                    <PortableText value={[item.block]} components={proseComponents} />
                  </div>
                ) : item.kind === "quote" ? (
                  <p key={i} className="about-pull">
                    {item.text}
                  </p>
                ) : (
                  <p key={i} className="about-story-p">
                    {item.text}
                  </p>
                ),
              )
            : FALLBACK_BIO_PARAGRAPHS.map((p) => (
                <p key={p} className="about-story-p">
                  {p}
                </p>
              ))}
        </div>
      </section>

      {/* ——— III · The practice ——— */}
      <section aria-labelledby="about-practice" className="px-6 md:px-16 section-py">
        <h2 id="about-practice" className="sr-only">
          The practice, House of Singh
        </h2>
        <PracticeReveal logo={typeof monikerLogo === "string" ? monikerLogo : null}>
          {monikerText ? (
            <PortableText value={monikerText} components={proseComponents} />
          ) : (
            FALLBACK_MONIKER_PARAGRAPHS.map((p) => (
              <p key={p} className="mb-6 last:mb-0">
                {p}
              </p>
            ))
          )}
        </PracticeReveal>
      </section>

      {/* ——— IV · In print ——— */}
      {featuredOn && featuredOn.length > 0 && (
        <section aria-labelledby="about-print" className="px-6 md:px-16 section-py">
          <div className="about-chapter-head">
            <ChapterMark numeral="IV">
              <h2 id="about-print" className="font-editorial font-normal text-[30px] md:text-[36px] leading-[1.15] text-foreground">
                In print
              </h2>
            </ChapterMark>
          </div>
          <PressCuttings outlets={featuredOn} />
        </section>
      )}

      {/* ——— V · A walk through the years ——— */}
      {milestones && milestones.length > 0 && (
        <section aria-labelledby="about-journey" className="section-py">
          <div className="px-6 md:px-16">
            <div className="about-chapter-head">
              <ChapterMark numeral="V" label="Journey" />
              <h2 id="about-journey" className="font-editorial font-normal text-[30px] md:text-[40px] leading-[1.1] text-foreground">
                A walk through the years
              </h2>
            </div>
          </div>
          <JourneyWalk milestones={milestones} />
        </section>
      )}

      {/* ——— VI · In conversation ——— */}
      {rapidFire && rapidFire.length > 0 && (
        <section aria-labelledby="about-conversation" className="about-conversation px-6 md:px-16 section-py-lg">
          <div className="flex flex-col gap-5">
            <ChapterMark numeral="VI" label="Rapid fire" />
            <h2 id="about-conversation" className="font-editorial font-normal text-[30px] md:text-[40px] leading-[1.1] text-foreground">
              In conversation
            </h2>
          </div>
          <Conversation items={rapidFire} />
        </section>
      )}
    </div>
  );
}
