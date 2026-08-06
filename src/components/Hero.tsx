"use client";

import { heroTracks, topoContours } from "@/data/heroTracks";
import { territoryInk, territoryNum } from "@/data/territories";
import { importantPlaces, projectToHero } from "@/data/places";
import { useLang } from "@/components/LangProvider";
import { ui } from "@/lib/i18n";

const GRID_X = [120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320];
const GRID_Y = [150, 300, 450, 600, 750];

export default function Hero() {
  const { lang } = useLang();

  return (
    <header className="hero">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* terrain: generated contour bands, drawn first so tracks sit on top */}
        <g className="topo">
          {topoContours.map((d, i) => (
            <path key={`c${i}`} className="contour" d={d} />
          ))}
        </g>

        {/* coordinate graticule */}
        <g>
          {GRID_X.map((x) => (
            <line key={`x${x}`} className="grid-line" x1={x} y1="0" x2={x} y2="900" />
          ))}
          {GRID_Y.map((y) => (
            <line key={`y${y}`} className="grid-line" x1="0" y1={y} x2="1440" y2={y} />
          ))}
        </g>

        {/* edge coordinates */}
        <text className="map-label" x="14" y="144">
          57°N
        </text>
        <text className="map-label" x="14" y="444">
          56°N
        </text>
        <text className="map-label" x="14" y="744">
          55°N
        </text>
        <text className="map-label" x="352" y="890">
          24°E
        </text>
        <text className="map-label" x="712" y="890">
          25°E
        </text>
        <text className="map-label" x="1072" y="890">
          26°E
        </text>

        {/* important places — region precision only */}
        <g>
          {importantPlaces.map((p) => {
            const { x, y } = projectToHero(p);
            return (
              <g key={p.name} className="place-mark">
                <line x1={x - 5} y1={y} x2={x + 5} y2={y} />
                <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
                <circle cx={x} cy={y} r="8" />
                <text className="place-label" x={x + 14} y={y + 3}>
                  {p.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* the eight latest real Strava traces, one per territory ink */}
        <g>
          {heroTracks.map((tr, i) => (
            <g key={tr.id}>
              <path
                className="route-halo"
                d={tr.d}
                pathLength={1}
                style={{ "--i": i } as React.CSSProperties}
              />
              <path
                className="route"
                stroke={territoryInk[tr.id]}
                d={tr.d}
                pathLength={1}
                style={{ "--i": i } as React.CSSProperties}
              />
            </g>
          ))}
        </g>

        {/* start markers + territory numbers */}
        <g>
          {heroTracks.map((tr) => (
            <g key={`m-${tr.id}`}>
              <circle
                className="route-marker"
                cx={tr.marker[0]}
                cy={tr.marker[1]}
                r="4.5"
                fill={territoryInk[tr.id]}
              />
              <text
                className="map-num"
                fill={territoryInk[tr.id]}
                x={tr.label[0]}
                y={tr.label[1]}
              >
                {territoryNum[tr.id]}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <div className="hero-edition">
        {ui.heroEdition[lang].map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </div>
      <h1 className="hero-name">
        <span>Jānis</span>
        <span>Pūgulis</span>
      </h1>
      <p className="hero-sub">{ui.heroSub[lang]}</p>
      <p className="hero-legend">{ui.heroLegend[lang]}</p>
      <div className="scroll-cue">{ui.scrollCue[lang]}</div>
    </header>
  );
}
