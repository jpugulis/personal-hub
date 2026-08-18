/**
 * Round-trip safety net for /edit.
 *
 * The editor rewrites hand-written files. Before trusting it with the live
 * site we check the three things that would be expensive to discover later:
 *
 *   1. reading and writing back unchanged content is byte-identical
 *   2. an edit changes exactly the section it targeted and nothing else
 *   3. the HTML balance check actually rejects broken markup
 *
 * Run:  node scripts/test_edit_roundtrip.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---- inlined copies of the parsing rules in src/lib/edit ---------- */
/* Kept in sync by test 0, which fails if the source drifts.           */

const CONTAINERS = [
  /<main\b[^>]*class="[^"]*\brpmain\b[^"]*"[^>]*>/i,
  /<article\b[^>]*>/i,
  /<main\b[^>]*>/i,
];

function containerBody(src) {
  for (const re of CONTAINERS) {
    const open = re.exec(src);
    if (!open) continue;
    const tag = /^<(\w+)/.exec(open[0])[1];
    const start = open.index + open[0].length;
    const scan = new RegExp(`<${tag}\\b[^>]*>|</${tag}\\s*>`, "gi");
    scan.lastIndex = start;
    let depth = 1;
    let m;
    while ((m = scan.exec(src))) {
      depth += m[0].startsWith("</") ? -1 : 1;
      if (depth === 0) return { start, end: m.index };
    }
  }
  return null;
}

const stripTags = (h) =>
  h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

function readSections(src) {
  const body = containerBody(src);
  if (!body) return [];
  const inner = src.slice(body.start, body.end);
  const heads = [...inner.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/gi)];
  const cuts = [];
  if (heads.length === 0 || heads[0].index > 0) cuts.push({ at: 0, label: "Ievads" });
  heads.forEach((h) => cuts.push({ at: h.index, label: stripTags(h[1]) || "—" }));
  return cuts
    .map((c, i) => ({
      key: `s${i}`,
      label: c.label,
      html: inner
        .slice(c.at, i + 1 < cuts.length ? cuts[i + 1].at : inner.length)
        .replace(/^\n+|\s+$/g, ""),
    }))
    .filter((s) => stripTags(s.html).length > 0);
}

function writeSections(src, edits) {
  const body = containerBody(src);
  if (!body) throw new Error("no editable container");
  const inner = src.slice(body.start, body.end);
  const heads = [...inner.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/gi)];
  const cuts = [];
  if (heads.length === 0 || heads[0].index > 0) cuts.push(0);
  heads.forEach((h) => cuts.push(h.index));
  let out = "";
  let cursor = 0;
  cuts.forEach((at, i) => {
    const end = i + 1 < cuts.length ? cuts[i + 1] : inner.length;
    const slice = inner.slice(at, end);
    const rep = edits[`s${i}`];
    out += inner.slice(cursor, at);
    if (rep === undefined) out += slice;
    else out += /^\s*/.exec(slice)[0] + rep.trim() + /\s*$/.exec(slice)[0];
    cursor = end;
  });
  out += inner.slice(cursor);
  return src.slice(0, body.start) + out + src.slice(body.end);
}

function looksBalanced(html) {
  const VOID = new Set(["br","img","hr","input","meta","link","source","track","wbr","col"]);
  const stack = [];
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g)) {
    const [, closing, name, self] = m;
    const tag = name.toLowerCase();
    if (VOID.has(tag) || self) continue;
    if (closing) { if (stack.pop() !== tag) return false; }
    else stack.push(tag);
  }
  return stack.length === 0;
}

/* ------------------------------------------------------------------ */

const HTML_FILES = [
  "sites/cycling/2026-kurzeme/index.html",
  "sites/cycling/2025-melnsils/index.html",
  "sites/cycling/2025-latgale/index.html",
  "sites/cycling/2024-gauja/index.html",
  "sites/cycling/2023-estonia/index.html",
  "sites/cycling/reports/2026-kurzeme-lv/index.html",
  "sites/cycling/reports/2026-kurzeme/index.html",
  "sites/cycling/reports/2025-melnsils/index.html",
  "sites/cycling/reports/2025-latgale/index.html",
  "sites/cycling/reports/2024-gauja/index.html",
  "sites/cycling/reports/2023-estonia/index.html",
];

let failures = 0;
const ok = (name, pass, detail = "") => {
  if (!pass) failures++;
  console.log(`${pass ? "  ok  " : "FAIL  "}${name}${detail ? " — " + detail : ""}`);
};

