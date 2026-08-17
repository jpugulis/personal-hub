"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import {
  GROUPS,
  milestones,
  totalHours,
  totals,
  weeks,
  type Group,
} from "@/data/trainingYear";

/**
 * The season, week by week, every sport in it.
 *
 * Drawn in HTML rather than SVG on purpose: an SVG viewBox scales its own text
 * down with the drawing, which on a 390 px phone turns 10 px labels into 6 px.
 * Flex columns keep the type at real sizes at every width, and the bars are
 * still just rectangles.
 */

const T = {
  head: { lv: "Gada apjoms", en: "The year in volume" },
  hours: { lv: "h", en: "h" },
  weeksN: { lv: "nedēļas", en: "weeks" },
  lede: {
    lv: "Katrs stabiņš ir viena nedēļa kustībā. Mērvienība ir stundas, nevis kilometri — 3 km peldēšanas un 3 km uz velosipēda nav viens un tas pats.",
    en: "Each column is one week in motion. The unit is hours, not kilometres — 3 km of swimming and 3 km on a bike are not the same thing.",
  },
  week: { lv: "Nedēļa", en: "Week" },
  none: { lv: "atpūta", en: "rest" },
  keyHead: { lv: "Atskaites punkti", en: "Milestones" },
  keyNote: {
    lv: "Loksne ir uzrakstīta tur, kur dati bija vērti analīzi.",
    en: "A sheet is written where the data was worth the analysis.",
  },
  sheet: { lv: "Analīze", en: "Analysis" },
} as const;

const LABEL: Record<Group, { lv: string; en: string }> = {
  swim: { lv: "Peldēšana", en: "Swim" },
  bike: { lv: "Velo", en: "Bike" },
  run: { lv: "Skriešana", en: "Run" },
  winter: { lv: "Ziema", en: "Winter" },
  other: { lv: "Pārējais", en: "Everything else" },
};

/** Swim, bike and run carry the argument; winter and the rest are context. */
const INK: Record<Group, string> = {
  swim: "#2E6E9E",
  bike: "#5C7A2E",
  run: "#C8401F",
  winter: "#4956A8",
  other: "#9a917f",
};

