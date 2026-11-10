"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { revealProps } from "@/lib/reveal";

/**
 * Chapter III on the About page, the practice: the brass numeral, the crest
 * and the practice text, centred. The crest and the text fade in together
 * once in view; CSS shows both at once under reduced motion or without
 * JavaScript (revealProps). The text is rendered on the server and passed in.
 */
/**
 * The logo at the size it is shown (260px, twice that for sharp screens). A
 * Sanity image is asked for at that size in a modern format: the original
 * upload can be thousands of pixels wide (the live one is 3750 by 3750).
 */
function logoSource(logo?: string | null): { src: string; srcSet?: string } {
  if (!logo) return { src: "/images/hos-logo.svg" };
  if (!logo.startsWith("https://cdn.sanity.io/") || /\.svg($|\?)/.test(logo)) return { src: logo };
  const at = (w: number) => `${logo}${logo.includes("?") ? "&" : "?"}w=${w}&auto=format&q=80`;
  return { src: at(520), srcSet: `${at(260)} 1x, ${at(520)} 2x` };
}

export default function PracticeReveal({
  logo,
  mark,
  children,
}: {
  /** The practice logo from Sanity, else the crest. */
  logo: string | null;
  /** The chapter mark, III with its label, centred above the logo. */
  mark: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useInView(ref, { threshold: 0.25 });

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 text-center">
      {mark}
      <div {...revealProps({ revealed, rise: false })}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a logo at a fixed size: an SVG, or a Sanity image asked for at that size. */}
        <img {...logoSource(logo)} alt="House of Singh" width={260} height={260} className="w-[200px] md:w-[260px] h-auto" />
      </div>
      <div
        className="about-practice-text max-w-[640px] text-body-l leading-[1.7] text-foreground"
        {...revealProps({ revealed, delay: 400 })}
      >
        {children}
      </div>
    </div>
  );
}
