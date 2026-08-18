import { readFiles } from "@/lib/edit/github";
import { readSections, writeSections, looksBalanced } from "@/lib/edit/html";

/**
 * The registry of everything /edit can change.
 *
 * Each source knows how to turn its file(s) into flat fields and how to fold
 * edited fields back into the original file. Field ids are namespaced
 * "<sourceId>:<path>" so the client can stay dumb — it posts a flat map of
 * changed ids and never has to know what a territory or a tour is.
 */

export type FieldKind = "line" | "text" | "html" | "number";

export interface Field {
  id: string;
  label: string;
  kind: FieldKind;
  value: string;
  /** Optional note shown under the input. */
  hint?: string;
}

export interface Group {
  id: string;
  title: string;
  /** Shown once at the top of the group. */
  note?: string;
  fields: Field[];
}

export interface Section {
  id: string;
  title: string;
  groups: Group[];
}

const TERRITORIES = "content/site/territories.json";
const TOURS = "sites/cycling/assets/tours.js";

const CYCLING_PAGES = [
  "sites/cycling/2026-kurzeme/index.html",
  "sites/cycling/2025-melnsils/index.html",
  "sites/cycling/2025-latgale/index.html",
  "sites/cycling/2024-gauja/index.html",
  "sites/cycling/2023-estonia/index.html",
];

const CYCLING_REPORTS = [
  "sites/cycling/reports/2026-kurzeme-lv/index.html",
  "sites/cycling/reports/2026-kurzeme/index.html",
  "sites/cycling/reports/2025-melnsils/index.html",
  "sites/cycling/reports/2025-latgale/index.html",
  "sites/cycling/reports/2024-gauja/index.html",
  "sites/cycling/reports/2023-estonia/index.html",
];

export const EDITABLE_FILES = [
  TERRITORIES,
  TOURS,
  ...CYCLING_PAGES,
  ...CYCLING_REPORTS,
];

/* ------------------------------------------------------------------ */
/* territories                                                         */
/* ------------------------------------------------------------------ */

interface TerritoryJson {
  id: string;
  num: string;
  ink: string;
  name: { lv: string; en: string };
  teaser: { lv: string; en: string };
  teaserPanel: { lv: string; en: string };
  datumLines: { lv: [string, string]; en: [string, string] };
  href?: string | null;
  hrefInternal?: string | null;
}

const LOCALIZED: [keyof TerritoryJson & string, string][] = [
  ["name", "Nosaukums"],
  ["teaser", "Apraksts sarakstā"],
  ["teaserPanel", "Apraksts panelī"],
];

function territoriesToSection(raw: string): Section {
  const data = JSON.parse(raw) as { territories: TerritoryJson[] };
  return {
    id: "territories",
    title: "Teritorijas",
    groups: data.territories.map((t) => ({
      id: t.id,
      title: `${t.num} — ${t.name.lv}`,
      fields: [
        ...LOCALIZED.flatMap(([key, label]) => {
          const v = t[key] as { lv: string; en: string };
          return [
            { id: `territories:${t.id}.${key}.lv`, label: `${label} · LV`, kind: "line" as const, value: v.lv },
            { id: `territories:${t.id}.${key}.en`, label: `${label} · EN`, kind: "line" as const, value: v.en },
          ];
        }),
        { id: `territories:${t.id}.datumLines.lv.0`, label: "Dati 1. rinda · LV", kind: "line", value: t.datumLines.lv[0] },
        { id: `territories:${t.id}.datumLines.lv.1`, label: "Dati 2. rinda · LV", kind: "line", value: t.datumLines.lv[1] },
        { id: `territories:${t.id}.datumLines.en.0`, label: "Dati 1. rinda · EN", kind: "line", value: t.datumLines.en[0] },
        { id: `territories:${t.id}.datumLines.en.1`, label: "Dati 2. rinda · EN", kind: "line", value: t.datumLines.en[1] },
        {
          id: `territories:${t.id}.href`,
          label: "Saite",
          kind: "line",
          value: t.href ?? "",
          hint: t.hrefInternal ? `Iekšējā lapa: ${t.hrefInternal}` : "Tukšs — atver paneli, nevis saiti",
        },
      ],
    })),
  };
}

function territoriesApply(raw: string, edits: Record<string, string>): string {
  const data = JSON.parse(raw) as { territories: TerritoryJson[] };
  for (const [id, value] of Object.entries(edits)) {
    const path = id.slice("territories:".length).split(".");
    const t = data.territories.find((x) => x.id === path[0]);
    if (!t) continue;
    const [, field, a, b] = path;
    if (field === "href") {
      t.href = value.trim() || null;
    } else if (field === "datumLines") {
      const lang = a as "lv" | "en";
      t.datumLines[lang][Number(b) as 0 | 1] = value;
    } else {
      const target = t[field as "name" | "teaser" | "teaserPanel"];
      target[a as "lv" | "en"] = value;
    }
  }
  return JSON.stringify(data, null, 2) + "\n";
}

/* ------------------------------------------------------------------ */
/* cycling tours                                                       */
/* ------------------------------------------------------------------ */

interface TourJson {
  slug: string;
  title: string;
  sub: string;
  dates: string;
  days: number;
  dist: number;
  dist_all: number;
  climb: number;
  moving: string;
  riders: number;
  finishers: number;
  photos: number;
  [k: string]: unknown;
}

const TOUR_TEXT: [keyof TourJson & string, string][] = [
  ["title", "Nosaukums"],
  ["sub", "Apakšvirsraksts"],
  ["dates", "Datumi"],
  ["moving", "Kustībā"],
];