const MONTH = {
  lv: ["janv.", "febr.", "marts", "apr.", "maijs", "jūn.", "jūl.", "aug."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
};

/** 18,2 in Latvian, 18.2 in English. One decimal, always. */
function num(v: number, lang: "lv" | "en") {
  const s = v.toFixed(1);
  return lang === "lv" ? s.replace(".", ",") : s;
}

function weekTotal(i: number) {
  return weeks[i].h.reduce((a, b) => a + b, 0);
}

/** "13.–19. jūl." / "13–19 Jul" */
function span(startISO: string, lang: "lv" | "en") {
  const a = new Date(startISO + "T00:00:00Z");
  const b = new Date(a.getTime() + 6 * 86_400_000);
  const ma = MONTH[lang][a.getUTCMonth()];
  const mb = MONTH[lang][b.getUTCMonth()];
  const da = a.getUTCDate();
  const db = b.getUTCDate();
  if (lang === "lv") {
    return ma === mb ? `${da}.–${db}. ${ma}` : `${da}. ${ma} – ${db}. ${mb}`;
  }
  return ma === mb ? `${da}–${db} ${ma}` : `${da} ${ma} – ${db} ${mb}`;
}

/** Where each month first appears, for the axis ticks. */
function monthTicks() {
  const out: { i: number; m: number }[] = [];
  let seen = -1;
  weeks.forEach((w, i) => {
    const m = new Date(w.start + "T00:00:00Z").getUTCMonth();
    if (m !== seen) {
      out.push({ i, m });
      seen = m;
    }
  });
  return out;
}

const TICKS = monthTicks();
const MAX = Math.max(...weeks.map((_, i) => weekTotal(i)));
/** Round the ceiling up to the next 10 h so the gridlines are whole numbers. */
const CEIL = Math.ceil(MAX / 10) * 10;
const MARKED = new Map(milestones.map((m) => [m.i, m]));

export default function TrainingYear() {
  const { lang } = useLang();
  const [active, setActive] = useState(weeks.length - 1);
  const w = weeks[active];
  const total = weekTotal(active);

  return (
    <section className="ty">
      <div className="section-head">
        <span>{T.head[lang]}</span>
        <span className="r">
          {num(totalHours, lang)} {T.hours[lang]} · {weeks.length}{" "}
          {T.weeksN[lang]}
        </span>
      </div>

      <p className="ty-lede">{T.lede[lang]}</p>

      {/* the readout sits above the plot so the bars never move under a tooltip */}
      <div className="ty-readout" aria-live="polite">
        <span className="ty-readout-w">
          {T.week[lang]} {w.w} · {span(w.start, lang)}
        </span>
        <span className="ty-readout-h">
          {num(total, lang)} {T.hours[lang]}
        </span>
        <span className="ty-readout-split">
          {total === 0
            ? T.none[lang]
            : GROUPS.map((g, gi) =>
                w.h[gi] > 0 ? (
                  <span key={g}>
                    <i style={{ background: INK[g] }} aria-hidden="true" />
                    {LABEL[g][lang]} {num(w.h[gi], lang)}
                  </span>
                ) : null,
              )}
        </span>
      </div>

      <div className="ty-plot">
        <div className="ty-grid" aria-hidden="true">
          {[CEIL, CEIL / 2].map((v) => (
            <div key={v} className="ty-gridline" style={{ bottom: `${(v / CEIL) * 100}%` }}>
              <span>
                {v} {T.hours[lang]}
              </span>
            </div>
          ))}
        </div>

        <ol className="ty-cols">
          {weeks.map((wk, i) => {
            const t = weekTotal(i);
            const mark = MARKED.get(i);
            const label = `${T.week[lang]} ${wk.w}, ${num(t, lang)} ${T.hours[lang]}`;
            return (
              <li key={wk.start}>
                <button
                  type="button"
                  className={`ty-col${i === active ? " on" : ""}`}
                  aria-label={label}
                  aria-pressed={i === active}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  {mark && <span className="ty-mark" aria-hidden="true" />}
                  <span className="ty-stack">
                    {GROUPS.map((g, gi) =>
                      wk.h[gi] > 0 ? (
                        <span
                          key={g}
                          className="ty-seg"
                          style={{
                            height: `${(wk.h[gi] / CEIL) * 100}%`,
                            background: INK[g],
                          }}
                        />
                      ) : null,
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="ty-months" aria-hidden="true">
        {TICKS.map((t) => (
          <span
            key={t.i}
            style={{ left: `${((t.i + 0.5) / weeks.length) * 100}%` }}
          >
            {MONTH[lang][t.m]}
          </span>
        ))}
      </div>

      <ul className="ty-legend">
        {GROUPS.map((g) => (
          <li key={g}>
            <i style={{ background: INK[g] }} aria-hidden="true" />
            {LABEL[g][lang]}
            <b>
              {num(totals[g], lang)} {T.hours[lang]}
            </b>
          </li>
        ))}
      </ul>

      <div className="section-head">
        <span>{T.keyHead[lang]}</span>
        <span className="r">{String(milestones.length).padStart(2, "0")}</span>
      </div>

      <ol className="ty-keys">
        {milestones.map((m) => {
          const body = (
            <>
              <span className="d">{m.date.slice(8) + "." + m.date.slice(5, 7) + "."}</span>
              <span className="t">{m[lang]}</span>
              {m.sheet ? (
                <span className="a">
                  {T.sheet[lang]} →
                </span>
              ) : (
                <span className="a muted">
                  {num(weekTotal(m.i), lang)} {T.hours[lang]}
                </span>
              )}
            </>
          );
          return (
            <li key={m.date} onMouseEnter={() => setActive(m.i)}>
              {m.sheet ? (
                <Link href={`/triatlons/${m.sheet}`} className="ty-key on">
                  {body}
                </Link>
              ) : (
                <span className="ty-key">{body}</span>
              )}
            </li>
          );
        })}
      </ol>

      <p className="ty-note">{T.keyNote[lang]}</p>
    </section>
  );
}
