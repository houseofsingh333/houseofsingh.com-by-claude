/**
 * The places journal entries name, for their structured data
 * (contentLocation). Only names that already appear in an entry's own
 * title or excerpt are matched, never its search description (where
 * "Toronto" is part of the byline), so a place is never guessed.
 *
 * Add a name here when a new entry names a new place. Longer names win:
 * "Royal Ontario Golf Club" is matched, not "Ontario", which is not in the
 * list on purpose (it names a province in passing, not where a photograph
 * was made).
 */
const PLACES = [
  "Darbar Sahib",
  "Deep Cove",
  "Gastown",
  "Mississauga",
  "New York",
  "Port Credit",
  "Royal Ontario Golf Club",
  "Squamish",
  "Stawamus Chief",
  "Tobermory",
  "Toronto",
  "Vancouver",
  "Whistler",
] as const;

/** The places named in a piece of text, in the order they first appear. */
export function placesNamedIn(text: string): string[] {
  const found: { name: string; at: number }[] = [];
  for (const name of PLACES) {
    const at = text.search(new RegExp(`\\b${name.replace(/ /g, "\\s+")}\\b`));
    if (at >= 0) found.push({ name, at });
  }
  // A name inside a longer one found at the same spot counts once.
  return found
    .filter((f) => !found.some((g) => g !== f && g.name.includes(f.name) && g.at <= f.at && f.at < g.at + g.name.length))
    .sort((a, b) => a.at - b.at)
    .map((f) => f.name);
}
