import { X } from "lucide-react";
import { Link } from "react-router-dom";
import type { NavItem } from "@/lib/mock-data";

interface NavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
}

const NavOverlay = ({ isOpen, onClose, items }: NavOverlayProps) => {
  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Right-side backdrop — lets hero show through */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Left-half panel */}
      <nav
        className={`fixed top-0 left-0 z-50 h-full w-full md:w-1/2 bg-background border-r border-border flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex items-center px-8 py-6">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex items-center gap-2 group"
          >
            <X className="h-4 w-4 text-foreground" />
            <span className="text-xs tracking-widest uppercase text-foreground">
              Close
            </span>
          </button>
        </div>

        {/* Nav items */}
        <ul className="flex flex-col gap-0 px-8 pt-12 flex-1">
          {sorted.map((item) => (
            <li key={item.label} className="border-b border-border/50">
              {item.externalUrl ? (
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center justify-between py-5 font-editorial text-2xl md:text-3xl font-light text-foreground hover:text-muted-foreground transition-colors duration-300"
                >
                  {item.label}
                  <span className="text-xs tracking-widest text-muted-foreground">↗</span>
                </a>
              ) : (
                <Link
                  to={item.internalRoute || "/"}
                  onClick={onClose}
                  className="block py-5 font-editorial text-2xl md:text-3xl font-light text-foreground hover:text-muted-foreground transition-colors duration-300"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default NavOverlay;
