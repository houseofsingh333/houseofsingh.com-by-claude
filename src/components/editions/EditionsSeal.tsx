"use client";

/**
 * The seal on the Collection card (Shop design round 2): the crest in the
 * middle and a ring of words around it, "HOUSE OF SINGH EDITIONS" over the
 * top and again under the bottom, both upright, with a small dot where
 * they meet. The ring turns slowly, one turn a minute; with reduced
 * motion it is still (styles/editions.css). Decorative: the card carries
 * the words for screen readers.
 */
import { useId } from "react";

const WORDS = "HOUSE OF SINGH EDITIONS";

export default function EditionsSeal() {
  const id = useId().replace(/:/g, "");
  return (
    <span className="ed-seal2" aria-hidden="true">
      <svg className="ed-seal2-ring" viewBox="0 0 128 128" focusable="false">
        <defs>
          {/* The top words sit on the arc's outside, the bottom words on its inside, so both read upright in one band. */}
          <path id={`${id}-top`} d="M 13 64 A 51 51 0 0 1 115 64" fill="none" />
          <path id={`${id}-bottom`} d="M 6.5 64 A 57.5 57.5 0 0 0 121.5 64" fill="none" />
        </defs>
        <g className="ed-seal2-turn">
          <text className="ed-seal2-text">
            <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle" textLength="140" lengthAdjust="spacing">
              {WORDS}
            </textPath>
          </text>
          <text className="ed-seal2-text">
            <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle" textLength="152" lengthAdjust="spacing">
              {WORDS}
            </textPath>
          </text>
          <circle cx="10" cy="64" r="1.3" />
          <circle cx="118" cy="64" r="1.3" />
        </g>
      </svg>
      <span className="ed-seal2-crest" />
    </span>
  );
}
