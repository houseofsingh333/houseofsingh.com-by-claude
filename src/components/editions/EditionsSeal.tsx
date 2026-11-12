/**
 * The seal on the Collection card (Shop design round 2): the crest in the
 * middle and a ring of words around it, "HOUSE OF SINGH EDITIONS" over the
 * top and again under the bottom, both upright, with a small dot where
 * they meet. The ring turns slowly, one turn a minute; with reduced
 * motion it is still (styles/editions.css). Decorative: the card carries
 * the words for screen readers.
 *
 * Each letter is placed at its own point on the circle rather than set
 * along a path: text stretched along a path is spaced unevenly by phone
 * browsers at this small size (Safari most of all). The letters keep their
 * own widths (Instrument Sans 500, measured) with one even gap between
 * them, so the spacing reads as letter spacing; each half is centred on
 * its side and stops well short of the dots. Every letter's middle sits on
 * one circle, so both halves share one band.
 */
const WORDS = "HOUSE OF SINGH EDITIONS";
const CENTRE = 64;
/** The circle the letters' middles sit on (the drawing is 128 across). */
const RADIUS = 54;
/** How much of each half the words fill, in degrees; the rest is room around the dots. */
const SPAN = 146;
/** The letter size, in the drawing's units (with styles/editions.css). */
const SIZE = 7.6;
/** Advance widths of Instrument Sans 500, as a share of the letter size. */
const WIDTH: Record<string, number> = { H: 0.731, O: 0.79, U: 0.708, S: 0.623, E: 0.634, " ": 0.197, F: 0.598, I: 0.254, N: 0.731, G: 0.764, D: 0.753, T: 0.656 };

type Letter = { ch: string; x: number; y: number; turn: number };

/** The letters of one half, left to right: over the top (top) or under the bottom (bottom). */
function half(top: boolean): Letter[] {
  const chars = [...WORDS];
  const widths = chars.map((c) => (WIDTH[c] ?? 0.65) * SIZE);
  const arc = (RADIUS * SPAN * Math.PI) / 180;
  // One even gap between letters, so the words fill the arc exactly.
  const gap = (arc - widths.reduce((a, b) => a + b, 0)) / (chars.length - 1);
  const round = (n: number) => Math.round(n * 100) / 100;
  let along = 0;
  return chars.map((ch, i) => {
    const middle = along + widths[i] / 2;
    along += widths[i] + gap;
    // Degrees from the middle of the half, left to right.
    const offset = ((middle - arc / 2) / RADIUS) * (180 / Math.PI);
    // Over the top the angle runs left to right through -90 (12 o'clock);
    // under the bottom it runs left to right through 90 (6 o'clock).
    const angle = top ? -90 + offset : 90 - offset;
    const rad = (angle * Math.PI) / 180;
    return { ch, x: round(CENTRE + RADIUS * Math.cos(rad)), y: round(CENTRE + RADIUS * Math.sin(rad)), turn: round(top ? angle + 90 : angle - 90) };
  });
}

const LETTERS = [...half(true), ...half(false)].filter((l) => l.ch !== " ");

export default function EditionsSeal() {
  return (
    <span className="ed-seal2" aria-hidden="true">
      <svg className="ed-seal2-ring" viewBox="0 0 128 128" focusable="false" aria-hidden="true">
        <g className="ed-seal2-turn">
          {LETTERS.map((l, i) => (
            <text key={i} className="ed-seal2-text" fontSize={SIZE} x={l.x} y={l.y} transform={`rotate(${l.turn} ${l.x} ${l.y})`} textAnchor="middle" dominantBaseline="central">
              {l.ch}
            </text>
          ))}
          <circle cx={CENTRE - RADIUS} cy={CENTRE} r="1.3" />
          <circle cx={CENTRE + RADIUS} cy={CENTRE} r="1.3" />
        </g>
      </svg>
      <span className="ed-seal2-crest" />
    </span>
  );
}
