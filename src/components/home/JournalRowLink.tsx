"use client";

import { useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { SanityImage as SanityImageType } from "@/lib/types";

/**
 * One row of the desktop journal list on the home page. The row's text
 * (number, title, date, arrow, excerpt) is rendered on the server and passed
 * in as children, with its hover and keyboard focus styling in CSS. Only the
 * floating cover image that follows the mouse needs the browser.
 */
export default function JournalRowLink({
  href,
  title,
  coverImage,
  children,
}: {
  href: string;
  title: string;
  coverImage?: SanityImageType | null;
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }, []);

  return (
    <Link
      href={href}
      className="group relative block border-t border-border py-8 md:py-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {/* Floating cover image that follows cursor */}
      {hovered && coverImage && (
        <div
          className="hidden md:block absolute z-20 w-48 h-32 overflow-hidden pointer-events-none animate-fade-in"
          style={{
            left: mousePos.x + 20,
            top: mousePos.y - 60,
          }}
        >
          <SanityImage
            image={coverImage}
            context="thumbnail"
            alt={title}
            fill
            className="object-cover grayscale"
          />
        </div>
      )}
    </Link>
  );
}
