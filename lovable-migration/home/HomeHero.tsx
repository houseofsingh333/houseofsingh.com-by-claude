import { useState } from "react";
import { Link } from "react-router-dom";
import { heroSlides } from "../lib/mock-data";

const HomeHero = () => {
  const [current, setCurrent] = useState(0);
  const slides = heroSlides;
  const slide = slides[current];

  const handleSlideClick = () => {
    // Navigation handled by wrapper link
  };

  const inner = (
    <div
      className="relative w-full h-screen bg-secondary flex items-center justify-center overflow-hidden cursor-pointer"
      onClick={handleSlideClick}
    >
      {/* Images with fade transition */}
      {slides.map((s, i) => (
        <img
          key={s._id}
          src={s.image}
          alt={s.caption || "Hero"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Bottom-left: dots + caption */}
      <div className="absolute bottom-8 left-8 z-10 flex items-center gap-5">
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
        {slide.caption && (
          <p className="text-xs tracking-widest uppercase text-foreground/70">
            {slide.caption}
          </p>
        )}
      </div>

      {/* Right side: scroll indicator */}
      <div className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-widest uppercase text-foreground/40">
          Scroll
        </span>
        <div className="w-px h-8 bg-foreground/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-foreground/50 animate-[scrollPulse_2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(300%); }
        }
      `}</style>
    </div>
  );

  if (slide.internalLink) {
    return <Link to={slide.internalLink}>{inner}</Link>;
  }
  if (slide.externalLink) {
    return (
      <a href={slide.externalLink} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
};

export default HomeHero;
