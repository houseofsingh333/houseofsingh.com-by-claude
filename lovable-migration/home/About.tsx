import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import portraitImage from "@/assets/maninder-portrait.jpg";
import hosLogo from "@/assets/house-of-singh-logo.png";

/* ——— Timeline data ——— */
const milestones = [
  {
    year: "2014",
    title: "Founded House of Singh",
    text: "Began the journey in New Delhi.",
    image: "/placeholder.svg",
  },
  {
    year: "2016",
    title: "First Brand Identity",
    text: "Delivered a full visual system for a heritage label.",
    image: "/placeholder.svg",
  },
  {
    year: "2018",
    title: "The Sikh Turban",
    text: "A personal project celebrating Sikh identity.",
    image: "/placeholder.svg",
  },
  {
    year: "2020",
    title: "Editorial & Print",
    text: "Expanded into editorial design and print storytelling.",
    image: "/placeholder.svg",
  },
  {
    year: "2021",
    title: "Relocation to Canada",
    text: "A new chapter rooted in Toronto.",
    image: "/placeholder.svg",
  },
  {
    year: "2024",
    title: "A Decade of Craft",
    text: "Ten years of evolving practice and perspective.",
    image: "/placeholder.svg",
  },
];

/* ——— Testimonial data (placeholders — final copy to be provided) ——— */
const testimonials = [
  {
    quote:
      "Working with Maninder felt less like a transaction and more like a conversation — one that left our brand feeling truly seen.",
    name: "Placeholder Name",
    role: "Creative Lead",
  },
  {
    quote:
      "He has a rare ability to listen deeply and translate feeling into form. The work speaks quietly but stays with you.",
    name: "Placeholder Name",
    role: "Brand Director",
  },
  {
    quote:
      "Every detail was intentional. The result was not just beautiful — it was meaningful.",
    name: "Placeholder Name",
    role: "Founder & CEO",
  },
];

