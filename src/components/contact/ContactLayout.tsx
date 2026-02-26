/* Contact page layout primitives — editorial copy, form grid, progress bar */

import type { ReactNode } from "react";

/* ── Editorial intro copy ────────────────────────────────── */
export function EditorialSidebar() {
  return (
    <div className="mb-16 md:mb-24">
      <h1 className="font-editorial text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-8 leading-[1.05]">
        Say hello.
      </h1>
      <div className="max-w-lg">
        <p className="text-muted-foreground/80 text-base leading-[1.7] mb-3">
          Whether it&apos;s a project, a collaboration, or simply a conversation,
          I&apos;m always open to hearing from thoughtful people.
        </p>
        <p className="text-muted-foreground/80 text-base leading-[1.7]">
          If you&apos;d like to catch up over coffee, go for a walk, or explore an
          idea together, feel free to reach out.
        </p>
      </div>
    </div>
  );
}

/* ── Two-column wrapper (main + optional aside) ───────────── */
type TwoColumnLayoutProps = {
  children: ReactNode;
  aside?: ReactNode;
};

export function TwoColumnLayout({ children, aside }: TwoColumnLayoutProps) {
  const content = (
    <>
      <EditorialSidebar />
      {children}
    </>
  );

  return (
    <div className="min-h-[80vh] px-6 md:px-8 page-top-offset section-pb-sm">
      <div className="max-w-6xl mx-auto">
        {aside ? (
          <div className="grid md:grid-cols-[1fr_minmax(280px,40%)] md:gap-12 lg:gap-16">
            <div>{content}</div>
            <div className="hidden md:block md:sticky md:top-24 md:self-start">
              {aside}
            </div>
          </div>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

/* ── Progress bar ──────────────────────────────────────── */
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div
        className="h-[1.5px] bg-foreground/80"
        style={{
          width: `${percent}%`,
          transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
}
