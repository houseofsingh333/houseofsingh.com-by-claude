/**
 * The brass ×, drawn rather than typed (the font's × reads as a close
 * button at display sizes): two strokes as thick as the letter stems
 * beside it. Its size and stroke come from where it stands
 * (styles/editions.css: .ed-x and its contexts); vertical-align: middle
 * centres it on the x height of the line it sits in.
 */
export default function DrawnTimes({ className = "" }: { className?: string }) {
  return (
    <svg className={`ed-x${className ? ` ${className}` : ""}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path d="M8 8 92 92M92 8 8 92" />
    </svg>
  );
}
