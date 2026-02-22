import type { ContentSection } from "@/lib/placeholder-data";
import TextSectionRenderer from "./TextSectionRenderer";
import ImageSingleRenderer from "./ImageSingleRenderer";
import ImagePairRenderer from "./ImagePairRenderer";
import ImageGridRenderer from "./ImageGridRenderer";
import StickyChapterRenderer from "./StickyChapterRenderer";

type Props = {
  sections: ContentSection[];
};

export default function ContentSections({ sections }: Props) {
  return (
    <div className="content-sections flex flex-col gap-16 md:gap-24">
      {sections.map((section) => {
        switch (section._type) {
          case "textSection":
            return <TextSectionRenderer key={section._key} section={section} />;
          case "imageSingle":
            return <ImageSingleRenderer key={section._key} section={section} />;
          case "imagePair":
            return <ImagePairRenderer key={section._key} section={section} />;
          case "imageGrid":
            return <ImageGridRenderer key={section._key} section={section} />;
          case "stickyChapter":
            return <StickyChapterRenderer key={section._key} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
