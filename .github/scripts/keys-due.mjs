#!/usr/bin/env node
/**
 * Lists the keys due for rotation: reads the "Rotation schedule" table in
 * docs/security/key-register.md and prints, one per line, every key whose
 * "Rotate by" date has come (in Toronto), as "KEY<TAB>DATE". Keys marked
 * "if exposed" have no date and are never listed. A row it cannot read
 * stops it with an error, so a typo cannot silently drop a reminder.
 *
 *   node .github/scripts/keys-due.mjs [YYYY-MM-DD]   (default: today)
 *
 * Used by .github/workflows/key-rotation.yml.
 */
import { readFileSync } from "node:fs";

const today = process.argv[2] || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error(`Not a date: ${today}`);

const text = readFileSync(new URL("../../docs/security/key-register.md", import.meta.url), "utf8");
const section = text.split(/^## Rotation schedule\s*$/m)[1];
if (!section) throw new Error('No "## Rotation schedule" section in the key register');
const rows = section
  .split("\n")
  .filter((l) => l.startsWith("|") && !/^\|\s*-/.test(l) && !/^\|\s*Key\s*\|/.test(l));
if (!rows.length) throw new Error("The rotation schedule has no rows");

for (const row of rows) {
  const [key, when] = row.split("|").slice(1, 3).map((c) => c.trim());
  const name = key.match(/`([A-Z0-9_]+)`/)?.[1];
  if (!name) throw new Error(`Cannot read the key in: ${row}`);
  if (/^if exposed$/i.test(when)) continue;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(when)) throw new Error(`Cannot read the date for ${name}: "${when}"`);
  if (when <= today) console.log(`${name}\t${when}`);
}
