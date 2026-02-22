"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { normalizeText, type HeroSlide } from "@/lib/placeholder-data";

type Props = {
  slides: HeroSlide[];
};

export default function HeroSlider({ slides }: Props) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];
  const heading = normalizeText(slide.heading);
  const subheading = normalizeText(slide.subheading);
  const caption = normalizeText(slide.caption);

  /* Link destination for the current slide (may change between slides). */
  const href = slide.internalLink || slide.externalLink || undefined;
  const isExternal = !slide.internalLink && !!slide.externalLink;

  /* Stable outer wrapper — always the same block-level element so
     switching slides never changes the container structure / height. */
  const Wrapper = href
    ? isExternal
      ? ({ children }: { children: React.ReactNode }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {children}
          </a>
        )
      : ({ children }: { children: React.ReactNode }) => (
          <Link href={href} className="block">
            {children}
          </Link>
        )
    : ({ children }: { children: React.ReactNode }) => <>{children}</>;

  return (
    <Wrapper>
      <div className="relative w-full h-[100svh] bg-secondary flex items-center justify-center overflow-hidden cursor-pointer">
        {/* Images with fade transition */}
        {slides.map((s, i) => (
          <div
            key={s._id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <SanityImage
              image={s.image}
              context="hero"
              alt={normalizeText(s.imageAlt) || normalizeText(s.caption) || "Hero"}
              priority={i === 0}
              fill
              className="object-cover"
            />
          </div>
        ))}

        {/* Centre overlay: heading + subheading */}
        {(heading || subheading) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            {heading && (
              <h1
                className="text-3xl md:text-5xl lg:text-6xl font-semibold text-foreground drop-shadow-lg"
              >
                {heading}
              </h1>
            )}
            {subheading && (
              <p
                className="mt-3 text-base md:text-xl lg:text-2xl text-foreground/80 drop-shadow-md"
              >
                {subheading}
              </p>
            )}
          </div>
        )}

        {/* Bottom-left: dots + caption */}
        <div className="absolute bottom-6 left-5 md:bottom-8 md:left-8 z-10 flex items-center gap-4 md:gap-5">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrent(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  i === current
                    ? "bg-foreground scale-150"
                    : "bg-foreground/25 hover:bg-foreground/50"
                }`}
              />
            ))}
          </div>
          {caption && (
            <p
              className="hidden md:block text-xs tracking-widest uppercase text-foreground/70"
            >
              {caption}
            </p>
          )}
        </div>

        {/* Right side: scroll indicator */}
        <div className="absolute bottom-6 right-5 md:bottom-8 md:right-8 z-10 hidden md:flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-widest uppercase text-foreground/40">
            Scroll
          </span>
          <div className="w-px h-8 bg-foreground/20 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-3 bg-foreground/50"
              style={{ animation: "scrollPulse 2s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