const TOUR_NUM: [keyof TourJson & string, string][] = [
  ["days", "Dienas"],
  ["dist", "Distance (km)"],
  ["dist_all", "Distance kopā (km)"],
  ["climb", "Kāpums (m)"],
  ["riders", "Braucēji"],
  ["finishers", "Finišēja"],
  ["photos", "Foto"],
];

function parseTours(raw: string): { prefix: string; data: Record<string, unknown>; suffix: string } {
  const open = raw.indexOf("{");
  const close = raw.lastIndexOf("}");
  if (open === -1 || close === -1) throw new Error("tours.js: no payload found");
  return {
    prefix: raw.slice(0, open),
    data: JSON.parse(raw.slice(open, close + 1)) as Record<string, unknown>,
    suffix: raw.slice(close + 1),
  };
}

function toursToSection(raw: string): Section {
  const { data } = parseTours(raw);
  const tours = data.tours as TourJson[];
  return {
    id: "tours",
    title: "Velo — ekspedīcijas",
    groups: tours.map((t) => ({
      id: t.slug,
      title: `${t.title} · ${t.slug}`,
      fields: [
        ...TOUR_TEXT.map(([k, label]) => ({
          id: `tours:${t.slug}.${k}`,
          label,
          kind: "line" as const,
          value: String(t[k] ?? ""),
        })),
        ...TOUR_NUM.map(([k, label]) => ({
          id: `tours:${t.slug}.${k}`,
          label,
          kind: "number" as const,
          value: String(t[k] ?? ""),
        })),
      ],
    })),
  };
}

function toursApply(raw: string, edits: Record<string, string>): string {
  const { prefix, data, suffix } = parseTours(raw);
  const tours = data.tours as TourJson[];
  const numeric = new Set(TOUR_NUM.map(([k]) => k));
  for (const [id, value] of Object.entries(edits)) {
    const [slug, key] = id.slice("tours:".length).split(".");
    const t = tours.find((x) => x.slug === slug);
    if (!t) continue;
    if (numeric.has(key)) {
      const n = Number(value);
      if (!Number.isFinite(n)) throw new Error(`"${value}" nav skaitlis (${key})`);
      t[key] = n;
    } else {
      t[key] = value;
    }
  }
  return prefix + JSON.stringify(data) + suffix;
}

/* ------------------------------------------------------------------ */
/* cycling pages and reports (raw HTML sections)                       */
/* ------------------------------------------------------------------ */

function pageTitle(path: string): string {
  const m = /\/([^/]+)\/index\.html$/.exec(path);
  return m ? m[1] : path;
}

function htmlToSection(
  id: string,
  title: string,
  note: string,
  paths: string[],
  files: Record<string, string>
): Section {
  return {
    id,
    title,
    groups: paths
      .filter((p) => files[p])
      .map((p) => ({
        id: p,
        title: pageTitle(p),
        note,
        fields: readSections(files[p]).map((s) => ({
          id: `${id}:${p}::${s.key}`,
          label: s.label,
          kind: "html" as const,
          value: s.html,
        })),
      }))
      .filter((g) => g.fields.length > 0),
  };
}

function htmlApply(
  raw: string,
  path: string,
  prefix: string,
  edits: Record<string, string>
): string {
  const mine: Record<string, string> = {};
  for (const [id, value] of Object.entries(edits)) {
    const [file, key] = id.slice(prefix.length).split("::");
    if (file !== path) continue;
    if (!looksBalanced(value)) {
      throw new Error(`${pageTitle(path)} · "${key}": HTML birkas nav aizvērtas`);
    }
    mine[key] = value;
  }
  return Object.keys(mine).length ? writeSections(raw, mine) : raw;
}

/* ------------------------------------------------------------------ */
/* public API                                                          */
/* ------------------------------------------------------------------ */

const REPORT_NOTE =
  "Šī ir publicētā HTML versija. Lejupielādējamais .md fails netiek atjaunināts automātiski.";

export async function loadSections(): Promise<Section[]> {
  const files = await readFiles(EDITABLE_FILES);
  return [
    territoriesToSection(files[TERRITORIES]),
    toursToSection(files[TOURS]),
    htmlToSection("cycpage", "Velo — ekspedīciju lapas", "", CYCLING_PAGES, files),
    htmlToSection("cycreport", "Velo — atskaites", REPORT_NOTE, CYCLING_REPORTS, files),
  ];
}

/** Fold a flat map of changed field ids into the files they belong to. */
export async function applyEdits(
  edits: Record<string, string>
): Promise<{ path: string; content: string }[]> {
  const touched = new Set<string>();
  for (const id of Object.keys(edits)) {
    const [source, rest] = id.split(":");
    if (source === "territories") touched.add(TERRITORIES);
    else if (source === "tours") touched.add(TOURS);
    else touched.add(rest.split("::")[0]);
  }
  if (touched.size === 0) return [];

  const files = await readFiles([...touched]);
  const out: { path: string; content: string }[] = [];

  const only = (prefix: string) =>
    Object.fromEntries(
      Object.entries(edits).filter(([id]) => id.startsWith(prefix))
    );

  for (const path of touched) {
    const raw = files[path];
    let next: string;
    if (path === TERRITORIES) next = territoriesApply(raw, only("territories:"));
    else if (path === TOURS) next = toursApply(raw, only("tours:"));
    else if (CYCLING_PAGES.includes(path)) next = htmlApply(raw, path, "cycpage:", only("cycpage:"));
    else next = htmlApply(raw, path, "cycreport:", only("cycreport:"));
    if (next !== raw) out.push({ path, content: next });
  }
  return out;
}
