"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { daysToRace } from "@/lib/race";

interface Card {
  slug: string;
  sheet: string;
  titleLv: string;
  subtitleLv: string;
  dateLv: string;
  metaLine: string;
}

const T = {
  crumbAtlas: { lv: "Atlants", en: "Atlas" },
  crumbTerritory: { lv: "Teritorija 02", en: "Territory 02" },
  crumbRace: { lv: "Podersdorfa · 06.09.2026 · atlikušas", en: "Podersdorf · 6 Sep 2026 ·" },
  crumbDays: { lv: "dienas", en: "days to go" },
  sheetNo: { lv: "02 — Triatlons", en: "02 — Triathlon" },
  title: { lv: "Ironman ceļš", en: "The road to Ironman" },
  sub: {
    lv: "Treniņi · sacensības · izturība · dati",
    en: "Training · racing · endurance · data",
  },
  lede: {
    lv: "Šī teritorija tiek kartēta ar reāliem datiem. Katra analīze ir veidota no neapstrādātiem Garmin .FIT failiem, nevis no platformu kopsavilkumiem — jo tur pazūd tas, kas ir svarīgākais.",
    en: "This territory is mapped with real data. Every analysis is built from raw Garmin .FIT files rather than platform summaries — because the summaries lose whatever mattered most.",
  },
  kGoal: { lv: "Mērķis", en: "Goal" },
  kRace: { lv: "Sacensības", en: "Race" },
  kLeft: { lv: "Atlicis", en: "Remaining" },
  kSheets: { lv: "Analīzes", en: "Analyses" },
  vRace: { lv: "Podersdorfa", en: "Podersdorf" },
  sRace: { lv: "Austrija · 06.09.2026", en: "Austria · 6 Sep 2026" },
  vDays: { lv: "dienas", en: "days" },
  sStart: { lv: "līdz startam", en: "until the start" },
  sSheets: { lv: "publicētas loksnes", en: "sheets published" },
  headSheets: { lv: "Analīzes", en: "Analyses" },
  countSheets: { lv: "loksnes", en: "sheets" },
  soon: {
    lv: "Nākamās loksnes — sacensību atskaites, garo bricku analīzes un noslēguma taperēšanas dati. Datu avots: Garmin · Strava · WHOOP.",
    en: "Next sheets — race reports, long brick analyses and the final taper data. Sources: Garmin · Strava · WHOOP.",
  },
  lvOnly: {
    lv: "",
    en: "The analyses themselves are written in Latvian.",
  },
} as const;

/** The clock needs no subscription — a day is longer than any page view. */
const subscribeToNothing = () => () => {};

export default function TriatlonsIndex({
  sheets,
  left: serverLeft,
}: {
  sheets: Card[];
  /** Days remaining as of the last render. Correct in the HTML, not for ever. */
  left: number;
}) {
  const { lang } = useLang();
  const count = String(sheets.length).padStart(2, "0");

  /**
   * The page is prerendered, so the number baked into the HTML is only as
   * fresh as the last regeneration — and on a quiet site ISR hands the first
   * visitor after the window the stale copy and rebuilds behind them. Hydrate
   * with the server value so the first paint matches the HTML, then read the
   * reader's own clock. A countdown that is wrong is worse than no countdown.
   */
  const left = useSyncExternalStore(
    subscribeToNothing,
    () => daysToRace(),
    () => serverLeft,
  );

  return (
    <>
      <div className="art-crumb">
        <span>
          <Link href="/">{T.crumbAtlas[lang]}</Link> — {T.crumbTerritory[lang]}
        </span>
        <span className="r">
          {T.crumbRace[lang]} {left} {T.crumbDays[lang]}
        </span>
      </div>

      <header className="art-head">
        <div className="art-sheetno">{T.sheetNo[lang]}</div>
        <h1 className="art-title">{T.title[lang]}</h1>
        <p className="art-title-en">{T.sub[lang]}</p>
        <p className="art-lede">{T.lede[lang]}</p>
      </header>

      <div className="art-band">
        <div>
          <div className="k">{T.kGoal[lang]}</div>
          <div className="v">226 km</div>
          <div className="s">3,8 · 180 · 42,2</div>
        </div>
        <div>
          <div className="k">{T.kRace[lang]}</div>
          <div className="v">{T.vRace[lang]}</div>
          <div className="s">{T.sRace[lang]}</div>
        </div>
        <div>
          <div className="k">{T.kLeft[lang]}</div>
          <div className="v">
            {left} {T.vDays[lang]}
          </div>
          <div className="s">{T.sStart[lang]}</div>
        </div>
        <div>
          <div className="k">{T.kSheets[lang]}</div>
          <div className="v">{count}</div>
          <div className="s">{T.sSheets[lang]}</div>
        </div>
      </div>

      <div className="section-head">
        <span>{T.headSheets[lang]}</span>
        <span className="r">
          {count} {T.countSheets[lang]}
        </span>
      </div>

      <div className="art-list">
        {sheets.map((s) => (
          <Link key={s.slug} className="art-card" href={`/triatlons/${s.slug}`}>
            <span className="n">{s.sheet}</span>
            <span>
              <h2>{s.titleLv}</h2>
              <span className="sub">{s.subtitleLv}</span>
            </span>
            <span className="meta">
              {s.dateLv}
              <br />
              {s.metaLine}
            </span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>

      <p className="art-soon">
        {T.soon[lang]}
        {lang === "en" && <> {T.lvOnly.en}</>}
      </p>
    </>
  );
}
