/* Contact page layout primitives — editorial copy, form grid, progress bar */

import type { ReactNode } from "react";

/* ── Editorial intro copy ────────────────────────────────── */
export function EditorialSidebar() {
  return (
    <div className="mb-12 md:mb-16">
      <h1 className="font-editorial text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-8">
        Say hello.
      </h1>
      <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
        Whether it&apos;s a project, a collaboration, or simply a conversation,
        I&apos;m always open to hearing from thoughtful people.
      </p>
      <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
        If you&apos;d like to catch up over coffee, go for a walk, or explore an
        idea together, feel free to reach out.
      </p>
    </div>
  );
}

/* ── Two-column wrapper (main + optional aside) ───────────── */
type TwoColumnLayoutProps = {
  children: ReactNode;
  aside?: ReactNode;
};

export function TwoColumnLayout({ children, aside }: TwoColumnLayoutProps) {
  return (
    <div className="min-h-[80vh] px-6 md:px-8 page-top-offset section-pb-sm">
      <div className="max-w-6xl mx-auto">
        <EditorialSidebar />
        <div
          className={
            aside
              ? "grid md:grid-cols-[1fr_minmax(220px,30%)] md:gap-16"
              : ""
          }
        >
          <div>{children}</div>
          {aside && (
            <div className="hidden md:block md:sticky md:top-24 md:self-start">
              {aside}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Progress bar ──────────────────────────────────────── */
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div
        className="h-[2px] bg-foreground transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
