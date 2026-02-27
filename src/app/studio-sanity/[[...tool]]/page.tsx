"use client";

import dynamic from "next/dynamic";

const Studio = dynamic(() => import("./Studio"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading Studio…</p>
    </div>
  ),
});

export default function StudioPage() {
  return <Studio />;
}
