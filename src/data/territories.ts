import type { Territory } from "@/lib/types";
import data from "../../content/site/territories.json";

/**
 * The eight personal territories.
 *
 * The copy itself lives in content/site/territories.json so it can be edited
 * from /edit on a phone without touching code. This module only types it and
 * derives the lookups the map needs.
 *
 * Hero map geometry lives in data/heroTracks.ts (generated from real GPX).
 */
export const territories: Territory[] = data.territories.map((t) => ({
  id: t.id as Territory["id"],
  num: t.num,
  name: t.name,
  teaser: t.teaser,
  teaserPanel: t.teaserPanel,
  datumLines: {
    lv: [t.datumLines.lv[0], t.datumLines.lv[1]],
    en: [t.datumLines.en[0], t.datumLines.en[1]],
  },
  ink: t.ink,
  ...(t.href ? { href: t.href } : {}),
  ...(t.hrefInternal ? { hrefInternal: t.hrefInternal } : {}),
}));

export const territoryCount = territories.length;

/** Ink lookup for the hero map, keyed by territory id. */
export const territoryInk = Object.fromEntries(
  territories.map((t) => [t.id, t.ink])
) as Record<Territory["id"], string>;

/** Index number lookup for the hero map, keyed by territory id. */
export const territoryNum = Object.fromEntries(
  territories.map((t) => [t.id, t.num])
) as Record<Territory["id"], string>;
