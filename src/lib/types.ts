export type WorldId =
  | "travel"
  | "tri"
  | "velo"
  | "snow"
  | "serviss"
  | "baltais"
  | "rajons"
  | "tech";

/** Two supported site languages. Latvian is the default. */
export type Lang = "lv" | "en";

/** A value that exists separately in each language — never a mixed string. */
export type Localized<T = string> = Record<Lang, T>;

export interface Territory {
  id: WorldId;
  num: string;
  /** Display name (large editorial type). */
  name: Localized;
  /** Teaser line under the name, in the index. */
  teaser: Localized;
  /** Longer teaser used in the territory panel. */
  teaserPanel: Localized;
  /** Two right-column datum lines. */
  datumLines: Localized<[string, string]>;
  /** True if datum still contains placeholder sample data (renders *). */
  sample?: boolean;
  /** Which datum line carries the sample marker (0 or 1). */
  sampleOnLine?: 0 | 1;
  /** World ink color. */
  ink: string;
  /** External live site, if one exists. */
  href?: string;
  /** Internal route on this site, if the territory is mapped here. */
  hrefInternal?: string;
}

export type SportType = "Run" | "Ride" | "TrailRun" | "Hike";

/**
 * A real activity from the Strava archive, reduced to a normalized
 * route shape. Geometry is scale-normalized and stripped of absolute
 * coordinates — only the shape of the route is published.
 */
export interface StravaRoute {
  id: string;
  name: Localized;
  sport: SportType;
  sportLabel: Localized;
  dateISO: string;
  /** Display date, e.g. "19.07.2026" / "19 Jul 2026". */
  date: Localized;
  /** Locale-formatted distance — comma decimal in LV, point in EN. */
  distanceKm: Localized;
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
