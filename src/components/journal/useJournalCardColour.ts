"use client";

import { useEffect, type RefObject } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Journal cards on phone and tablet: grey until a card reaches the middle
 * band of the screen, colour while it is there, grey again as it leaves.
 * Reduced motion: every card in colour. Desktop: none (hover reveals colour).
 *
 * Its own IntersectionObserver rather than useInView: one observer follows
 * the whole list of cards ([data-journal-card] inside the grid) in both
 * directions. Re-runs when the visible cards change.
 */
export function useJournalCardColour(
  gridRef: RefObject<HTMLDivElement | null>,
  visibleCards: unknown,
  reducedMotion: boolean,
) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  useEffect(() => {
    if (isDesktop) return; // desktop — hover handles it
    const prefersReduced = reducedMotion;

    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLElement>("[data-journal-card]");
    if (cards.length === 0) return;

    if (prefersReduced) {
      // Reduced motion: show all cards in full color on mobile
      cards.forEach((card) => {
        const img = card.querySelector("img");
        if (img) {
          img.classList.remove("grayscale");
          img.classList.add("grayscale-0");
        }
      });
      return () =>
        cards.forEach((card) =>
          card.querySelector("img")?.classList.remove("grayscale-0"),
        );
    }

    // Start all cards in grayscale on mobile
    cards.forEach((card) => {
      const img = card.querySelector("img");
      if (img) {
        img.classList.add("grayscale");
        img.classList.remove("grayscale-0");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const img = entry.target.querySelector("img");
          if (!img) return;
          if (entry.isIntersecting) {
            img.classList.remove("grayscale");
            img.classList.add("grayscale-0");
          } else {
            img.classList.add("grayscale");
            img.classList.remove("grayscale-0");
          }
        });
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => {
      observer.disconnect();
      // Undo, so a change of screen size or motion setting starts clean.
      cards.forEach((card) =>
        card.querySelector("img")?.classList.remove("grayscale", "grayscale-0"),
      );
    };
  }, [gridRef, visibleCards, isDesktop, reducedMotion]);
}
