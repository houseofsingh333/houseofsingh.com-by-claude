import { PortableText } from "@portabletext/react";
import { proseComponents } from "@/components/proseComponents";
import type { TextSectionBlock } from "@/lib/types";
import { PAGE_COLUMN, READING_COLUMN, STORY_HEADING, STORY_TEXT } from "./story";

type Props = { section: TextSectionBlock };

export default function TextSectionRenderer({ section }: Props) {
  return (
    <div className={`project-section ${PAGE_COLUMN}`}>
      <div className={READING_COLUMN}>
        {section.heading && (
          <h2 className={`${STORY_HEADING} mb-8`}>{section.heading}</h2>
        )}
        <div className={STORY_TEXT}>
          <PortableText value={section.body} components={proseComponents} />
        </div>
      </div>
    </div>
  );
}
