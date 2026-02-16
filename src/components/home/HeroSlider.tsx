"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/lib/placeholder-data";

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

  return (
    <section
      className="relative flex h-[70vh] min-h-[480px] items-center justify-center overflow-hidden bg-neutral-900 text-white"
      aria-label="Hero slideshow"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={slide.imageSrc}
          alt={slide.imageAlt}
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {slide.heading}
        </h1>
        <p className="mt-4 text-lg text-neutral-200 sm:text-xl">
          {slide.subheading}
        </p>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s._id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
