# Personīgais Atlants — pugulis.com

The personal digital hub of Jānis Pūgulis. One life, many territories:
travel, triathlon, cycling expeditions, snowboarding, ski & snowboard
service, Baltais Kalns, SK Rajons, technology.

The homepage is a personal atlas — a cartographic index of eight
territories drawn on warm paper, set in Archivo and IBM Plex Mono. The
coloured lines on the hero are the real GPS traces of the eight most recent
Strava activities, laid over generated topographic contours.

The site is published in two languages, Latvian and English, chosen with the
`LV | EN` switch. Latvian is the server-rendered default. **No string ever
mixes the two** — `scripts/check_lang.py` enforces that.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (utilities) + a bespoke design system in `globals.css`
- Self-hosted fonts via Fontsource (no runtime Google Fonts dependency)
- Prerendered pages; content in the repo, edited through `/edit`

## Structure

```
prototype/                      the approved single-file HTML prototype (unchanged)
content/
  site/territories.json         the eight territories — editable copy
  triatlons/*.md                triathlon analysis sheets
sites/cycling/                  cycling.pugulis.com — separate static Vercel project
src/
  app/                          layout, page, globals.css, /edit, /api/edit
  components/                   Nav, Hero, TerritoryIndex, TerritoryPanel,
                                LatestRoutes, Footer, LangSwitch, edit/Editor
  data/
    heroTracks.ts               GENERATED — hero GPX geometry + contours
    stravaRoutes.ts             GENERATED — latest routes from the Strava archive
  lib/
    i18n.ts                     every string of site chrome, in both languages
    types.ts                    shared types
    edit/                       auth, GitHub client, content sources
scripts/
  gen_hero.py                   regenerate the hero map from Strava polylines
  check_lang.py                 fail on mixed-language strings
  test_edit_roundtrip.mjs       prove /edit cannot corrupt a page
```

## Editing

Text is edited from a phone at `/edit`, behind a password. Saves commit
straight to this repository. See **[docs/EDITING.md](docs/EDITING.md)** for
the environment variables and the GitHub token setup.

## Data & privacy

- `heroTracks.ts` and `stravaRoutes.ts` are generated from the Strava API by
  `scripts/gen_hero.py`. Geometry is scale-normalized — **no absolute
  coordinates are published**, only the shape of each route.

To refresh after new activities: export the latest polylines into
`scripts/data/strava-polylines.txt`, update the `SLOTS` and `CARDS` lists in
`scripts/gen_hero.py`, then run it.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint

python3 scripts/check_lang.py
node scripts/test_edit_roundtrip.mjs
```
