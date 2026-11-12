/**
 * scripts/import/fake-sanity.mjs
 *
 * A stand-in for the Sanity client, for scripts/import-content-test.mjs: it
 * answers the importer's few queries from memory and records every write,
 * so publishing can be checked without touching the real dataset.
 */
import { createHash } from "node:crypto";

export function fakeSanity(initial = []) {
  const docs = new Map(initial.map((d) => [d._id, structuredClone(d)]));
  const assets = new Map();
  const log = { uploads: 0, writes: 0, deletes: [] };
  // Like Sanity, an asset's id comes from its content; files are reported by their SHA-1.
  const file = (img) => (img?.asset?._ref && assets.has(img.asset._ref) ? img.asset._ref.replace(/^image-/, "") : null);
  const files = (d) => ({
    image: file(d.image),
    coverImage: file(d.coverImage),
    portrait: file(d.portrait),
    logo: file(d.logo),
    photographs: d.photographs?.map(file) ?? null,
    body: d.body?.filter((b) => b._type === "image").map(file) ?? null,
  });

  /** set() with paths such as milestones[_key=="x"].title */
  function setPath(doc, path, value) {
    const m = path.match(/^(\w+)\[_key=="([^"]+)"\]\.(\w+)$/);
    if (!m) return void (doc[path] = structuredClone(value));
    const entry = (doc[m[1]] ?? []).find((e) => e._key === m[2]);
    if (entry) entry[m[3]] = structuredClone(value);
  }

  function patch(id) {
    const ops = [];
    const builder = {
      set: (o) => (ops.push((d) => Object.entries(o).forEach(([k, v]) => setPath(d, k, v))), builder),
      setIfMissing: (o) => (ops.push((d) => Object.entries(o).forEach(([k, v]) => d[k] === undefined && (d[k] = structuredClone(v)))), builder),
      append: (field, items) => (ops.push((d) => (d[field] = [...(d[field] ?? []), ...structuredClone(items)])), builder),
      unset: (paths) =>
        (ops.push((d) =>
          paths.forEach((p) => {
            const m = p.match(/^(\w+)\[_key=="([^"]+)"\]$/);
            if (m) d[m[1]] = (d[m[1]] ?? []).filter((e) => e._key !== m[2]);
            else delete d[p];
          }),
        ),
        builder),
      commit: async () => {
        const d = docs.get(id);
        if (!d) throw new Error(`no document ${id}`);
        ops.forEach((op) => op(d));
        log.writes++;
        return d;
      },
    };
    return builder;
  }

  return {
    recordsWrites: true,
    docs,
    log,
    async fetch(query, params = {}) {
      if (/path\("drafts\.\*\*"\) && _type/.test(query)) return [];
      if (/_type == "aboutPage"/.test(query)) {
        const about = [...docs.values()].find((d) => d._type === "aboutPage");
        const field = query.match(/"entries": (\w+)\[\]/)[1];
        return about ? { _id: about._id, entries: (about[field] ?? []).map((e) => ({ ...e, files: files(e) })) } : null;
      }
      return [...docs.values()].filter((d) => d._type === params.type).map((d) => ({ ...d, slugValue: d.slug?.current, files: files(d) }));
    },
    assets: {
      async upload(_type, buffer, { filename }) {
        log.uploads++;
        const id = `image-${createHash("sha1").update(buffer).digest("hex")}`;
        assets.set(id, filename);
        return { _id: id };
      },
    },
    async createIfNotExists(doc) {
      if (!docs.has(doc._id)) {
        docs.set(doc._id, structuredClone(doc));
        log.writes++;
      }
    },
    async delete(id) {
      docs.delete(id);
      log.deletes.push(id);
    },
    patch,
  };
}
