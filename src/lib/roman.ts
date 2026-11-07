/** A small whole number (1 to 39) as a Roman numeral: chapter and room numbers. */
export function roman(n: number): string {
  const parts: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  let rest = Math.max(0, Math.floor(n));
  for (const [v, s] of parts) while (rest >= v) { out += s; rest -= v; }
  return out;
}
