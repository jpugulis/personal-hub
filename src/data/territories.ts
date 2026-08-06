import type { Territory } from "@/lib/types";

/**
 * The eight personal territories — single typed source for the index and
 * the territory panels. Every piece of copy exists separately in Latvian
 * and English; no string mixes the two.
 *
 * Hero map geometry lives in data/heroTracks.ts (generated from real GPX).
 */
export const territories: Territory[] = [
  {
    id: "travel",
    num: "01",
    name: { lv: "Ceļojumi", en: "Travel" },
    teaser: { lv: "Ceļojumu hronikas", en: "Travel chronicles" },
    teaserPanel: {
      lv: "Kalni · ekspedīcijas · kultūras · fotogrāfija",
      en: "Mountains · expeditions · cultures · photography",
    },
    datumLines: {
      lv: ["jptravel.pugulis.com", "Ceļojumu žurnāls — atvērts ↗"],
      en: ["jptravel.pugulis.com", "Logbook — open ↗"],
    },
    ink: "#B0742A",
    href: "https://jptravel.pugulis.com/",
  },
  {
    id: "tri",
    num: "02",
    name: { lv: "Triatlons", en: "Triathlon" },
    teaser: {
      lv: "Ironman ceļš — treniņi, sacensības, izturība, dati",
      en: "The road to Ironman — training, racing, endurance, data",
    },
    teaserPanel: {
      lv: "Ironman ceļš · treniņi · sacensības · dati",
      en: "The road to Ironman · training · racing · data",
    },
    datumLines: {
      lv: ["Podersdorfa — 06.09.2026", "Treniņu analīze →"],
      en: ["Podersdorf — 6 Sep 2026", "Training analysis →"],
    },
    ink: "#C8401F",
    hrefInternal: "/triatlons",
  },
  {
    id: "velo",
    num: "03",
    name: { lv: "Velo ekspedīcijas", en: "Cycling expeditions" },
    teaser: {
      lv: "Vairāku dienu braucieni — kartes, GPX, hronikas",
      en: "Multi-day rides — maps, GPX, chronicles",
    },
    teaserPanel: {
      lv: "Vairāku dienu piedzīvojumi · GPX · hronikas",
      en: "Multi-day adventures · GPX · chronicles",
    },
    datumLines: {
      lv: ["cycling.pugulis.com", "04 ekspedīcijas · 2023–2026 ↗"],
      en: ["cycling.pugulis.com", "04 expeditions · 2023–2026 ↗"],
    },
    ink: "#5C7A2E",
    href: "https://cycling.pugulis.com/",
  },
  {
    id: "snow",
    num: "04",
    name: { lv: "Snovbords", en: "Snowboarding" },
    teaser: {
      lv: "Piedzīvojumi uz snovborda dēļa & instruktāža",
      en: "Adventures on a snowboard & instruction",
    },
    teaserPanel: {
      lv: "Braukšana · instruktāža · kalni",
      en: "Riding · instruction · mountains",
    },
    datumLines: {
      lv: ["jpsnowboard.vercel.app", "Sezona — atvērta ↗"],
      en: ["jpsnowboard.vercel.app", "Season — open ↗"],
    },
    ink: "#2E6E9E",
    href: "https://jpsnowboard.vercel.app/",
  },
  {
    id: "serviss",
    num: "05",
    name: { lv: "Inventāra serviss", en: "Equipment service" },
    teaser: {
      lv: "Slēpju un snovbordu apkope — vasks, kantis, serviss",
      en: "Ski and snowboard care — wax, edges, service",
    },
    teaserPanel: {
      lv: "Vasks · kantis · apkope",
      en: "Wax · edges · maintenance",
    },
    datumLines: {
      lv: ["Vasks · kantis · remonts", "Servisa lapa ↗"],
      en: ["Wax · edges · repair", "Service page ↗"],
    },
    ink: "#3E8578",
    href: "https://v0-ski-and-snowboard-landing-page.vercel.app/",
  },
  {
    id: "baltais",
    num: "06",
    /* An organisation — sajūtu inženieri. Nothing to do with winter. */
    name: { lv: "Baltais Kalns", en: "Baltais Kalns" },
    teaser: {
      lv: "Sajūtu inženieri",
      en: "Sajūtu inženieri — an adventure organisation",
    },
    teaserPanel: {
      lv: "Sajūtu inženieri · piedzīvojumi · pārgājieni · kopiena",
      en: "Sajūtu inženieri · adventures · long walks · community",
    },
    datumLines: {
      lv: ["baltaiskalns.lv", "Kolka–Dubulti · #7nieks ↗"],
      en: ["baltaiskalns.lv", "Kolka–Dubulti · #7nieks ↗"],
    },
    ink: "#4956A8",
    href: "https://www.baltaiskalns.lv/",
  },
  {
    id: "rajons",
    num: "07",
    name: { lv: "SK Rajons", en: "SK Rajons" },
    teaser: {
      lv: "Novuss, volejbols, šahs un hokejs",
      en: "Novuss, volleyball, chess and hockey",
    },
    teaserPanel: {
      lv: "Novuss · volejbols · šahs · hokejs",
      en: "Novuss · volleyball · chess · hockey",
    },
    datumLines: {
      lv: ["skr.lv ↗", "Kluba dzīve"],
      en: ["skr.lv ↗", "Club life"],
    },
    ink: "#7D4E24",
    href: "https://skr.lv/",
  },
  {
    id: "tech",
    num: "08",
    name: { lv: "Tehnoloģijas", en: "Technology" },
    teaser: {
      lv: "IT infrastruktūra, automatizācija, mājaslapas, AI",
      en: "IT infrastructure, automation, websites, AI",
    },
    teaserPanel: {
      lv: "Infrastruktūra · automatizācija · AI eksperimenti",
      en: "Infrastructure · automation · AI experiments",
    },
    datumLines: {
      lv: ["Infrastruktūra · automatizācija · AI", "Projektu darbnīca"],
      en: ["Infrastructure · automation · AI", "Project workshop"],
    },
    ink: "#5F4E9E",
  },
];

export const territoryCount = territories.length;

/** Ink lookup for the hero map, keyed by territory id. */
export const territoryInk = Object.fromEntries(
  territories.map((t) => [t.id, t.ink])
) as Record<Territory["id"], string>;

/** Index number lookup for the hero map, keyed by territory id. */
export const territoryNum = Object.fromEntries(
  territories.map((t) => [t.id, t.num])
) as Record<Territory["id"], string>;
