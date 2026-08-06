"use client";

import { useEffect, useRef } from "react";
import { stravaRoutes, stravaSyncedAt } from "@/data/stravaRoutes";
import { useLang } from "@/components/LangProvider";
import { ui } from "@/lib/i18n";

export default function LatestRoutes() {
  const ref = useRef<HTMLElement>(null);
  const { lang } = useLang();

  /* reveal cards + trigger route drawing on scroll */
  useEffect(() => {
    const cards = ref.current?.querySelectorAll<HTMLElement>(".rcard");
    if (!cards) return;
    if (!("IntersectionObserver" in window)) {
      cards.forEach((c) => c.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    cards.forEach((c) => io.observe(c));
    /* safety net: never leave content hidden (e.g. bots, odd viewports) */
    const failsafe = window.setTimeout(
      () => cards.forEach((c) => c.classList.add("in")),
      3000
    );
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <section className="routes" id="jaunakais" ref={ref}>
      <div className="section-head">
        <span>{ui.routesHead[lang]}</span>
        <span className="r">
          {ui.routesSynced[lang]} {stravaSyncedAt[lang]}
        </span>
      </div>
      <div className="routes-grid">
        {stravaRoutes.map((r, i) => (
          <a
            key={r.id}
            className="rcard"
            href={`https://www.strava.com/activities/${r.id}`}
            target="_blank"
            rel="noopener"
            style={{ "--i": i } as React.CSSProperties}
          >
            <div className="stamp">
              <span>
                {ui.routeRef[lang]}-{String(i + 1).padStart(2, "0")} ·{" "}
                {r.sportLabel[lang]}
              </span>
              <span>{r.date[lang]} ↗</span>
            </div>
            <div className="rmap">
              <svg
                viewBox={`0 0 ${r.box[0]} ${r.box[1]}`}
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                <path
                  className="rpath"
                  d={r.path}
                  stroke={r.ink}
                  pathLength={1}
                  style={{ "--i": i } as React.CSSProperties}
                />
                <circle
                  cx={r.start[0]}
                  cy={r.start[1]}
                  r="5"
                  fill="none"
                  stroke={r.ink}
                  strokeWidth="2"
                />
                <circle
                  className="rend"
                  cx={r.end[0]}
                  cy={r.end[1]}
                  r="4.5"
                  fill={r.ink}
                  style={{ "--i": i } as React.CSSProperties}
                />
              </svg>
            </div>
            <h3>{r.name[lang]}</h3>
            <p className="rstats">
              {r.distanceKm[lang]} km · {r.movingTime} · +{r.elevationGain} m
              <br />
              {ui.routesOpen[lang]}
            </p>
          </a>
        ))}
      </div>
      <p className="routes-note">{ui.routesNote[lang]}</p>
    </section>
  );
}
