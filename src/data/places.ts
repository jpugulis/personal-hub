import type { PlaceMark } from "@/lib/types";

/**
 * Personally important places, published at region precision only
 * (2 decimal degrees ≈ 1 km — deliberately no precise addresses).
 * Rendered as crosshair marks on the hero map, grid-accurate:
 * the hero graticule maps 57°N→y150, 56°N→y450, 24°E→x360, 25°E→x720.
 */
export const importantPlaces: PlaceMark[] = [
  { name: "Bieriņi — Rīga", lat: 56.92, lng: 24.05 },
  { name: "Carnikava", lat: 57.13, lng: 24.28 },
];

/** Project region-level lat/lng onto the hero map's 1440×900 viewBox. */
export function projectToHero(p: PlaceMark): { x: number; y: number } {
  return {
    x: Math.round(360 + (p.lng - 24) * 360),
    y: Math.round(150 + (57 - p.lat) * 300),
  };
}
