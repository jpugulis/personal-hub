# Personīgais Atlants — pugulis.com

The personal digital hub of Jānis Pūgulis. One life, many territories:
travel, triathlon, cycling expeditions, snowboarding, ski & snowboard
service, Baltais Kalns, SK Rajons, technology.

The homepage is a personal atlas — a cartographic index of eight
territories drawn on warm paper, set in Archivo and IBM Plex Mono,
with animated route lines built from real GPX data.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (utilities) + a bespoke design system in `globals.css`
- Self-hosted fonts via Fontsource (no runtime Google Fonts dependency)
- Fully static prerender — no CMS, no database

## Structure

```
prototype/                      the approved single-file HTML prototype (unchanged)
src/
  app/                          layout (fonts, metadata), page, globals.css, icon
  components/                   Nav, Hero, TerritoryIndex, TerritoryPanel,
                                LatestRoutes, Footer
  data/
    territories.ts              the eight territories — single typed source
    stravaRoutes.ts             latest real routes from the Strava archive
    places.ts                   important places (region precision only)
  lib/types.ts                  shared types
```

## Data & privacy

- `stravaRoutes.ts` is generated from the Strava API: latest run, ride
  and trail activities over a few kilometres. Geometry is
  scale-normalized — **no absolute coordinates are published**, only the
  shape of each route.
- Place marks on the hero map are published at region precision
  (2 decimal degrees ≈ 1 km), never precise addresses.
- Datum values still marked with `*` are sample content awaiting real
  data.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static production build
npm run lint
```
