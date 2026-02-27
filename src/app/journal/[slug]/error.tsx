"use client";

import Link from "next/link";

export default function JournalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-lg font-medium">Failed to load article</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Something went wrong loading this journal entry. Please try again.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={reset}
          className="rounded border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
        >
          Try again
        </button>
        <Link
          href="/journal"
          className="rounded border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
        >
          All journal entries
        </Link>
      </div>
    </div>
  );
}