/* 0 — the inlined rules still match the TypeScript source */
const htmlTs = readFileSync(join(ROOT, "src/lib/edit/html.ts"), "utf8");
ok(
  "parser rules still match src/lib/edit/html.ts",
  htmlTs.includes("rpmain") &&
    htmlTs.includes("<h2\\b[^>]*>([\\s\\S]*?)<\\/h2\\s*>") &&
    htmlTs.includes('"br", "img", "hr"'),
  "update this test if the parser changed"
);

/* 1 — identity: no edits means no byte changes */
for (const rel of HTML_FILES) {
  const src = readFileSync(join(ROOT, rel), "utf8");
  ok(`identity · ${rel.split("/").slice(-2).join("/")}`, writeSections(src, {}) === src);
}

/* 2 — every file yields sections, and each one round-trips unchanged */
for (const rel of HTML_FILES) {
  const src = readFileSync(join(ROOT, rel), "utf8");
  const secs = readSections(src);
  const name = rel.split("/").slice(-2).join("/");
  ok(`sections found · ${name}`, secs.length > 0, `${secs.length} sections`);
  const same = writeSections(src, Object.fromEntries(secs.map((s) => [s.key, s.html])));
  ok(`re-write unchanged · ${name}`, same === src);
}

/* 3 — a targeted edit changes only its own section */
{
  const rel = "sites/cycling/2026-kurzeme/index.html";
  const src = readFileSync(join(ROOT, rel), "utf8");
  const secs = readSections(src);
  const target = secs[1];
  const edited = writeSections(src, {
    [target.key]: target.html.replace(/<h2>([^<]*)<\/h2>/, "<h2>ZZTEST</h2>"),
  });
  ok("targeted edit applied", edited.includes("<h2>ZZTEST</h2>"));
  ok("only one heading changed", (edited.match(/ZZTEST/g) || []).length === 1);
  ok("file length sane", Math.abs(edited.length - src.length) < 60);
  const back = readSections(edited);
  ok("section count stable after edit", back.length === secs.length);
  ok(
    "other sections untouched",
    secs.every((s, i) => (i === 1 ? true : s.html === back[i].html))
  );
}

/* 4 — the balance check catches phone-editing accidents */
ok("balanced html accepted", looksBalanced("<p>a <strong>b</strong></p>"));
ok("self-closing accepted", looksBalanced('<p>a<br>b<img src="x"></p>'));
ok("unclosed tag rejected", !looksBalanced("<p>a <strong>b</p>"));
ok("stray close rejected", !looksBalanced("a</p>"));

/* 5 — tours.js survives a parse/serialize cycle with values intact */
{
  const rel = "sites/cycling/assets/tours.js";
  const raw = readFileSync(join(ROOT, rel), "utf8");
  const open = raw.indexOf("{");
  const close = raw.lastIndexOf("}");
  const data = JSON.parse(raw.slice(open, close + 1));
  const again = JSON.parse(JSON.stringify(data));
  ok("tours payload parses", Array.isArray(data.tours) && data.tours.length === 5);
  ok(
    "tours values survive serialization",
    JSON.stringify(data) === JSON.stringify(again)
  );
  ok(
    "map geometry preserved",
    JSON.stringify(data.regions) === JSON.stringify(again.regions)
  );
  const edited = structuredClone(data);
  edited.tours[0].title = "Pārbaude";
  const rebuilt = raw.slice(0, open) + JSON.stringify(edited) + raw.slice(close + 1);
  ok("tours edit lands", rebuilt.includes('"title":"Pārbaude"'));
  ok("tours wrapper preserved", rebuilt.startsWith("window.CYCLING"));
}

/* 6 — territories.json matches what the site expects */
{
  const data = JSON.parse(
    readFileSync(join(ROOT, "content/site/territories.json"), "utf8")
  );
  ok("8 territories", data.territories.length === 8);
  ok(
    "every territory is bilingual",
    data.territories.every(
      (t) => t.name?.lv && t.name?.en && t.datumLines?.lv?.length === 2
    )
  );
  ok(
    "ids match the map data",
    readFileSync(join(ROOT, "src/data/heroTracks.ts"), "utf8").split('id: "').length -
      1 ===
      8
  );
}

/* 7 — no secret ever reaches a client component */
{
  const clientFiles = readdirSync(join(ROOT, "src/components/edit")).map((f) =>
    readFileSync(join(ROOT, "src/components/edit", f), "utf8")
  );
  const leaked = clientFiles.some((s) =>
    /EDIT_PASSWORD|EDIT_SECRET|GITHUB_TOKEN/.test(s)
  );
  ok("no secrets referenced in client code", !leaked);
}

console.log(failures ? `\n${failures} FAILED` : "\nAll edit round-trip checks passed");
process.exit(failures ? 1 : 0);
