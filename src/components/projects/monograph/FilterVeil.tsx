"use client";

import { useRef, type RefObject } from "react";
import Link from "@/components/Link";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { categoryHref } from "@/lib/projectCategories";
import type { MonographCategory } from "@/lib/projectsData";

type Props = {
  open: boolean;
  /** The "All work" trigger: it stays usable while the veil is open. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  categories: MonographCategory[];
  /** The category slug shown (null: all work). */
  current: string | null;
  allWork: string;
  onChoose: (slug: string | null) => void;
  onClose: () => void;
};

/**
 * The filter (desktop and phone): a frosted veil over the work, canvas at
 * about 68 percent with a blur, and the choices written in large Playfair,
 * right aligned beneath the trigger, the current one marked by a short
 * brass line. No box, no border. Tapping the veil or pressing Escape
 * closes it, and focus returns to the trigger. Each choice is a real link
 * to that category's address, so without JavaScript the choices still work
 * (shown as a quiet row, styles/projects.css). While closed the choices
 * are hidden (visibility), so they are out of the tab order.
 */
export default function FilterVeil({ open, triggerRef, categories, current, allWork, onChoose, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLAnchorElement>(null);

  useFocusTrap({
    active: open,
    containerRef,
    keepRefs: [triggerRef],
    onEscape: onClose,
    initialFocusRef: currentRef,
    restoreFocus: true,
  });

  const choices: { slug: string | null; label: string }[] = [
    { slug: null, label: allWork },
    ...categories.map((c) => ({ slug: c.slug, label: c.label })),
  ];

  return (
    <div ref={containerRef} id="projects-filter" className="mono-veil" data-open={open ? "" : undefined}>
      <div className="mono-veil-backdrop" aria-hidden="true" onClick={onClose} />
      <ul className="mono-veil-list" role="list">
        {choices.map((c) => {
          const isCurrent = c.slug === current;
          return (
            <li key={c.slug ?? "all"}>
              <Link
                ref={isCurrent ? currentRef : undefined}
                href={categoryHref(c.slug ? c.label : null)}
                aria-current={isCurrent ? "true" : undefined}
                className="hairline"
                scroll={false}
                onClick={(e) => {
                  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  e.preventDefault();
                  onChoose(c.slug);
                }}
              >
                {c.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
