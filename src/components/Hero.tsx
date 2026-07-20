import { territories } from "@/data/territories";
import { importantPlaces, projectToHero } from "@/data/places";
import { latestActivity } from "@/data/stravaRoutes";

const GRID_X = [120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320];
const GRID_Y = [150, 300, 450, 600, 750];

const CONTOURS = [
  "M560 380c40-56 150-70 220-34s86 108 30 158-190 54-250 6-40-74 0-130z",
  "M590 400c30-42 112-52 165-25s64 81 22 118-142 40-187 4-30-55 0-97z",
  "M620 420c20-28 75-35 110-17s43 54 15 79-95 27-125 3-20-37 0-65z",
  "M1010 590c50-60 170-72 240-30s70 120 0 165-210 45-265-10-25-65 25-125z",
  "M1045 615c38-45 128-54 180-22s52 90 0 124-158 34-199-8-19-49 19-94z",
  "M150 180c45-50 145-58 205-22s62 98 5 138-175 40-222-5-33-61 12-111z",
  "M185 205c32-36 104-42 147-16s45 70 4 99-126 29-160-4-23-43 9-79z",
];

export default function Hero() {
  return (
    <header className="hero">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* coordinate grid */}
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
        {/* topographic contours */}
        <g>
          {CONTOURS.map((d) => (
            <path key={d.slice(0, 12)} className="contour" d={d} />
          ))}
        </g>
        {/* important places — region precision only */}
        <g>
          {importantPlaces.map((p) => {
            const { x, y } = projectToHero(p);
            return (
              <g key={p.name} className="place-mark">
                <line x1={x - 7} y1={y} x2={x + 7} y2={y} />
                <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
                <circle cx={x} cy={y} r="10.5" />
                <text className="place-label" x={x + 16} y={y + 3}>
                  {p.name}
                </text>
                <text className="place-coords" x={x + 16} y={y + 15}>
                  {p.lat.toFixed(2)}°N {p.lng.toFixed(2)}°E
                </text>
              </g>
            );
          })}
        </g>
        {/* routes: one per world */}
        <g>
          {territories.map((t, i) => (
            <path
              key={t.id}
              className="route"
              stroke={t.ink}
              d={t.heroRoute.d}
              pathLength={1}
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
        </g>
        {/* markers + numbers */}
        <g>
          {territories.map((t) => (
            <g key={t.id}>
              <circle
                className="route-marker"
                cx={t.heroRoute.marker[0]}
                cy={t.heroRoute.marker[1]}
                r="4.5"
                fill={t.ink}
              />
              <text
                className="map-num"
                fill={t.ink}
                x={t.heroRoute.label[0]}
                y={t.heroRoute.label[1]}
              >
                {t.num}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <div className="hero-status">
        <span className="dot" />
        <span>
          Status — pēdējais treniņš · {latestActivity.sportLv.toLowerCase()}{" "}
          {latestActivity.distanceKm} km · {latestActivity.dateLv.slice(0, 6)}
        </span>
      </div>
      <div className="hero-edition">
        Personīgais Atlants
        <br />
        2026. gada izdevums
        <br />
        PUGULIS.COM
      </div>
      <h1 className="hero-name">
        <span>Jānis</span>
        <span>Pūgulis</span>
      </h1>
      <p className="hero-sub">
        Viena dzīve · daudzas teritorijas — one life, many territories
      </p>
      <div className="scroll-cue">Saturs ↓</div>
    </header>
  );
}
