#!/usr/bin/env python3
"""
Generate the training-year data for territory 02.

Input:  scripts/data/strava-year.txt — one activity per line,
        date|sport|moving_s|dist_m|id|name
        (exported from the Strava API; see README)

Output: src/data/trainingYear.ts — weekly hours by sport group, the curated
        milestones, and the season totals.

Volume is measured in **hours of moving time**, not distance. Distance is the
wrong axis the moment more than one sport is on the chart: 3 km of swimming and
3 km of cycling are not the same week. Hours compare honestly.

Run from anywhere:  python3 scripts/gen_training_year.py
"""
import datetime as dt
import pathlib
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "data" / "strava-year.txt"
OUT = ROOT / "src" / "data" / "trainingYear.ts"

# The five bands of the chart. Swim, bike and run carry the argument; winter and
# everything else are the context that makes this one person rather than an
# Ironman training log.
GROUPS = ["swim", "bike", "run", "winter", "other"]
SPORT_GROUP = {
    "Swim": "swim",
    "Ride": "bike",
    "GravelRide": "bike",
    "VirtualRide": "bike",
    "Run": "run",
    "TrailRun": "run",
    "NordicSki": "winter",
    "BackcountrySki": "winter",
    "Snowboard": "winter",
    "IceSkate": "winter",
}

# Curated. Auto-picking "hardest sessions" produces a chart covered in noise —
# these are the weeks that actually mean something in the season, and the one
# that has an analysis sheet points at it.
MILESTONES = [
    ("2026-03-21", "Sezonas atklāšana — 100 km", "Season opening — 100 km", None),
    ("2026-04-24", "Nometne Katalonijā", "Training camp in Catalonia", None),
    ("2026-05-17", "Rīgas maratons — 42,6 km", "Riga Marathon — 42.6 km", "2026-05-17-otra-puse-atraka"),
    ("2026-06-07", "Ironman 70.3 Warsaw", "Ironman 70.3 Warsaw", "2026-06-07-pirmais-70-3"),
    ("2026-07-19", "TriKan 70.3", "TriKan 70.3", None),
    (
        "2026-07-25",
        "Tour de VidusZeme — 154 km + brick",
        "Tour de VidusZeme — 154 km + brick",
        "2026-07-25-tour-de-viduszeme",
    ),
    ("2026-08-08", "Kuldīgas pusmaratons — 1:35:06", "Kuldīga half marathon — 1:35:06", "2026-08-08-devindesmit-devini-procenti"),
    ("2026-08-16", "141 km TT + brick", "141 km TT + brick", "2026-08-16-pedejais-lielais-tests"),
]

# Multi-day spans worth marking on the chart as a range, not a single point —
# a trip or a camp reads as a run of weeks, not one day. Each is (label_lv,
# label_en, start, end) in ISO dates; resolved to a week-index span below.
HIGHLIGHTS = [
    ("Gruzija — snovošana", "Georgia — snowboarding", "2026-02-27", "2026-03-11"),
    ("Nometne Katalonijā", "Catalonia training camp", "2026-04-18", "2026-04-26"),
]


def monday(d: dt.date) -> dt.date:
    return d - dt.timedelta(days=d.weekday())


