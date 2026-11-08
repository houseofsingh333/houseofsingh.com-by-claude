import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { hasImageAsset } from "@/lib/sanityImage";
import type { SpotlightData } from "@/lib/types";
import ScrollProgress from "./ScrollProgress";
import type { SiteCopy } from "@/lib/siteCopy";

const TITLE_ID = "spotlight-billboard-title";

/**
 * Chapter IV, the aperture: the spotlight band as a dark room. On desktop
 * with motion allowed it pins for one screen of scrolling: the spotlight
 * image is first seen through a narrow vertical slit, two charcoal panels
 * slide apart to show the whole image, then the title, description, the
 * brass "Upcoming" dot with the label and the link appear. Transforms and
 * opacity only, driven by the same scroll progress as the exhibition (see
 * "Aperture" in styles/home.css). Phones, reduced motion and no JavaScript:
 * the open layout. All text comes from the spotlight's Sanity fields.
 */
export default function SpotlightBillboard({ spotlight, copy }: { spotlight: SpotlightData; copy: SiteCopy }) {
  if (!hasImageAsset(spotlight.image)) return null;
  const isExternal = /^https?:\/\//.test(spotlight.linkUrl ?? "");

  return (
    <section
      aria-labelledby={spotlight.title ? TITLE_ID : undefined}
      className="aperture"
    >
      <ScrollProgress
        selector=".aperture"
        media="(min-width: 1024px) and (prefers-reduced-motion: no-preference)"
      />
      <div className="aperture-stage px-6 md:px-16">
        <div className="aperture-head">
          <span aria-hidden="true" className="font-editorial text-[30px] leading-none text-accent">
            IV
          </span>
          <span className="type-label text-muted-foreground-inverse">
            {copy.studioNowLabel}
          </span>
        </div>

        <div className="aperture-grid">
          <div className="aperture-text">
            {spotlight.title && (
              <h2 id={TITLE_ID} className="font-editorial font-normal text-[length:clamp(44px,calc(31.73px_+_3.146vw),72px)] leading-[1.02] text-background text-balance">
                {spotlight.title}
              </h2>
            )}
            {spotlight.teaser && (
              <p className="text-[17px] md:text-[18px] leading-[1.7] text-background max-w-[460px]">
                {spotlight.teaser}
              </p>
            )}
            {spotlight.label && (
              <p className="flex items-center gap-2.5 type-label text-muted-foreground-inverse">
                <span className="upcoming-dot" aria-hidden="true" />
                {spotlight.label}
              </p>
            )}
            {spotlight.linkText && spotlight.linkUrl && (
              isExternal ? (
                <a
                  href={spotlight.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aperture-link hairline"
                >
                  {spotlight.linkText}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link href={spotlight.linkUrl} className="aperture-link hairline">
                  {spotlight.linkText}
                </Link>
              )
            )}
          </div>

          <div className="aperture-window">
            <SanityImage
              image={spotlight.image}
              context="banner"
              alt=""
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
            />
            <span className="aperture-shutter aperture-shutter-l" aria-hidden="true" />
            <span className="aperture-shutter aperture-shutter-r" aria-hidden="true" />
          </div>
        </div>

        <span className="aperture-hint" aria-hidden="true">{copy.studioNowHint}</span>
      </div>
    </section>
  );
}
