import type { ComponentType } from "react";
import type { StringInputProps } from "sanity";

/**
 * A text field with a live character count beneath it, for fields with a
 * hard limit (About, Timeline Milestones). The count turns amber near the
 * limit and red beyond it; the field's own validation warns near the limit
 * and blocks publishing beyond it. Plain React and Studio colour variables
 * (with fallbacks), so it needs no extra package.
 */
export function countedInput(max: number, warnFrom: number): ComponentType<StringInputProps> {
  function CountedInput(props: StringInputProps) {
    const length = (props.value ?? "").length;
    const over = length > max;
    const near = !over && length >= warnFrom;
    const color = over
      ? "var(--card-badge-critical-fg-color, #c4314b)"
      : near
        ? "var(--card-badge-caution-fg-color, #a86b00)"
        : "var(--card-muted-fg-color, #6e7683)";
    return (
      <div>
        {props.renderDefault(props)}
        <div
          aria-live="polite"
          style={{ marginTop: 6, fontSize: 12, lineHeight: 1.4, color, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
        >
          {length} / {max}
          {over ? ` (${length - max} over: shorten to publish)` : near ? " (close to the limit)" : ""}
        </div>
      </div>
    );
  }
  CountedInput.displayName = `CountedInput(${max})`;
  return CountedInput;
}
