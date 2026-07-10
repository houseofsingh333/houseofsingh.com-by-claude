import { PortableText } from "@portabletext/react";
import { proseComponents } from "@/components/proseComponents";
import type { TextSectionBlock } from "@/lib/placeholder-data";

type Props = { section: TextSectionBlock };

export default function TextSectionRenderer({ section }: Props) {
  return (
    <div className="project-section mx-auto max-w-3xl px-6 md:px-16">
      {section.heading && (
        <h2 className="font-editorial text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-[1.15] mb-8">
          {section.heading}
        </h2>
      )}
      <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.9]">
        <PortableText value={section.body} components={proseComponents} />
      </div>
    </div>
  );
}
