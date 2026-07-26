import { territories } from "@/data/territories";
import { importantPlaces, projectToHero } from "@/data/places";
import { stravaRoutes } from "@/data/stravaRoutes";

const GRID_X = [120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320];
const GRID_Y = [150, 300, 450, 600, 750];

/**
 * Hero "topography": instead of decorative ellipses, the faint contour
 * clusters are the shapes of real recent Strava activities, each drawn
 * as a set of nested rings like elevation bands.
 */
const TOPO: { routeIndex: number; cx: number; cy: number; s: number }[] = [
  { routeIndex: 2, cx: 300, cy: 265, s: 0.82 }, // trail run — upper left
  { routeIndex: 0, cx: 700, cy: 450, s: 0.74 }, // run loop — centre
  { routeIndex: 1, cx: 1140, cy: 610, s: 0.85 }, // ride — lower right
];
const RINGS = [1, 0.8, 0.6];

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
        {/* topography from real Strava route shapes */}
        <g>
          {TOPO.map(({ routeIndex, cx, cy, s }) => {
            const r = stravaRoutes[routeIndex];
            return RINGS.map((k) => {
              const sc = s * k;
              const tx = cx - (r.box[0] * sc) / 2;
              const ty = cy - (r.box[1] * sc) / 2;
              return (
                <g
                  key={`${r.id}-${k}`}
                  transform={`translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${sc.toFixed(3)})`}
                >
                  <path
                    className="contour"
                    d={r.path}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            });
          })}
        </g>
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
