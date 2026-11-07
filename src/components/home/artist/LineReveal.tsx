"use client";

import { useLayoutEffect, useRef } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * A statement that reveals line by line: each word is wrapped, the browser's
 * own line breaks are measured (and remeasured on resize), and each line
 * fades and rises in turn once the statement is in view. The text is plain
 * HTML first: visible in the server HTML, without JavaScript and with
 * reduced motion (see "Line reveal" in styles/motion.css). Opacity and
 * transform only, so nothing moves the layout.
 */
export default function LineReveal({
  text,
  className,
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  as?: "p" | "h2" | "blockquote";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { rootMargin: "0px 0px -15% 0px" });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const words = el.querySelectorAll<HTMLElement>("[data-word]");
      let line = -1;
      let top = -Infinity;
      words.forEach((w) => {
        if (w.offsetTop > top + 2) {
          line += 1;
          top = w.offsetTop;
        }
        w.style.setProperty("--line", String(line));
      });
      el.setAttribute("data-lines-ready", "");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag
      ref={ref as never}
      data-line-reveal=""
      data-revealed={inView ? "" : undefined}
      className={className}
    >
      {words.map((w, i) => (
        <span key={i}>
          <span data-word="">{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
