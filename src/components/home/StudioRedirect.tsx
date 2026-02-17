"use client";

import { ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function StudioRedirect() {
  const { ref, visible } = useScrollReveal(0.15);

  return (
    <section
      ref={ref}
      className="bg-foreground text-background px-6 md:px-16 py-14 md:py-24"
    >
      <div
        className={`max-w-5xl mx-auto flex flex-col items-center text-center gap-6 transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-background/40">
          A different practice
        </p>

        <h3 className="font-editorial text-2xl md:text-4xl lg:text-5xl font-light leading-[1.1]">
          House of Singh Studios
        </h3>

        <p className="text-sm md:text-[15px] text-background/60 leading-[1.8] max-w-md">
          A design studio specializing in brand identities, graphic design, and
          creative direction for SMEs.
        </p>

        <a
          href="https://studios.houseofsingh.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase border border-background/20 px-8 py-4 hover:bg-background hover:text-foreground transition-all duration-500 mt-4"
        >
          Visit Studios
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
