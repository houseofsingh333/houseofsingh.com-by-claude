/** A whole number (1 to 3999) as a Roman numeral: chapter and room numbers, and the postmark's year (2026 is MMXXVI). */
export function roman(n: number): string {
  const parts: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let rest = Math.max(0, Math.min(3999, Math.floor(n)));
  for (const [v, s] of parts) while (rest >= v) { out += s; rest -= v; }
  return out;
}
