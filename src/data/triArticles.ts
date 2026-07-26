/**
 * Territory 02 — published analysis sheets.
 * Index metadata only; each sheet's body lives in its own route.
 */
export interface TriArticle {
  slug: string;
  /** Sheet number in the atlas, e.g. "Nr. 02-01". */
  sheet: string;
  titleLv: string;
  subtitleLv: string;
  dateISO: string;
  dateLv: string;
  /** Right-column summary line on the index card. */
  metaLine: string;
}

export const articles: TriArticle[] = [
  {
    slug: "2026-07-25-tour-de-viduszeme",
    sheet: "Nr. 02-01",
    titleLv: "Viena treniņa anatomija",
    subtitleLv:
      "154 km · brick skrējiens · divi krampji — 43 dienas pirms Podersdorf",
    dateISO: "2026-07-25",
    dateLv: "25.07.2026",
    metaLine: "154,4 km + 9,6 km",
  },
];
