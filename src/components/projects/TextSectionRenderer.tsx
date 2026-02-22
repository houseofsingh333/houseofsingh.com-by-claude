import { PortableText } from "@portabletext/react";
import type { TextSectionBlock } from "@/lib/placeholder-data";

type Props = { section: TextSectionBlock };

export default function TextSectionRenderer({ section }: Props) {
  return (
    <div className="project-section mx-auto max-w-2xl px-6 md:px-0">
      {section.heading && (
        <h2 className="font-editorial text-2xl md:text-3xl font-light text-foreground leading-[1.2] mb-6">
          {section.heading}
        </h2>
      )}
      <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] [&>p]:mb-6 last:[&>p]:mb-0">
        <PortableText value={section.body} />
      </div>
    </div>
  );
}
