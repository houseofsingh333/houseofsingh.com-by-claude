"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PortableText } from "@portabletext/react";
import type {
  AboutPageData,
  AboutMilestone,
  AboutTestimonial,
} from "@/lib/placeholder-data";

/* ——— Fallback bio shown when Sanity founderBio is empty ——— */
const FALLBACK_BIO_PARAGRAPHS = [
  "Guided by a curiosity for life\u2019s quiet wonders, Maninder crafts narratives that celebrate the rhythm of nature and human connection. Based in Toronto, his work bridges the visual and the emotional, creating impactful stories through different mediums, including design and photography.",
  "Beyond his creative practice, he finds balance and inspiration in flying FPV drones, playing golf, and staying committed to fitness, grounding his work in discipline, movement, and reflection.",
];

/* ——— Fallback moniker text ——— */
const FALLBACK_MONIKER_PARAGRAPHS = [
  "Under the identity of House of Singh, Maninder has created a platform where design, photography, and storytelling come together to inspire connection and reflection. It serves as a space to showcase an evolving body of work, spanning present explorations and future ventures across diverse mediums and collaborations.",
  "Guided by empathy and curiosity, House of Singh bridges the visual and emotional, crafting narratives that celebrate beauty, purpose, and meaning.",
];

/* =================================================================
   Sub-components
   ================================================================= */

