/**
 * Tabs on the long Studio forms (approved 13 Nov): each field is placed in
 * one tab by name, and nothing else about the field changes. A field left
 * out of the map would show only under "All fields", so the Studio checks
 * (scripts/guardrails-test.ts) fail if one is missed.
 */
type Placeable = { name: string; group?: string | string[] };

export function inGroups<F extends Placeable>(fields: F[], tabs: Record<string, readonly string[]>): F[] {
  const tabOf = new Map<string, string>();
  for (const [tab, names] of Object.entries(tabs)) for (const name of names) tabOf.set(name, tab);
  return fields.map((field) => {
    const tab = tabOf.get(field.name);
    return tab ? { ...field, group: tab } : field;
  });
}
