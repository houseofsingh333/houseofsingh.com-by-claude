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
export default function PracticeReveal({
  logo,
  children,
}: {
  /** The practice logo from Sanity, else the crest. */
  logo: string | null;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useInView(ref, { threshold: 0.25 });

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 text-center">
      <span aria-hidden="true" className="font-editorial italic text-[30px] leading-none text-accent">
        III
      </span>
      <div {...revealProps({ revealed, rise: false })}>
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo: next/image adds nothing for vector files. */}
        <img src={logo || "/images/hos-logo.svg"} alt="House of Singh" width={260} height={260} className="w-[200px] md:w-[260px] h-auto" />
      </div>
      <div
        className="about-practice-text max-w-[640px] font-editorial text-[21px] md:text-[26px] leading-[1.45] text-foreground"
        {...revealProps({ revealed, delay: 400 })}
      >
        {children}
      </div>
    </div>
  );
}
