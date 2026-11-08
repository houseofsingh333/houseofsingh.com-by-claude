import { PortableText, type PortableTextBlock } from "@portabletext/react";
import SanityImage from "@/components/SanityImage";
import { proseComponents } from "@/components/proseComponents";
import { hotspotPosition } from "@/lib/projectHero";
import { groupPhotos, storyUnits, weaveStory, type PhotoGroup, type StoryPhoto } from "@/lib/projectStory";

type Props = {
  title: string;
  photographs: StoryPhoto[];
  story: PortableTextBlock[] | null | undefined;
};

/** A photograph's alt text: empty only when marked decorative in Sanity. */
function altOf(p: StoryPhoto, title: string): string {
  return p.isDecorative ? "" : p.alt?.trim() || title;
}

const SIZES: Record<PhotoGroup["kind"], string> = {
  wide: "(min-width: 1280px) 1088px, calc(100vw - 48px)",
  bleed: "100vw",
  half: "(min-width: 1024px) 544px, calc(100vw - 48px)",
  pair: "(min-width: 1024px) 528px, 50vw",
  three: "(min-width: 1024px) 352px, calc(100vw - 48px)",
  single: "(min-width: 1024px) 420px, calc(100vw - 48px)",
};

function Photo({ photo, kind, title }: { photo: StoryPhoto; kind: PhotoGroup["kind"]; title: string }) {
  // Wide and full bleed keep the photograph's own shape; the others are 4:5.
  const natural = kind === "wide" || kind === "bleed" || kind === "half";
  const ratio = natural && photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 5";
  return (
    <figure className="pp-photo">
      <div className="pp-photo-frame" style={{ aspectRatio: ratio }}>
        <SanityImage image={photo} context="body" alt={altOf(photo, title)} fill sizes={SIZES[kind]} className="object-cover" objectPosition={hotspotPosition(photo)} />
      </div>
      {photo.caption && <figcaption className={kind === "bleed" ? "pp-caption pp-col" : "pp-caption"}>{photo.caption}</figcaption>}
    </figure>
  );
}

function Text({ blocks }: { blocks: PortableTextBlock[] }) {
  return (
    <div className="pp-text">
      <PortableText value={blocks} components={proseComponents} />
    </div>
  );
}

/**
 * The story with its photographs placed automatically (frames "Automatic
 * layout" and "Your control in Sanity"; the rules are in lib/projectStory):
 * landscapes alone across the content width, portraits in pairs or rows of
 * three, a single portrait to one side with the next paragraph beside it,
 * full bleed when chosen. The story's paragraphs fall between the groups.
 * Every photograph develops as it comes into view (SanityImage); captions
 * are small and grey beneath. The same space between every group.
 */
export default function ProjectFlow({ title, photographs, story }: Props) {
  const items = weaveStory(groupPhotos(photographs), storyUnits(story));
  return (
    <div className="pp-flow">
      {items.map((item, i) => {
        if (item.type === "text") {
          return (
            <section key={`t${i}`} className="pp-col pp-item">
              <div className="pp-story">
                <Text blocks={item.blocks} />
              </div>
            </section>
          );
        }
        const { group, beside } = item;
        if (group.kind === "bleed") {
          return (
            <section key={group.photos[0]._key} className="pp-item pp-bleed">
              <Photo photo={group.photos[0]} kind="bleed" title={title} />
            </section>
          );
        }
        return (
          <section key={group.photos[0]._key} className="pp-col pp-item">
            <div className={`pp-group pp-${group.kind}`} data-align={group.kind === "single" ? group.align : undefined} data-beside={beside ? "" : undefined}>
              {group.photos.map((p) => (
                <Photo key={p._key} photo={p} kind={group.kind} title={title} />
              ))}
              {beside && (
                <div className="pp-beside">
                  <Text blocks={beside} />
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
