# Content — authoring contract

This directory is the boundary between the two Claude projects.

| Project | Owns | Never touches |
| --- | --- | --- |
| **Adaptive Training Plan** | `content/**/*.md`, `public/triatlons/<date>/**` (charts, photos) | `.tsx`, `globals.css`, deploys |
| **pugulis.com** | renderer, layout, routes, CSS, deploy | the prose inside content files |

**Publishing a new sheet is one file plus its media.** Drop a `.md` in
`content/triatlons/`, put the charts and photos under
`public/triatlons/<date>/`, commit, push. The index on `/triatlons` and the
route at `/triatlons/<slug>` are both derived from this directory — there is no
list to update and no page to create.

---

## File naming

```
content/triatlons/2026-08-09-brick-simulation.md   ← slug = filename
public/triatlons/2026-08-09/charts/*.png
public/triatlons/2026-08-09/photos/*.jpg
```

The slug becomes the URL. Use `YYYY-MM-DD-short-name`, lowercase, hyphens, no
Latvian diacritics — those break some clients when they land in a URL.

**Media must be namespaced by date.** Chart filenames repeat across sheets
(`01_bike_power_hr.png` every time), so a flat folder would overwrite the
previous sheet's charts.

---

## Frontmatter

Deliberately not YAML — `key: value` lines only, no nesting, so it cannot
silently mis-parse. Quotes are optional and stripped if present; use them when
the value contains a colon.

```
---
sheet: Nr. 02-02
date: 2026-08-09
titleLv: Otrā ģenerālmēģinājuma diena
subtitleEn: Race-pace brick — 5 h at IF 0.70 + 75 min run
subtitleLv: 180 km · 75 min skrējiens — kadences un nātrija tests
crumbNote: 09.08.2026 · 28 dienas pirms Podersdorf
metaLine: 180,0 km + 15,2 km
mediaBase: /triatlons/2026-08-09
cover: charts/01_bike_power_hr.png
lede: "One paragraph, rendered large under the title."
description: SEO and browser-tab description.
ogDescription: Link-preview description. Falls back to description if omitted.
band: Velo | 180,0 km | 5:02:11 kustībā
band: Normalizētā jauda | 182 W | IF 0,70 · 3 300 kJ
band: Skrējiens | 15,2 km | 75:40 · vid. SF 148
band: Kadence | 88 rpm | mērķis 85–90
---
```

`band:` repeats — one line per stat, three pipe-separated fields
(`label | number | small print`). Four reads best; the grid handles two or six.

`cover` and all `figure` paths are relative to `mediaBase`.

---

## Body

Standard markdown, plus GFM tables. Two conventions and five custom blocks.

### Section headings

`##` takes a Latvian heading and an English subtitle, split on `|`:

```markdown
## Velo | 02 — The bike
```

Renders the English small and mono above the big Latvian heading. `###` and
`####` are plain.

### Table row emphasis

**Bold the first cell** to tint the whole row — use it for totals and for the
rows that carry the argument:

```markdown
| **Kopā** | 88,3 min | 13 apstāšanās |
```

### `figure` — a chart or photo

```
​```figure
src: charts/01_bike_power_hr.png
alt: Jauda un sirdsdarbība pa distanci
caption: Att. 01 — Jauda un sirdsdarbība pa distanci
note: 30 s slīdošais vidējais
​```
```

`src` is relative to `mediaBase`. Dimensions are read from the file at build
time, so don't supply them. `caption` sits left, `note` right. Charts already
have their title burned into the image — don't repeat it in the caption; use
the caption for the figure number and the note for method.

Plain markdown images work too and become figures with the alt text as caption:
`![Att. 10 — something](charts/10_thing.png)`

### `gallery` — 2–3 photos side by side

```
​```gallery
photos/murjani-climb.jpg | Murjāņu posms, pirms sāpēm
photos/limbazi-cafe.jpg | ParkCafe — 47 minūtes
photos/saulkrasti.jpg | Pretvējš uz Saulkrastiem
​```
```

One `path | caption` per line. Stacks to one column on mobile.

### `video` — Bunny Stream, or a short local clip

```
​```video
library: 123456
id: 8a7b6c5d-1234-5678-9abc-def012345678
caption: Murjāņu kāpums — 941 W sprints
​```
```

Get `library` and `id` from the Bunny dashboard (Stream → your library → the
video → Embed). **Video belongs on Bunny, not in this repo** — git keeps every
version of every binary forever, and `/public` video gets no adaptive bitrate
and bills as Vercel bandwidth.

For a clip under ~5 MB it's fine to skip Bunny and point `id` at a local file:

```
​```video
id: photos/cramp-walk.mp4
caption: Otrais krampis — pirmie soļi
​```
```

### `note` — a side remark

```
​```note
label: Godīgs iebildums
Paragraph one. Inline **markdown** works.

Paragraph two.
​```
```

Use for caveats, honest limitations, missing data. Tinted panel, coloured rule.

### `verdict` — a boxed conclusion

```
​```verdict
label: Secinājums
The one sentence you want someone to remember.
​```
```

Heavier than `note`. Roughly one or two per sheet — they stop working if
everything is a verdict.

---

## Diagrams

```
​```diagram
reflex-loop
​```
```

Available keys are registered in `src/components/sheet/Diagrams.tsx`:

| Key | What |
| --- | --- |
| `reflex-loop` | Muscle spindle / Golgi tendon organ control loop |
| `runaway` | Fresh vs fatigued muscle — loss of Ib inhibition |

Diagrams are hand-authored SVG in the atlas palette, so they're presentation
and live in the website project. **Adding one is a website-project job** — ask
there, don't hand-write SVG into a content file.

---

## Checks before pushing

```bash
npx tsc --noEmit          # types
npx eslint src            # lint incl. Next rules
npm run dev               # then open the new sheet and read it
```

Things that silently look wrong rather than failing the build:

- A `src:` typo renders a 16:9 grey box instead of erroring
- An unknown `diagram` key renders nothing at all
- A missing `date` breaks the sort order and shows `NaN` in the date column
- Wide tables need a real read on mobile — they scroll, but check the columns
  you care about are visible before the scroll