function TestimonialCarousel({
  testimonials,
}: {
  testimonials: AboutTestimonial[];
}) {
  const [index, setIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  const change = (next: number) => {
    setFadeClass("opacity-0");
    setTimeout(() => {
      setIndex(next);
      setFadeClass("opacity-100");
    }, 300);
  };

  const prev = () =>
    change(index === 0 ? testimonials.length - 1 : index - 1);
  const next = () =>
    change(index === testimonials.length - 1 ? 0 : index + 1);

  const t = testimonials[index];

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div
        className={`transition-opacity duration-300 ease-in-out ${fadeClass}`}
      >
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
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
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

function TimelineMilestone({
  m,
  idx,
}: {
  m: AboutMilestone;
  idx: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const isEven = idx % 2 === 0;
  const imgSrc = m.image ?? "/images/project-placeholder-1.svg";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Slide direction: even milestones have text on left, odd on right */
  const slideFrom = isEven ? "md:-translate-x-8" : "md:translate-x-8";

  return (
    <div
      ref={ref}
      className="timeline-milestone relative mb-14 last:mb-0 md:mb-0 md:min-h-[160px] group"
      tabIndex={0}
    >
      {/* Dot */}
      <div className="absolute left-6 md:left-1/2 top-3 -translate-x-1/2 z-10">
        <div
          className={`timeline-dot w-2 h-2 rounded-full transition-all duration-500 group-hover:bg-foreground/60 group-focus-within:bg-foreground/60 ${
            visible
              ? "bg-foreground/25 scale-100"
              : "bg-foreground/0 scale-0"
          }`}
        />
      </div>

      {/* Desktop: two-column grid */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-0">
        {/* Left column */}
        <div
          className={`flex ${isEven ? "justify-end pr-12" : "justify-start pl-12"} ${!isEven ? "order-2" : "order-1"}`}
        >
          {isEven ? (
            <div
              className={`timeline-content text-right max-w-[280px] py-4 transition-all duration-700 ease-out ${
                visible
                  ? "opacity-100 translate-x-0"
                  : `opacity-0 ${slideFrom}`
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <p className="timeline-year font-editorial text-5xl font-light text-foreground leading-none mb-2">
                {m.year}
              </p>
              <p className="text-[11px] tracking-[0.15em] uppercase text-foreground mb-1">
                {m.title}
              </p>
              <p className="text-xs text-muted-foreground leading-[1.6]">
                {m.text}
              </p>
            </div>
          ) : (
            <div
              className={`timeline-image w-[220px] aspect-[4/3] overflow-hidden bg-secondary py-4 transition-all duration-700 ease-out ${
                visible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 md:-translate-x-8"
              }`}
              style={{ transitionDelay: `${idx * 100 + 150}ms` }}
            >
              <img
                src={imgSrc}
                alt={m.title}
                className="w-full h-full object-cover grayscale scale-105 hover:grayscale-0 hover:scale-100 hover:brightness-110 transition-all duration-700 ease-out"
              />
            </div>
          )}
        </div>

        {/* Right column */}
        <div
          className={`flex ${!isEven ? "justify-end pr-12" : "justify-start pl-12"} ${!isEven ? "order-1" : "order-2"}`}
        >
          {isEven ? (
            <div
              className={`timeline-image w-[220px] aspect-[4/3] overflow-hidden bg-secondary py-4 transition-all duration-700 ease-out ${
                visible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 md:translate-x-8"
              }`}
              style={{ transitionDelay: `${idx * 100 + 150}ms` }}
            >
              <img
                src={imgSrc}
                alt={m.title}
                className="w-full h-full object-cover grayscale scale-105 hover:grayscale-0 hover:scale-100 hover:brightness-110 transition-all duration-700 ease-out"
              />
            </div>
          ) : (
            <div
              className={`timeline-content text-left max-w-[280px] py-4 transition-all duration-700 ease-out ${
                visible
                  ? "opacity-100 translate-x-0"
                  : `opacity-0 ${slideFrom}`
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <p className="timeline-year font-editorial text-5xl font-light text-foreground leading-none mb-2">
                {m.year}
              </p>
              <p className="text-[11px] tracking-[0.15em] uppercase text-foreground mb-1">
                {m.title}
              </p>
              <p className="text-xs text-muted-foreground leading-[1.6]">
                {m.text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: single column */}
      <div
        className={`md:hidden pl-14 transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ transitionDelay: `${idx * 100}ms` }}
      >
        <p className="timeline-year font-editorial text-4xl font-light text-foreground leading-none mb-2">
          {m.year}
        </p>
        <p className="text-[11px] tracking-[0.15em] uppercase text-foreground mb-1">
          {m.title}
        </p>
        <p className="text-xs text-muted-foreground leading-[1.6] mb-3">
          {m.text}
        </p>
        <div className="w-[180px] aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={imgSrc}
            alt={m.title}
            className="w-full h-full object-cover grayscale scale-105 hover:grayscale-0 hover:scale-100 hover:brightness-110 transition-all duration-700 ease-out"
          />
        </div>
      </div>
    </div>
  );
}

function Timeline({ milestones }: { milestones: AboutMilestone[] }) {
  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Center line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

      {milestones.map((m, idx) => (
        <TimelineMilestone key={m.year} m={m} idx={idx} />
      ))}
    </div>
  );
}

/* =================================================================
   Main component
   ================================================================= */

export default function AboutSection({ data }: { data: AboutPageData }) {
  const {
    introQuote,
    founderName,
    founderRoles,
    founderBio,
    portrait,
    monikerLogo,
    monikerText,
    milestones,
    testimonials,
  } = data;

  const roles = founderRoles ?? [
    "Creative Director",
    "Multidisciplinary Designer",
    "Photographer",
  ];

  return (
    <div className="overflow-hidden">
      {/* ——— 1 · Intro Quote ——— */}
      <section className="px-8 md:px-16 pt-32 md:pt-44 pb-24 md:pb-36 flex items-center justify-center">
        <p className="font-editorial text-2xl md:text-3xl lg:text-[2.5rem] font-light leading-[1.4] text-center max-w-3xl animate-editorial-fade-in">
          &ldquo;
          {introQuote ??
            "The world is filled with beauty, waiting to be seen, felt, and celebrated."}
          &rdquo;
        </p>
      </section>

      {/* ——— 2 · Founder Section ——— */}
      <section className="px-8 md:px-16 pb-24 md:pb-36">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          {/* Text — left */}
          <div className="md:col-span-6 flex flex-col gap-10 order-2 md:order-1">
            <div>
              <h2 className="text-xs tracking-[0.25em] uppercase text-foreground mb-4">
                {founderName}
              </h2>
              <div className="space-y-1 mb-8">
                {roles.map((role) => (
                  <p
                    key={role}
                    className="font-editorial text-lg md:text-xl font-light text-muted-foreground leading-[1.5]"
                  >
                    {role}
                  </p>
                ))}
              </div>
              <div className="space-y-6 max-w-md">
                {founderBio ? (
                  <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] [&>p]:mb-6 last:[&>p]:mb-0">
                    <PortableText value={founderBio} />
                  </div>
                ) : (
                  FALLBACK_BIO_PARAGRAPHS.map((p, i) => (
                    <p
                      key={i}
                      className="text-sm md:text-[15px] text-muted-foreground leading-[1.8]"
                    >
                      {p}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Portrait — right */}
          <div className="md:col-span-5 md:col-start-8 order-1 md:order-2 group">
            <div className="w-full aspect-[3/4] overflow-hidden bg-secondary">
              <img
                src={portrait ?? "/images/hero-placeholder-1.svg"}
                alt={`${founderName} — ${roles[0]}`}
                className="w-full h-full object-cover object-top grayscale scale-[1.03] group-hover:grayscale-0 group-hover:scale-100 transition-all duration-1000 ease-out"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ——— 3 · House of Singh ——— */}
      <section className="px-8 md:px-16 py-24 md:py-36">
        <div className="mb-16">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
            The Moniker
          </p>
          <div className="w-full h-px bg-border" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
            {/* Logo — left */}
            <div className="md:col-span-4 flex justify-center">
              {monikerLogo ? (
                <img
                  src={monikerLogo}
                  alt="House of Singh"
                  className="w-36 md:w-44 object-contain opacity-40"
                />
              ) : (
                <span className="font-editorial text-3xl font-light text-foreground/40">
                  HoS
                </span>
              )}
            </div>

            {/* Text — right */}
            <div className="md:col-span-8 space-y-6">
              {monikerText ? (
                <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] [&>p]:mb-6 last:[&>p]:mb-0">
                  <PortableText value={monikerText} />
                </div>
              ) : (
                FALLBACK_MONIKER_PARAGRAPHS.map((p, i) => (
                  <p
                    key={i}
                    className="text-sm md:text-[15px] text-muted-foreground leading-[1.8]"
                  >
                    {p}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ——— 4 · Timeline ——— */}
      {milestones && milestones.length > 0 && (
        <section className="px-8 md:px-16 py-24 md:py-36">
          <div className="mb-16">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              Ten Years On
            </p>
            <div className="w-full h-px bg-border" />
          </div>
          <Timeline milestones={milestones} />
        </section>
      )}

      {/* ——— 5 · Words Shared ——— */}
      {testimonials && testimonials.length > 0 && (
        <section className="px-8 md:px-16 py-24 md:py-36">
          <div className="mb-12">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              Words Shared
            </p>
            <div className="w-full h-px bg-border" />
          </div>
          <TestimonialCarousel testimonials={testimonials} />
        </section>
      )}
    </div>
  );
}
