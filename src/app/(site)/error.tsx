"use client";

import { useEffect } from "react";
import Link from "next/link";
import ErrorLayout, { errorLinkClass } from "@/components/ErrorLayout";

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
    <ErrorLayout
      label="Error"
      title="Something went wrong"
      text="Please try again in a moment."
    >
      <button type="button" onClick={reset} className={errorLinkClass}>
        Try again
      </button>
      <Link href="/" className={errorLinkClass}>
        Return home
      </Link>
    </ErrorLayout>
  );
}
