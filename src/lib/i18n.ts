import type { Lang, Localized } from "@/lib/types";

export const LANGS: Lang[] = ["lv", "en"];
export const DEFAULT_LANG: Lang = "lv";
export const LANG_STORAGE_KEY = "atlas-lang";

/** Pick the right side of a localized value. */
export function t<T>(value: Localized<T>, lang: Lang): T {
  return value[lang];
}

/**
 * Every string of site chrome, in both languages.
 * Rule for this file: no entry may mix Latvian and English inside one string.
 */
export const ui = {
  siteName: { lv: "Personīgais Atlants", en: "Personal Atlas" },
  navContents: { lv: "Saturs", en: "Contents" },
  navLatest: { lv: "Jaunākais", en: "Latest" },
  navContact: { lv: "Kontakti", en: "Contact" },
  langLabel: { lv: "Valoda", en: "Language" },

  heroEdition: {
    lv: ["Personīgais Atlants", "2026. gada izdevums", "PUGULIS.COM"],
    en: ["Personal Atlas", "2026 edition", "PUGULIS.COM"],
  },
  heroSub: {
    lv: "Viena dzīve · daudzas teritorijas",
    en: "One life · many territories",
  },
  heroLegend: {
    lv: "Līnijas — 08 jaunākie Strava maršruti",
    en: "Lines — the 08 latest Strava routes",
  },
  scrollCue: { lv: "Saturs ↓", en: "Contents ↓" },

  contentsHead: { lv: "Saturs", en: "Contents" },
  contentsCount: { lv: "08 teritorijas", en: "08 territories" },

  panelTerritory: { lv: "Teritorija", en: "Territory" },
  panelClose: { lv: "Aizvērt ✕", en: "Close ✕" },
  panelNr: { lv: "Nr.", en: "No." },
  panelSoon: {
    lv: "Teritorija tiek kartēta — drīzumā",
    en: "This territory is being mapped — coming soon",
  },

  routesHead: { lv: "Jaunākie maršruti — Strava", en: "Latest routes — Strava" },
  routesSynced: { lv: "Reāli GPX dati ·", en: "Real GPX data ·" },
  routesOpen: { lv: "Atvērt aktivitāti Strava ↗", en: "Open activity on Strava ↗" },
  routesNote: {
    lv: "Dati — personīgais Strava arhīvs · skrējieni, braucieni un takas virs dažiem kilometriem",
    en: "Data — personal Strava archive · runs, rides and trails over a few kilometres",
  },
  routeRef: { lv: "M", en: "R" },

  footNetwork: { lv: "Teritorijas tīklā", en: "Territories online" },
  footAtlas: { lv: "Atlants", en: "Atlas" },
  footLatest: { lv: "Jaunākie maršruti", en: "Latest routes" },
  footAbout: { lv: "Par atlantu (izstrādē)", en: "About the atlas (in progress)" },
  footContact: { lv: "Kontakti", en: "Contact" },
  footColophon: { lv: "Kolofons", en: "Colophon" },
  footSetIn: {
    lv: "Salikts ar Archivo un IBM Plex Mono",
    en: "Set in Archivo and IBM Plex Mono",
  },
  footRoutes: {
    lv: "Maršruti — Strava GPX arhīvs",
    en: "Routes — Strava GPX archive",
  },
  footRights: { lv: "© Jānis Pūgulis, 2026", en: "© Jānis Pūgulis, 2026" },
  footServiceLink: { lv: "Inventāra serviss ↗", en: "Equipment service ↗" },
  colophonVersion: {
    lv: "Personīgais Atlants — v1.3",
    en: "Personal Atlas — v1.3",
  },
  colophonMapped: {
    lv: "07 no 08 teritorijām kartētas",
    en: "07 of 08 territories mapped",
  },
} satisfies Record<string, Localized<string> | Localized<string[]>>;
