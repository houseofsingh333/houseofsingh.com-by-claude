"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AboutTestimonial } from "@/lib/types";

export default function TestimonialCarousel({
  testimonials,
}: {
  testimonials: AboutTestimonial[];
}) {
  const [index, setIndex] = useState(0);

  /* No setTimeout — index updates immediately on tap, CSS animation
     handles the fade-in via key prop forcing a re-mount each change.
     This removes the 300ms main-thread block that caused high INP. */
  const change = (next: number) => setIndex(next);

  const prev = () =>
    change(index === 0 ? testimonials.length - 1 : index - 1);
  const next = () =>
    change(index === testimonials.length - 1 ? 0 : index + 1);

  const t = testimonials[index];

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* key={index} causes React to remount this div on change,
          triggering the CSS entry animation with zero JS delay. */}
      <div key={index} className="animate-testimonial-fade">
        <blockquote className="font-editorial text-xl md:text-2xl font-light leading-[1.5] text-foreground mb-8 min-h-[120px] flex items-center justify-center">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <p className="text-xs tracking-[0.15em] uppercase text-foreground">
          {t.name}
        </p>
        {t.role && (
          <p className="text-xs text-muted-foreground mt-1">{t.role}</p>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={prev}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => change(i)}
              className={`w-1.5 h-1.5 rounded-full transition-[background-color,transform] duration-300 ${
                i === index
                  ? "bg-foreground scale-125"
                  : "bg-foreground/25 hover:bg-foreground/50"
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
