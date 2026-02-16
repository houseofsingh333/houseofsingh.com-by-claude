"use client";

import { useState } from "react";
import Link from "next/link";
import NavOverlay from "./NavOverlay";
import type { NavItem } from "@/lib/placeholder-data";

type Props = {
  items: NavItem[];
};

export default function Header({ items }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5">
        {/* Dot menu trigger */}
        <button
          onClick={() => setMenuOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Open menu"
          className="flex items-center gap-2 group"
        >
          <span className="block w-2.5 h-2.5 rounded-full bg-foreground" />
          <span
            className={`text-xs tracking-widest uppercase text-foreground transition-all duration-300 ${
              hovered
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2"
            }`}
          >
            Menu
          </span>
        </button>

        {/* Centered logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-sm font-medium tracking-widest uppercase text-foreground"
        >
          House of Singh
        </Link>

        <div className="w-10" />
      </header>

      <NavOverlay
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={items}
      />
    </>
  );
}