def main() -> None:
    rows = []
    for line in SRC.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        date, sport, moving_s, dist_m, act_id, name = line.split("|", 5)
        rows.append((dt.date.fromisoformat(date), sport, int(moving_s), int(dist_m), name))
    if not rows:
        raise SystemExit("no activities parsed")
    rows.sort()

    # ---- weekly buckets, including the empty weeks ----
    by_week: dict[dt.date, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    by_week_acts: dict[dt.date, list[dict]] = defaultdict(list)
    for date, sport, moving_s, _dist, name in rows:
        by_week[monday(date)][SPORT_GROUP.get(sport, "other")] += moving_s / 3600
        by_week_acts[monday(date)].append(
            {
                "date": date.isoformat(),
                "sport": SPORT_GROUP.get(sport, "other"),
                "name": name,
                "min": round(moving_s / 60),
            }
        )

    first, last = monday(rows[0][0]), monday(rows[-1][0])
    weeks = []
    cur = first
    while cur <= last:
        bucket = by_week.get(cur, {})
        acts = sorted(by_week_acts.get(cur, []), key=lambda a: a["date"])
        weeks.append(
            {
                "start": cur.isoformat(),
                "w": f"{cur.isocalendar().week:02d}",
                "h": [round(bucket.get(g, 0.0), 2) for g in GROUPS],
                "activities": acts,
            }
        )
        cur += dt.timedelta(days=7)

    totals = {g: round(sum(w["h"][i] for w in weeks), 1) for i, g in enumerate(GROUPS)}
    grand = round(sum(totals.values()), 1)
    peak = round(max(sum(w["h"]) for w in weeks), 2)

    week_of = {w["start"]: i for i, w in enumerate(weeks)}
    milestones = []
    for date, lv, en, slug in MILESTONES:
        d = dt.date.fromisoformat(date)
        idx = week_of.get(monday(d).isoformat())
        if idx is None:
            raise SystemExit(f"milestone {date} falls outside the exported range")
        milestones.append({"date": date, "i": idx, "lv": lv, "en": en, "sheet": slug})

    highlights = []
    for lv, en, start, end in HIGHLIGHTS:
        i_from = week_of.get(monday(dt.date.fromisoformat(start)).isoformat())
        i_to = week_of.get(monday(dt.date.fromisoformat(end)).isoformat())
        if i_from is None or i_to is None:
            raise SystemExit(f"highlight {lv} falls outside the exported range")
        highlights.append({"lv": lv, "en": en, "from": i_from, "to": i_to})

    def ts(v) -> str:
        if isinstance(v, str):
            return '"' + v.replace('"', '\\"') + '"'
        if v is None:
            return "null"
        if isinstance(v, list):
            return "[" + ", ".join(ts(x) for x in v) + "]"
        return repr(v)

    lines = [
        "// GENERATED by scripts/gen_training_year.py — do not edit by hand.",
        "// Source: scripts/data/strava-year.txt (Strava export).",
        "// Volume is hours of moving time. No coordinates are published.",
        "",
        'export const GROUPS = ["swim", "bike", "run", "winter", "other"] as const;',
        "export type Group = (typeof GROUPS)[number];",
        "",
        "export interface WeekActivity {",
        "  date: string;",
        "  sport: Group | string;",
        "  name: string;",
        "  /** Moving time, minutes. */",
        "  min: number;",
        "}",
        "",
        "export interface TrainingWeek {",
        "  /** Monday of the week, ISO date. */",
        "  start: string;",
        "  /** ISO week number, zero-padded. */",
        "  w: string;",
        "  /** Hours per group, in GROUPS order. */",
        "  h: number[];",
        "  /** Every activity that week, earliest first. */",
        "  activities: WeekActivity[];",
        "}",
        "",
        "export interface Milestone {",
        "  date: string;",
        "  /** Index into `weeks`. */",
        "  i: number;",
        "  lv: string;",
        "  en: string;",
        "  /** Slug of the analysis sheet, when one exists. */",
        "  sheet: string | null;",
        "}",
        "",
        "export interface Highlight {",
        "  lv: string;",
        "  en: string;",
        "  /** Index into `weeks`, inclusive span. */",
        "  from: number;",
        "  to: number;",
        "}",
        "",
        "export const weeks: TrainingWeek[] = [",
    ]
    for w in weeks:
        acts = ", ".join(
            f'{{ date: {ts(a["date"])}, sport: {ts(a["sport"])}, '
            f'name: {ts(a["name"])}, min: {ts(a["min"])} }}'
            for a in w["activities"]
        )
        lines.append(
            f'  {{ start: {ts(w["start"])}, w: {ts(w["w"])}, h: {ts(w["h"])}, '
            f'activities: [{acts}] }},'
        )
    lines += [
        "];",
        "",
        "export const milestones: Milestone[] = [",
    ]
    for m in milestones:
        lines.append(
            f'  {{ date: {ts(m["date"])}, i: {m["i"]}, lv: {ts(m["lv"])}, '
            f'en: {ts(m["en"])}, sheet: {ts(m["sheet"])} }},'
        )
    lines += [
        "];",
        "",
        "export const highlights: Highlight[] = [",
    ]
    for h in highlights:
        lines.append(
            f'  {{ lv: {ts(h["lv"])}, en: {ts(h["en"])}, from: {ts(h["from"])}, to: {ts(h["to"])} }},'
        )
    lines += [
        "];",
        "",
        "/** Hours per group across the whole season. */",
        "export const totals: Record<Group, number> = {",
    ]
    for g in GROUPS:
        lines.append(f"  {g}: {totals[g]},")
    lines += [
        "};",
        "",
        f"export const totalHours = {grand};",
        f"export const peakWeek = {peak};",
        f"export const activityCount = {len(rows)};",
        "",
    ]

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}")
    print(f"  {len(weeks)} weeks, {len(rows)} activities, {grand} h, peak {peak} h")
    for g in GROUPS:
        print(f"  {g:<7} {totals[g]:>6.1f} h")


if __name__ == "__main__":
    main()
