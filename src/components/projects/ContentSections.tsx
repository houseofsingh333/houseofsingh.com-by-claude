import ScrollReveal from "@/components/ScrollReveal";
import type { ContentSection } from "@/lib/placeholder-data";
import TextSectionRenderer from "./TextSectionRenderer";
import FullWidthImageRenderer from "./FullWidthImageRenderer";
import FullBleedImageRenderer from "./FullBleedImageRenderer";
import ImagePairRenderer from "./ImagePairRenderer";
import ImageRow3Renderer from "./ImageRow3Renderer";
import OffsetImageRenderer from "./OffsetImageRenderer";
import TextWithImageRenderer from "./TextWithImageRenderer";
import HorizontalGalleryRenderer from "./HorizontalGalleryRenderer";
import PullQuoteRenderer from "./PullQuoteRenderer";
// Legacy renderers — retained for existing published projects
import ImageSingleRenderer from "./ImageSingleRenderer";
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
          // ── Nine designed layout blocks ──
          case "textSection":
            child = <TextSectionRenderer section={section} />;
            break;
          case "fullWidthImage":
            child = <FullWidthImageRenderer section={section} />;
            break;
          case "fullBleedImage":
            child = <FullBleedImageRenderer section={section} />;
            break;
          case "imagePair":
            child = <ImagePairRenderer section={section} />;
            break;
          case "imageRow3":
            child = <ImageRow3Renderer section={section} />;
            break;
          case "offsetImage":
            child = <OffsetImageRenderer section={section} />;
            break;
          case "textWithImage":
            child = <TextWithImageRenderer section={section} />;
            break;
          case "horizontalGallery":
            child = <HorizontalGalleryRenderer section={section} />;
            break;
          case "pullQuote":
            child = <PullQuoteRenderer section={section} />;
            break;
          // ── Legacy blocks (existing projects) ──
          case "imageSingle":
            child = <ImageSingleRenderer section={section} />;
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
