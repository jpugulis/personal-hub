import fs from "node:fs";
import path from "node:path";

/**
 * Territory sheet loader.
 *
 * Content lives in content/<territory>/<slug>.md and is the ONLY thing that
 * needs to change to publish a new sheet. The index on /triatlons is derived
 * from this directory, so there is no separate list to keep in sync.
 *
 * Frontmatter is a deliberately small format — `key: value` lines plus
 * repeatable pipe-delimited `band:` rows. No YAML dependency, no nesting,
 * nothing that can silently mis-parse. See content/README.md.
 */

export interface BandStat {
  /** Label above the number. */
  k: string;
  /** The number itself. */
  v: string;
  /** Small print underneath. */
  s: string;
}

export interface Sheet {
  slug: string;
  /** Atlas sheet number, e.g. "Nr. 02-01". */
  sheet: string;
  dateISO: string;
  dateLv: string;
  titleLv: string;
  /** Mono line under the big title. */
  subtitleEn: string;
  /** One-line summary used on the index card. */
  subtitleLv: string;
  /** Right-hand note in the breadcrumb. */
  crumbNote: string;
  /** Right column of the index card. */
  metaLine: string;
  /** Opening paragraph, rendered large. */
  lede: string;
  description: string;
  ogDescription: string;
  /** Media path relative to /public, e.g. /triatlons/2026-07-25 */
  mediaBase: string;
  /** OG image, relative to mediaBase. */
  cover: string;
  band: BandStat[];
  body: string;
}

const ROOT = path.join(process.cwd(), "content");

function parseFrontmatter(raw: string): { meta: Record<string, string[]>; body: string } {
  if (!raw.startsWith("---")) return { meta: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: raw };

  const head = raw.slice(4, end);
  const body = raw.slice(end + 4).replace(/^\n+/, "");
  const meta: Record<string, string[]> = {};

  for (const line of head.split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    // strip matching surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }
    (meta[key] ||= []).push(value);
  }
  return { meta, body };
}

/** Latvian display date from an ISO date. */
function lvDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function one(meta: Record<string, string[]>, key: string, fallback = ""): string {
  return meta[key]?.[0] ?? fallback;
}

function toSheet(slug: string, raw: string): Sheet {
  const { meta, body } = parseFrontmatter(raw);
  const dateISO = one(meta, "date");

  const band: BandStat[] = (meta.band ?? []).map((row) => {
    const [k = "", v = "", s = ""] = row.split("|").map((x) => x.trim());
    return { k, v, s };
  });

  return {
    slug,
    sheet: one(meta, "sheet"),
    dateISO,
    dateLv: lvDate(dateISO),
    titleLv: one(meta, "titleLv"),
    subtitleEn: one(meta, "subtitleEn"),
    subtitleLv: one(meta, "subtitleLv"),
    crumbNote: one(meta, "crumbNote"),
    metaLine: one(meta, "metaLine"),
    lede: one(meta, "lede"),
    description: one(meta, "description"),
    ogDescription: one(meta, "ogDescription", one(meta, "description")),
    mediaBase: one(meta, "mediaBase").replace(/\/$/, ""),
    cover: one(meta, "cover"),
    band,
    body,
  };
}

function dir(territory: string): string {
  return path.join(ROOT, territory);
}

/** All sheets in a territory, newest first. */
export function getSheets(territory = "triatlons"): Sheet[] {
  const d = dir(territory);
  if (!fs.existsSync(d)) return [];
  return fs
    .readdirSync(d)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => toSheet(f.replace(/\.md$/, ""), fs.readFileSync(path.join(d, f), "utf8")))
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
}

export function getSheet(slug: string, territory = "triatlons"): Sheet | null {
  const p = path.join(dir(territory), `${slug}.md`);
  if (!fs.existsSync(p)) return null;
  return toSheet(slug, fs.readFileSync(p, "utf8"));
}

export function getSlugs(territory = "triatlons"): string[] {
  return getSheets(territory).map((s) => s.slug);
}

/**
 * Intrinsic dimensions of an image under /public, read straight from the file
 * header. next/image needs width and height, and markdown authors shouldn't
 * have to supply them — so we look them up at build time instead.
 *
 * Supports PNG and JPEG, which is everything the charts and photos use.
 * Returns a 16:9 fallback rather than throwing, so a typo'd path degrades to a
 * wrong-shaped box instead of a failed build.
 */
export function imageSize(publicPath: string): { width: number; height: number } {
  const fallback = { width: 1600, height: 900 };
  try {
    const file = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    if (!fs.existsSync(file)) return fallback;
    const fd = fs.openSync(file, "r");
    const buf = Buffer.alloc(65_536);
    const read = fs.readSync(fd, buf, 0, 65_536, 0);
    fs.closeSync(fd);

    // PNG: 8-byte signature, then IHDR with width/height as big-endian uint32
    if (buf.slice(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }

    // JPEG: walk the segment chain to a Start-Of-Frame marker
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < read - 9) {
        if (buf[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = buf[i + 1];
        // SOF0/1/2/3, SOF5-7, SOF9-11, SOF13-15 carry the dimensions
        const isSOF =
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf);
        if (isSOF) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    return fallback;
  } catch {
    return fallback;
  }
}
