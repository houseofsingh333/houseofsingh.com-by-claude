"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavItem } from "@/lib/placeholder-data";

type Props = {
  items: NavItem[];
};

export default function Header({ items }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        aria-label="Primary navigation"
      >
        <Link href="/" className="text-xl font-semibold tracking-tight">
          House of Singh
        </Link>

        {/* Desktop nav */}
        <ul className="hidden gap-8 md:flex">
          {items.map((item) =>
            item.external ? (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  {item.label}
                </a>
              </li>
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span className="sr-only">Toggle menu</span>
          {mobileOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <ul className="border-t border-neutral-200 px-6 pb-4 md:hidden">
          {items.map((item) => (
            <li key={item.href}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 text-sm font-medium text-neutral-600"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="block py-2 text-sm font-medium text-neutral-600"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
