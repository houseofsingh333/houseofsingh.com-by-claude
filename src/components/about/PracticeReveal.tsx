"use client";

import { useRef, type ReactNode } from "react";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { revealProps } from "@/lib/reveal";

/**
 * "The Practice" on the About page: the logo and its text fade in together
 * once the logo is in view. Only this reveal runs in the browser; the text is
 * rendered on the server and passed in as children. CSS shows both at once
 * under reduced motion or without JavaScript (revealProps).
 */
export default function PracticeReveal({ children }: { children: ReactNode }) {
  const logoRef = useRef<HTMLDivElement>(null);
  const revealed = useRevealOnScroll(logoRef, 0.25);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
      {/* Logo */}
      <div
        ref={logoRef}
        className="flex-shrink-0"
        {...revealProps({ revealed, offset: 0, duration: 1200, ease: "ease" })}
      >
        {/* The logo rests at 60% opacity; the wrapper above fades in. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo: next/image adds nothing for vector files (no resizing or format conversion), so a plain img is right. */}
        <img
          src="/images/hos-logo.svg"
          alt="House of Singh"
          className="w-48 md:w-56 opacity-60"
        />
      </div>

      {/* Text */}
      <div
        className="max-w-[550px] text-sm md:text-[15px] text-muted-foreground leading-[1.9]"
        {...revealProps({
          revealed,
          offset: 16,
          duration: 800,
          delay: 400,
          ease: "ease",
        })}
      >
        {children}
      </div>
    </div>
  );
}
