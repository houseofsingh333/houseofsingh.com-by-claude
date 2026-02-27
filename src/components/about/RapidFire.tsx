"use client";

import type { RapidFireItem } from "@/lib/types";

export default function RapidFire({ items }: { items: RapidFireItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-8 max-w-3xl">
      {items.map((item) => (
        <div key={item.question}>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
            {item.question}
          </p>
          <p className="font-editorial text-lg md:text-xl font-light text-foreground leading-[1.4]">
            {item.answer}
          </p>
        </div>
      ))}
    </div>
  );
}
