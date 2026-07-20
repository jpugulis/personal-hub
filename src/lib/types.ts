export type WorldId =
  | "travel"
  | "tri"
  | "velo"
  | "snow"
  | "serviss"
  | "baltais"
  | "rajons"
  | "tech";

/** Geometry of a territory's route line on the hero map (1440×900 viewBox). */
export interface HeroRoute {
  d: string;
  /** Start marker [cx, cy]. */
  marker: [number, number];
  /** Index-number label position [x, y]. */
  label: [number, number];
}

export interface Territory {
  id: WorldId;
  num: string;
  /** Latvian display name (large editorial type). */
  name: string;
  /** Latvian teaser line under the name. */
  teaser: string;
  /** English teaser used in the territory panel. */
  teaserPanel: string;
  /** Two right-column datum lines. */
  datumLines: [string, string];
  /** True if datum still contains placeholder sample data (renders *). */
  sample?: boolean;
  /** Which datum line carries the sample marker (0 or 1). */
  sampleOnLine?: 0 | 1;
  /** World ink color. */
  ink: string;
  /** External live site, if one exists. */
  href?: string;
  heroRoute: HeroRoute;
}

export type SportType = "Run" | "Ride" | "TrailRun" | "Hike";

/**
 * A real activity from the Strava archive, reduced to a normalized
 * route shape. Geometry is scale-normalized and stripped of absolute
 * coordinates — only the shape of the route is published.
 */
export interface StravaRoute {
  id: string;
  name: string;
  sport: SportType;
  sportLv: string;
  dateISO: string;
  /** Display date, e.g. "19.07.2026". */
  dateLv: string;
  distanceKm: string;
  movingTime: string;
  elevationGain: number;
  ink: string;
  /** Normalized viewBox size [w, h]. */
  box: [number, number];
  /** Normalized SVG path of the route. */
  path: string;
  start: [number, number];
  end: [number, number];
}

/** A personally important place, published at region precision only. */
export interface PlaceMark {
  name: string;
  /** Region-level latitude (2 decimals ≈ 1 km). */
  lat: number;
  /** Region-level longitude (2 decimals ≈ 1 km). */
  lng: number;
}
