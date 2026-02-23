import ScrollReveal from "@/components/ScrollReveal";
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
    <div className="content-sections flex flex-col gap-20 md:gap-32 lg:gap-40">
      {sections.map((section, index) => {
        let child: React.ReactNode = null;

        switch (section._type) {
          case "textSection":
            child = <TextSectionRenderer section={section} />;
            break;
          case "imageSingle":
            child = <ImageSingleRenderer section={section} />;
            break;
          case "imagePair":
            child = <ImagePairRenderer section={section} />;
            break;
          case "imageGrid":
            child = <ImageGridRenderer section={section} />;
            break;
          case "stickyChapter":
            child = <StickyChapterRenderer section={section} />;
            break;
          default:
            return null;
        }

        return (
          <ScrollReveal
            key={section._key}
            offset={16}
            duration={0.9}
            delay={index === 0 ? 0 : 0.05}
            threshold={0.08}
          >
            {child}
          </ScrollReveal>
        );
      })}
    </div>
  );
}
