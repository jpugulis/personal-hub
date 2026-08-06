/**
 * Splitting a hand-written page into editable sections.
 *
 * The cycling site is static HTML, not markdown, and rewriting it through a
 * DOM parser would reformat the whole file. Instead we work on the raw text:
 * find the prose container, cut it at every <h2>, and hand each slice back as
 * one block of HTML. Saving splices the edited slices back at the exact same
 * character offsets, so every byte outside the edited sections — scripts,
 * indentation, SVG, comments — survives untouched.
 */

export interface HtmlSection {
  /** Stable within one read/edit/save cycle. */
  key: string;
  /** Plain-text heading shown in the editor sidebar. */
  label: string;
  /** Raw inner HTML of the slice. */
  html: string;
}

interface Span {
  start: number;
  end: number;
}

const CONTAINERS = [
  /<main\b[^>]*class="[^"]*\brpmain\b[^"]*"[^>]*>/i,
  /<article\b[^>]*>/i,
  /<main\b[^>]*>/i,
];

function containerBody(src: string): Span | null {
  for (const re of CONTAINERS) {
    const open = re.exec(src);
    if (!open) continue;
    const tag = /^<(\w+)/.exec(open[0])![1];
    const start = open.index + open[0].length;
    // Walk nested same-name tags to find the matching close.
    const scan = new RegExp(`<${tag}\\b[^>]*>|</${tag}\\s*>`, "gi");
    scan.lastIndex = start;
    let depth = 1;
    let m: RegExpExecArray | null;
    while ((m = scan.exec(src))) {
      depth += m[0].startsWith("</") ? -1 : 1;
      if (depth === 0) return { start, end: m.index };
    }
  }
  return null;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cut the page's prose container into sections, one per <h2>. */
export function readSections(src: string): HtmlSection[] {
  const body = containerBody(src);
  if (!body) return [];

  const inner = src.slice(body.start, body.end);
  const heads = [...inner.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/gi)];

  const cuts: { at: number; label: string }[] = [];
  if (heads.length === 0 || heads[0].index! > 0) {
    cuts.push({ at: 0, label: "Ievads" });
  }
  heads.forEach((h) => cuts.push({ at: h.index!, label: stripTags(h[1]) || "—" }));

  return cuts
    .map((c, i) => {
      const end = i + 1 < cuts.length ? cuts[i + 1].at : inner.length;
      return {
        key: `s${i}`,
        label: c.label,
        html: inner.slice(c.at, end).replace(/^\n+|\s+$/g, ""),
      };
    })
    .filter((s) => stripTags(s.html).length > 0);
}

/**
 * Put edited sections back. Sections are re-derived from the file being
 * written, so a key only ever refers to the slice it was read from.
 */
export function writeSections(
  src: string,
  edits: Record<string, string>
): string {
  const body = containerBody(src);
  if (!body) throw new Error("no editable container found in page");

  const inner = src.slice(body.start, body.end);
  const heads = [...inner.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/gi)];

  const cuts: number[] = [];
  if (heads.length === 0 || heads[0].index! > 0) cuts.push(0);
  heads.forEach((h) => cuts.push(h.index!));

  let out = "";
  let cursor = 0;
  cuts.forEach((at, i) => {
    const end = i + 1 < cuts.length ? cuts[i + 1] : inner.length;
    const slice = inner.slice(at, end);
    const replacement = edits[`s${i}`];
    out += inner.slice(cursor, at);
    if (replacement === undefined) {
      out += slice;
    } else {
      /* keep the original leading newline/indent and trailing whitespace */
      const lead = /^\s*/.exec(slice)![0];
      const tail = /\s*$/.exec(slice)![0];
      out += lead + replacement.trim() + tail;
    }
    cursor = end;
  });
  out += inner.slice(cursor);

  return src.slice(0, body.start) + out + src.slice(body.end);
}

/**
 * Cheap sanity check before committing: every tag the editor opens must be
 * closed. Catches the usual phone-editing accident of deleting half a tag.
 */
export function looksBalanced(html: string): boolean {
  const VOID = new Set([
    "br", "img", "hr", "input", "meta", "link", "source", "track", "wbr", "col",
  ]);
  const stack: string[] = [];
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClosed] = m;
    const tag = name.toLowerCase();
    if (VOID.has(tag) || selfClosed) continue;
    if (closing) {
      if (stack.pop() !== tag) return false;
    } else {
      stack.push(tag);
    }
  }
  return stack.length === 0;
}
