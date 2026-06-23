"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-lg font-medium">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        We ran into an unexpected issue. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
