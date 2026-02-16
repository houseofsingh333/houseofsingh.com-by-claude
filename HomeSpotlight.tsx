import { Link } from "react-router-dom";
import { spotlightProject } from "../lib/mock-data";

const HomeSpotlight = () => {
  const project = spotlightProject;

  return (
    <section className="relative">
      {/* Full-width cinematic image */}
      <Link
        to={`/projects/${project.slug}`}
        className="group block relative w-full aspect-[16/7] overflow-hidden bg-secondary"
      >
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 pb-12 md:pb-20">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/60 mb-4">
            Spotlight
          </p>
          <h3 className="font-editorial text-3xl md:text-5xl lg:text-6xl font-light text-white leading-[1.1] max-w-2xl">
            {project.title}
          </h3>
          <p className="text-white/60 text-sm md:text-base leading-relaxed mt-4 max-w-lg">
            {project.description}
          </p>
          <span className="inline-block mt-8 text-xs tracking-widest uppercase text-white/80 border-b border-white/30 pb-1 group-hover:border-white transition-colors duration-500 w-fit">
            View project
          </span>
        </div>
      </Link>
    </section>
  );
};

export default HomeSpotlight;
