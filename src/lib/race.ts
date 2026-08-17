/**
 * The race the triathlon territory counts down to.
 *
 * One definition, used by the server render and by the client correction in
 * TriatlonsIndex. The number on the page is the only thing on the site that
 * goes stale on its own, so it is worth keeping in a single place.
 */
export const RACE_ISO = "2026-09-06T00:00:00Z";

/** Whole days from now until the start. Never negative. */
export function daysToRace(now: number = Date.now()): number {
  const race = new Date(RACE_ISO).getTime();
  return Math.max(0, Math.ceil((race - now) / 86_400_000));
}
