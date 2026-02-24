/* Contact page layout primitives — sidebar, two-column grid, progress bar */

/* ── Static left column ────────────────────────────────── */
export function EditorialSidebar() {
  return (
    <div className="md:sticky md:top-24 md:self-start">
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

/* ── Two-column wrapper ────────────────────────────────── */
export function TwoColumnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[80vh] px-6 md:px-8 page-top-offset pb-16 md:pb-24">
      <div className="grid md:grid-cols-[2fr_3fr] gap-12 md:gap-24 max-w-6xl mx-auto">
        <EditorialSidebar />
        <div>{children}</div>
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
