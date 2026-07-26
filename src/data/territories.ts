import type { Territory } from "@/lib/types";

/**
 * The eight personal territories — single typed source for the index,
 * the hero map routes, and the territory panels.
 * Content carried over from the approved Atlas prototype.
 */
export const territories: Territory[] = [
  {
    id: "travel",
    num: "01",
    name: "Ceļojumi",
    teaser: "Ceļojumu hronikas",
    teaserPanel: "Travel — mountains · expeditions · cultures · photography",
    datumLines: ["jptravel.pugulis.com", "Logbook — atvērts ↗"],
    ink: "#B0742A",
    href: "https://jptravel.pugulis.com/",
    heroRoute: {
      d: "M175 215 C 320 158, 385 262, 525 228 S 765 148, 885 212 S 1125 302, 1265 248",
      marker: [175, 215],
      label: [152, 200],
    },
  },
  {
    id: "tri",
    num: "02",
    name: "Triatlons",
    teaser: "Ironman ceļš — treniņi, sacensības, izturība, dati",
    teaserPanel: "Triathlon — Ironman ceļš · treniņi · sacensības · dati",
    datumLines: ["Podersdorf — 06.09.2026", "Treniņu analīze →"],
    ink: "#C8401F",
    hrefInternal: "/triatlons",
    heroRoute: {
      d: "M140 625 C 262 562, 342 646, 472 602 S 702 522, 832 588 S 1062 662, 1242 608",
      marker: [140, 625],
      label: [118, 610],
    },
  },
  {
    id: "velo",
    num: "03",
    name: "Velo ekspedīcijas",
    teaser: "Vairāku dienu braucieni — kartes, GPX, hronikas",
    teaserPanel:
      "Cycling expeditions — vairāku dienu piedzīvojumi · GPX · hronikas",
    datumLines: ["GPX arhīvs", "Ekspedīciju hronikas"],
    sample: true,
    sampleOnLine: 1,
    ink: "#5C7A2E",
    heroRoute: {
      d: "M225 762 C 362 702, 482 792, 622 748 S 902 692, 1062 758 S 1252 796, 1352 752",
      marker: [225, 762],
      label: [202, 747],
    },
  },
  {
    id: "snow",
    num: "04",
    name: "Snovbords",
    teaser: "Piedzīvojumi uz snovborda dēļa & instruktāža",
    teaserPanel: "Snowboarding — braukšana · instruktāža · ziemas dzīve",
    datumLines: ["jpsnowboard.vercel.app", "Sezona — atvērta ↗"],
    ink: "#2E6E9E",
    href: "https://jpsnowboard.vercel.app/",
    heroRoute: {
      d: "M1152 118 L 1104 192 L 1172 254 L 1108 332 L 1182 402 L 1128 462",
      marker: [1152, 118],
      label: [1165, 112],
    },
  },
  {
    id: "serviss",
    num: "05",
    name: "Inventāra serviss",
    teaser: "Slēpju un snovbordu apkope — vasks, kantis, serviss",
    teaserPanel: "Ski & snowboard service — vasks · kantis · apkope",
    datumLines: ["Vasks · kantis · remonts", "Servisa lapa ↗"],
    ink: "#3E8578",
    href: "https://v0-ski-and-snowboard-landing-page.vercel.app/",
    heroRoute: {
      d: "M952 822 H 1002 M 1014 822 H 1064 M 1076 822 H 1126 M 1138 822 H 1188",
      marker: [952, 822],
      label: [922, 812],
    },
  },
  {
    id: "baltais",
    num: "06",
    name: "Baltais Kalns",
    teaser: "Sajūtu Inženieri",
    teaserPanel: "Sajūtu Inženieri — ziema · kopiena · kalns",
    datumLines: ["baltaiskalns.lv", "Ziemas bāze ↗"],
    ink: "#4956A8",
    href: "https://www.baltaiskalns.lv/",
    heroRoute: {
      d: "M642 422 C 702 380, 782 400, 792 462 C 798 522, 702 546, 652 512 C 606 480, 602 452, 642 422 Z",
      marker: [642, 422],
      label: [614, 410],
    },
  },
  {
    id: "rajons",
    num: "07",
    name: "SK Rajons",
    teaser: "Novuss, volejbols, šahs un hokejs",
    teaserPanel: "Novuss · volejbols · šahs · hokejs",
    datumLines: ["skr.lv ↗", "Kluba dzīve"],
    ink: "#7D4E24",
    href: "https://skr.lv/",
    heroRoute: {
      d: "M282 472 L 415 448 L 442 542 L 309 566 Z",
      marker: [282, 472],
      label: [256, 460],
    },
  },
  {
    id: "tech",
    num: "08",
    name: "Tehnoloģijas",
    teaser: "IT infrastruktūra, automatizācija, mājaslapas, AI",
    teaserPanel:
      "Technology — infrastruktūra · automatizācija · AI eksperimenti",
    datumLines: ["Infra · Automation · AI", "Projektu darbnīca"],
    ink: "#5F4E9E",
    heroRoute: {
      d: "M425 322 h 88 v 58 h 108 v -42 h 82 v 64",
      marker: [425, 322],
      label: [398, 312],
    },
  },
];

export const territoryCount = territories.length;
