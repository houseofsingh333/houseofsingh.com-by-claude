"use client";

import { ArrowUpRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function StudioRedirect() {
  return (
    <section className="bg-foreground text-background px-6 md:px-16 py-14 md:py-24">
      <ScrollReveal offset={24} duration={0.9}>
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-background/40">
            A different practice
          </p>

          <h3 className="text-2xl md:text-4xl lg:text-5xl font-normal leading-[1.1]">
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
      </ScrollReveal>
    </section>
  );
}
