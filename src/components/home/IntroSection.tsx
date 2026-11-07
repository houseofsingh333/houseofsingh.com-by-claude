import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { proseComponents } from "@/components/proseComponents";
import ScrollReveal from "@/components/ScrollReveal";
import IntroPortrait from "./IntroPortrait";
import { devPlaceholder } from "@/lib/placeholders";
import type { HomeIntroData } from "@/lib/types";

const FALLBACK_ROLES = [
  "Creative Director",
  "Multidisciplinary Designer",
  "Photographer",
];

const FALLBACK_BIO =
  "Depth over noise. Craft over trend. Always evolving, never in a rush. A creative practice rooted in Toronto, built on intention and quiet consistency.";

const FALLBACK_PORTRAIT = "/images/hero-placeholder-1.svg";

export default function IntroSection({ data }: { data: HomeIntroData }) {
  const roles =
    data.founderRoles && data.founderRoles.length > 0
      ? data.founderRoles
      : FALLBACK_ROLES;
  // Placeholder art only in local development; otherwise an empty frame.
  const portrait = data.portrait ?? devPlaceholder(FALLBACK_PORTRAIT, null);
  const founderName = data.founderName ?? "Maninder Singh";

  return (
    <section className="px-6 md:px-16 section-py">
      {/* Section label */}
      <ScrollReveal>
        <div className="mb-16">
          <p className="text-xs tracking-widest uppercase text-muted-foreground">
            The Creative
          </p>
          <div className="w-full h-px bg-border mt-4" />
        </div>
      </ScrollReveal>

      {/* Two-column layout on desktop (1024px+); stacked on tablet/mobile.
          Tablet (768–1023px) adds a scroll-driven image collapse via the
          .intro-collapse-* classes in styles/home.css. */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-8 lg:gap-y-0 items-start">
        {/* Portrait + caption — left (the only client part of this section) */}
        <IntroPortrait portrait={portrait} founderName={founderName} roles={roles} />

        {/* Text content — right on desktop, below the image on tablet/mobile */}
        <div className="lg:col-span-5 lg:col-start-7 flex flex-col gap-8 lg:gap-10 lg:pt-14">
          {/* Roles — calm, restrained */}
          <ScrollReveal delay={0.5}>
            <div className="space-y-1">
              {roles.map((role) => (
                <p
                  key={role}
                  className="text-[13px] tracking-[0.18em] uppercase text-muted-foreground"
                >
                  {role}
                </p>
              ))}
            </div>
          </ScrollReveal>

          {/* Bio — sans-serif body style */}
          <ScrollReveal delay={0.6}>
            {data.founderBio ? (
              <div
                className="text-muted-foreground max-w-[440px] md:max-lg:max-w-[560px] leading-[1.75]"
                style={{
                  fontSize: "clamp(15px, 1.5vw, 17px)",
                }}
              >
                <PortableText
                  value={data.founderBio}
                  components={proseComponents}
                />
              </div>
            ) : (
              <p
                className="text-muted-foreground max-w-[440px] md:max-lg:max-w-[560px] leading-[1.75]"
                style={{
                  fontSize: "clamp(15px, 1.5vw, 17px)",
                }}
              >
                {FALLBACK_BIO}
              </p>
            )}
          </ScrollReveal>

          {/* About link */}
          <ScrollReveal delay={0.7}>
            <Link
              href="/about"
              className="inline-flex items-center gap-3 uppercase text-foreground group w-fit"
              style={{
                fontSize: "11px",
                letterSpacing: "0.18em",
              }}
            >
              <span
                className="group-hover:border-foreground/40 transition-colors duration-(--dur-hover) ease-(--ease-soft-out)"
                style={{
                  borderBottom: "1px solid color-mix(in srgb, var(--foreground) 20%, transparent)",
                  paddingBottom: "4px",
                }}
              >
                More about him
              </span>
              <span className="transition-transform duration-(--dur-hover) ease-(--ease-soft-out) group-hover:translate-x-1">
                →
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