const About = () => {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  const changeTestimonial = (next: number) => {
    setFadeClass("opacity-0");
    setTimeout(() => {
      setTestimonialIndex(next);
      setFadeClass("opacity-100");
    }, 300);
  };

  const prevTestimonial = () =>
    changeTestimonial(testimonialIndex === 0 ? testimonials.length - 1 : testimonialIndex - 1);
  const nextTestimonial = () =>
    changeTestimonial(testimonialIndex === testimonials.length - 1 ? 0 : testimonialIndex + 1);

  return (
    <div className="overflow-hidden">
      {/* ——— 1 · Intro Quote ——— */}
      <section className="px-8 md:px-16 pt-32 md:pt-44 pb-24 md:pb-36 flex items-center justify-center">
        <p className="font-editorial text-2xl md:text-3xl lg:text-[2.5rem] font-light leading-[1.4] text-center max-w-3xl editorial-fade-in">
          "The world is filled with beauty, waiting to be seen, felt, and
          celebrated."
        </p>
      </section>

      {/* ——— 2 · Founder Section ——— */}
      <section className="px-8 md:px-16 pb-24 md:pb-36">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          {/* Text — left */}
          <div className="md:col-span-6 flex flex-col gap-10 order-2 md:order-1">
            <div>
              <h2 className="text-xs tracking-[0.25em] uppercase text-foreground mb-4">
                Maninder Singh
              </h2>
              <div className="space-y-1 mb-8">
                {["Creative Director", "Multidisciplinary Designer", "Photographer"].map(
                  (role) => (
                    <p
                      key={role}
                      className="font-editorial text-lg md:text-xl font-light text-muted-foreground leading-[1.5]"
                    >
                      {role}
                    </p>
                  )
                )}
              </div>
              <div className="space-y-6 max-w-md">
                <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.8]">
                  Guided by a curiosity for life's quiet wonders, Maninder crafts
                  narratives that celebrate the rhythm of nature and human
                  connection. Based in Toronto, his work bridges the visual and the
                  emotional, creating impactful stories through different mediums,
                  including design and photography.
                </p>
                <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.8]">
                  Beyond his creative practice, he finds balance and inspiration in
                  flying FPV drones, playing golf, and staying committed to fitness,
                  grounding his work in discipline, movement, and reflection.
                </p>
              </div>
            </div>
          </div>

          {/* Portrait — right */}
          <div className="md:col-span-5 md:col-start-8 order-1 md:order-2">
            <div className="w-full aspect-[3/4] overflow-hidden bg-secondary">
              <img
                src={portraitImage}
                alt="Maninder Singh — Creative Director, Designer & Photographer"
                className="w-full h-full object-cover object-top"
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
            {/* Logo — left, vertically centered */}
            <div className="md:col-span-4 flex justify-center">
              <img src={hosLogo} alt="House of Singh" className="w-36 md:w-44 object-contain opacity-40" />
            </div>

            {/* Text — right */}
            <div className="md:col-span-8 space-y-6">
              <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.8]">
                Under the identity of House of Singh, Maninder has created a platform
                where design, photography, and storytelling come together to inspire
                connection and reflection. It serves as a space to showcase an
                evolving body of work, spanning present explorations and future
                ventures across diverse mediums and collaborations.
              </p>
              <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.8]">
                Guided by empathy and curiosity, House of Singh bridges the visual
                and emotional, crafting narratives that celebrate beauty, purpose, and
                meaning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— 4 · Timeline — TEN YEARS ON ——— */}
      <section className="px-8 md:px-16 py-24 md:py-36">
        <div className="mb-16">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
            Ten Years On
          </p>
          <div className="w-full h-px bg-border" />
        </div>

        {/* Vertical timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Center line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

          {milestones.map((m, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={m.year}
                className="timeline-milestone relative mb-14 last:mb-0 md:mb-0 md:min-h-[160px] group"
                tabIndex={0}
              >
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 top-3 -translate-x-1/2 z-10">
                  <div className="timeline-dot w-2 h-2 rounded-full bg-foreground/25 group-hover:bg-foreground/60 group-focus-within:bg-foreground/60" />
                </div>

                {/* Desktop: two-column grid */}
                <div className="hidden md:grid md:grid-cols-2 md:gap-0">
                  {/* Left column */}
                  <div className={`flex ${isEven ? "justify-end pr-12" : "justify-start pl-12"} ${!isEven ? "order-2" : "order-1"}`}>
                    {isEven ? (
                      /* Text on left */
                      <div className="timeline-content text-right max-w-[280px] py-4">
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
                      /* Image on left */
                      <div className="timeline-image w-[220px] aspect-[4/3] overflow-hidden bg-secondary py-4">
                        <img
                          src={m.image}
                          alt={m.title}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-[filter] duration-700"
                        />
                      </div>
                    )}
                  </div>

                  {/* Right column */}
                  <div className={`flex ${!isEven ? "justify-end pr-12" : "justify-start pl-12"} ${!isEven ? "order-1" : "order-2"}`}>
                    {isEven ? (
                      /* Image on right */
                      <div className="timeline-image w-[220px] aspect-[4/3] overflow-hidden bg-secondary py-4">
                        <img
                          src={m.image}
                          alt={m.title}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-[filter] duration-700"
                        />
                      </div>
                    ) : (
                      /* Text on right */
                      <div className="timeline-content-reverse text-left max-w-[280px] py-4">
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

                {/* Mobile: single column, image below text */}
                <div className="md:hidden pl-14">
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
                      src={m.image}
                      alt={m.title}
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ——— 5 · Words Shared ——— */}
      <section className="px-8 md:px-16 py-24 md:py-36">
        <div className="mb-12">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
            Words Shared
          </p>
          <div className="w-full h-px bg-border" />
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className={`transition-opacity duration-300 ease-in-out ${fadeClass}`}>
            <blockquote className="font-editorial text-xl md:text-2xl font-light leading-[1.5] text-foreground mb-8 min-h-[120px] flex items-center justify-center">
              "{testimonials[testimonialIndex].quote}"
            </blockquote>
            <p className="text-xs tracking-[0.15em] uppercase text-foreground">
              {testimonials[testimonialIndex].name}
            </p>
            {testimonials[testimonialIndex].role && (
              <p className="text-xs text-muted-foreground mt-1">
                {testimonials[testimonialIndex].role}
              </p>
            )}
          </div>

          {/* Navigation — dots + arrows */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={prevTestimonial}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => changeTestimonial(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === testimonialIndex
                      ? "bg-foreground scale-125"
                      : "bg-foreground/25 hover:bg-foreground/50"
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
