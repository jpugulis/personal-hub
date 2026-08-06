#!/usr/bin/env python3
"""
Generate the hero GPX traces + topographic contours for pugulis.com.

Input:  scripts/data/strava-polylines.txt — one activity per line,
        id|sport|date|dist_m|moving_s|elev_m|name|encoded_polyline
        (exported from the Strava API; '|' is a legal polyline character,
        so the split is bounded)

Output: src/data/heroTracks.ts   — hero geometry + contour bands
        src/data/stravaRoutes.ts — the three latest route cards

Run from anywhere:  python3 scripts/gen_hero.py
"""
import json
import math
import pathlib
import random

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "data" / "strava-polylines.txt"


# ---------- polyline ----------
def decode(poly):
    pts, idx, lat, lng = [], 0, 0, 0
    while idx < len(poly):
        for target in ("lat", "lng"):
            shift, result = 0, 0
            while True:
                b = ord(poly[idx]) - 63
                idx += 1
                result |= (b & 0x1F) << shift
                shift += 5
                if b < 0x20:
                    break
            d = ~(result >> 1) if result & 1 else (result >> 1)
            if target == "lat":
                lat += d
            else:
                lng += d
        pts.append((lat / 1e5, lng / 1e5))
    return pts


# ---------- geometry ----------
def project(pts):
    """Equirectangular, y down. Keeps real shape at Latvian latitudes."""
    lat0 = sum(p[0] for p in pts) / len(pts)
    k = math.cos(math.radians(lat0))
    return [(p[1] * k, -p[0]) for p in pts]


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    x1, y1 = pts[0]
    x2, y2 = pts[-1]
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy)
    dmax, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        x0, y0 = pts[i]
        d = (
            abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / n
            if n
            else math.hypot(x0 - x1, y0 - y1)
        )
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return rdp(pts[: idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]


def fit(pts, w, h):
    """Scale into a w x h box, preserve aspect, centre."""
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    bw, bh = max(xs) - min(xs), max(ys) - min(ys)
    s = min(w / bw, h / bh) if bw and bh else 1
    ox = (w - bw * s) / 2 - min(xs) * s
    oy = (h - bh * s) / 2 - min(ys) * s
    return [(p[0] * s + ox, p[1] * s + oy) for p in pts], bw * s, bh * s


def to_path(pts):
    d = "M" + f"{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for x, y in pts[1:]:
        d += f"L{x:.1f} {y:.1f}"
    return d


def simplify_to(pts, w, h, target):
    """Binary-search RDP epsilon until roughly `target` points remain."""
    lo, hi = 0.0, max(w, h) / 4
    best = pts
    for _ in range(40):
        mid = (lo + hi) / 2
        r = rdp(pts, mid)
        if len(r) > target:
            lo = mid
        else:
            hi = mid
            best = r
    return best if len(best) >= 8 else pts


# ---------- load ----------
acts = {}
for line in open(SRC, encoding="utf-8"):
    line = line.rstrip("\n")
    if not line:
        continue
    # NB: '|' is a legal polyline character, so bound the split.
    aid, sport, date, dist, mov, elev, name, poly = line.split("|", 7)
    acts[aid] = dict(
        id=aid,
        sport=sport,
        date=date,
        dist=float(dist),
        moving=int(mov),
        elev=int(elev),
        name=name,
        pts=project(decode(poly)),
    )

# ---------- hero layout ----------
# Each track is sized from its OWN aspect ratio rather than forced into a
# uniform box, so a 106 km coastal ride reads as a long band and a 5 km town
# loop reads as a knot — the way they actually look on a map. `size` is the
# long dimension in atlas units; the short side follows from the real shape.
#
# slot: territory id -> (activity id, centre x, centre y, long side)
SLOTS = [
    ("velo", "19560195030", 700, 252, 660),  # 106 km — the sheet's spine
    ("tri", "19598689671", 205, 208, 252),
    ("tech", "19616953309", 1252, 300, 282),
    ("snow", "19564462039", 302, 470, 234),
    ("serviss", "19573629323", 560, 452, 286),
    ("travel", "19551174540", 778, 496, 346),
    ("baltais", "19551174309", 1012, 520, 284),
    ("rajons", "19571532196", 1010, 762, 480),
]

hero = []
for tid, aid, cx, cy, size in SLOTS:
    a = acts[aid]
    xs = [p[0] for p in a["pts"]]
    ys = [p[1] for p in a["pts"]]
    ar = (max(xs) - min(xs)) / (max(ys) - min(ys))
    bw, bh = (size, size / ar) if ar >= 1 else (size * ar, size)
    pts, aw, ah = fit(a["pts"], bw, bh)
    pts = simplify_to(pts, aw, ah, 190)
    pts, aw, ah = fit(pts, bw, bh)
    ox, oy = cx - bw / 2, cy - bh / 2
    pts = [(x + ox, y + oy) for x, y in pts]
    sx, sy = pts[0]
    hero.append(
        dict(
            tid=tid,
            aid=aid,
            d=to_path(pts),
            marker=(round(sx, 1), round(sy, 1)),
            label=(round(sx - 24, 1), round(sy - 9, 1)),
            name=a["name"],
        )
    )

# emit in territory order (01..08) so the draw-in animation counts up
ORDER = ["travel", "tri", "velo", "snow", "serviss", "baltais", "rajons", "tech"]
hero.sort(key=lambda h: ORDER.index(h["tid"]))

# ---------- topographic contours ----------
# Nested closed curves generated from smooth radial noise: reads as elevation
# bands under the GPX traces. Deterministic seed so SSR and client agree.
rnd = random.Random(20260806)

HILLS = [
    (300, 330, 340, 6),
    (760, 180, 330, 5),
    (1230, 400, 360, 6),
    (520, 700, 320, 5),
    (1010, 760, 300, 4),
    (60, 700, 260, 4),
]


def blob(cx, cy, r, harmonics):
    pts = []
    N = 72
    for i in range(N):
        th = 2 * math.pi * i / N
        rr = r * (1 + sum(a * math.sin(k * th + ph) for a, k, ph in harmonics))
        pts.append((cx + rr * math.cos(th), cy + rr * math.sin(th) * 0.62))
    return pts


def closed_path(pts):
    """Catmull-Rom -> cubic bezier, closed."""
    n = len(pts)
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for i in range(n):
        p0 = pts[(i - 1) % n]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += (
            f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} "
            f"{p2[0]:.1f} {p2[1]:.1f}"
        )
    return d + "Z"


contours = []
for cx, cy, r, rings in HILLS:
    harm = [
        (rnd.uniform(0.05, 0.13), rnd.choice([2, 3]), rnd.uniform(0, 6.28)),
        (rnd.uniform(0.03, 0.09), rnd.choice([4, 5]), rnd.uniform(0, 6.28)),
        (rnd.uniform(0.02, 0.05), rnd.choice([6, 7, 8]), rnd.uniform(0, 6.28)),
    ]
    # slight drift of the summit as bands tighten — real contours are not concentric
    dx, dy = rnd.uniform(-0.10, 0.10), rnd.uniform(-0.10, 0.10)
    for j in range(rings):
        k = 1 - j / (rings + 0.6)
        contours.append(
            closed_path(
                blob(cx + dx * r * (1 - k), cy + dy * r * (1 - k), r * k, harm)
            )
        )

# ---------- route cards (3 latest) ----------
CARDS = ["19616953309", "19598689671", "19571532196"]
LV_SPORT = {"Ride": "Velo", "Run": "Skrējiens", "TrailRun": "Taku skrējiens"}
EN_SPORT = {"Ride": "Ride", "Run": "Run", "TrailRun": "Trail run"}
INK = {"19616953309": "#5C7A2E", "19598689671": "#C8401F", "19571532196": "#B0742A"}
# Strava's auto-generated titles are English; give each a Latvian counterpart
# so neither language version of the site carries the other one's words.
NAME_LV = {
    "19616953309": "Vakara brauciens",
    "19598689671": "Pēcpusdienas skrējiens",
    "19571532196": "Tour De Kurzeme [3. diena]",
}
NAME_EN = {
    "19616953309": "Evening Ride",
    "19598689671": "Afternoon Run",
    "19571532196": "Tour De Kurzeme [Day 3]",
}

cards = []
for aid in CARDS:
    a = acts[aid]
    pts, w, h = fit(a["pts"], 400, 400)
    pts = simplify_to(pts, w, h, 220)
    pts, w, h = fit(pts, 400, 400)
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    pts = [(x - min(xs), y - min(ys)) for x, y in pts]
    box = (round(max(x for x, _ in pts), 1), round(max(y for _, y in pts), 1))
    mins = a["moving"] // 60
    cards.append(
        dict(
            id=aid,
            nameLv=NAME_LV[aid],
            nameEn=NAME_EN[aid],
            sport=a["sport"],
            sportLv=LV_SPORT[a["sport"]],
            sportEn=EN_SPORT[a["sport"]],
            dateISO=a["date"],
            dateLv=".".join(reversed(a["date"].split("-"))),
            dateEn=(
                lambda y, m, d: f"{int(d)} "
                + "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()[int(m) - 1]
                + f" {y}"
            )(*a["date"].split("-")),
            distLv=f"{a['dist']/1000:.1f}".replace(".", ","),
            distEn=f"{a['dist']/1000:.1f}",
            time=f"{a['moving']//3600}:{(a['moving']%3600)//60:02d}:{a['moving']%60:02d}",
            elev=a["elev"],
            ink=INK[aid],
            box=box,
            path=to_path(pts),
            start=(round(pts[0][0], 1), round(pts[0][1], 1)),
            end=(round(pts[-1][0], 1), round(pts[-1][1], 1)),
        )
    )

# ---------- emit ----------
OUT = ROOT / "src" / "data"

with open(OUT / "heroTracks.ts", "w", encoding="utf-8") as f:
    f.write(
        "/* AUTO-GENERATED — do not edit by hand.\n"
        " * Hero map geometry: the eight coloured lines are the real GPS traces of\n"
        " * the eight most recent Strava activities, projected equirectangularly so\n"
        " * each keeps its true shape, then fitted into its slot on the 1440x900\n"
        " * atlas sheet. The faint bands underneath are generated topographic\n"
        " * contours. Regenerate with scripts/gen_hero.py.\n"
        " */\n"
        "import type { WorldId } from \"@/lib/types\";\n\n"
        "export interface HeroTrack {\n"
        "  id: WorldId;\n"
        "  /** Strava activity this trace comes from. */\n"
        "  activityId: string;\n"
        "  activityName: string;\n"
        "  d: string;\n"
        "  marker: [number, number];\n"
        "  label: [number, number];\n"
        "}\n\n"
        "export const heroTracks: HeroTrack[] = [\n"
    )
    for h in hero:
        f.write(
            f'  {{\n    id: "{h["tid"]}",\n'
            f'    activityId: "{h["aid"]}",\n'
            f"    activityName: {json.dumps(h['name'], ensure_ascii=False)},\n"
            f'    d: "{h["d"]}",\n'
            f"    marker: [{h['marker'][0]}, {h['marker'][1]}],\n"
            f"    label: [{h['label'][0]}, {h['label'][1]}],\n  }},\n"
        )
    f.write("];\n\n")
    f.write("/** Generated topographic contour bands drawn under the traces. */\n")
    f.write("export const topoContours: string[] = [\n")
    for c in contours:
        f.write(f'  "{c}",\n')
    f.write("];\n")

SYNCED_LV = "06.08.2026"
SYNCED_EN = "6 Aug 2026"

with open(OUT / "stravaRoutes.ts", "w", encoding="utf-8") as f:
    f.write(
        "/* AUTO-GENERATED — do not edit by hand. Regenerate with scripts/gen_hero.py.\n"
        " *\n"
        " * The latest real routes from the Strava archive, reduced to normalized\n"
        " * shapes. Privacy: geometry is scale-normalized and carries NO absolute\n"
        " * coordinates — only the shape of each route is published.\n"
        " */\n"
        'import type { StravaRoute } from "@/lib/types";\n\n'
        "export const stravaRoutes: StravaRoute[] = [\n"
    )
    for c in cards:
        f.write(
            "  {\n"
            f'    id: "{c["id"]}",\n'
            f"    name: {{ lv: {json.dumps(c['nameLv'], ensure_ascii=False)},"
            f" en: {json.dumps(c['nameEn'], ensure_ascii=False)} }},\n"
            f'    sport: "{c["sport"]}",\n'
            f"    sportLabel: {{ lv: {json.dumps(c['sportLv'], ensure_ascii=False)},"
            f" en: {json.dumps(c['sportEn'], ensure_ascii=False)} }},\n"
            f'    dateISO: "{c["dateISO"]}",\n'
            f'    date: {{ lv: "{c["dateLv"]}", en: "{c["dateEn"]}" }},\n'
            f'    distanceKm: {{ lv: "{c["distLv"]}", en: "{c["distEn"]}" }},\n'
            f'    movingTime: "{c["time"]}",\n'
            f"    elevationGain: {c['elev']},\n"
            f'    ink: "{c["ink"]}",\n'
            f"    box: [{c['box'][0]}, {c['box'][1]}],\n"
            f"    start: [{c['start'][0]}, {c['start'][1]}],\n"
            f"    end: [{c['end'][0]}, {c['end'][1]}],\n"
            f'    path: "{c["path"]}",\n'
            "  },\n"
        )
    f.write("];\n\n")
    f.write("/** The most recent activity. */\nexport const latestActivity = stravaRoutes[0];\n\n")
    f.write(
        "/** Date the Strava archive was last synced into this file. */\n"
        f'export const stravaSyncedAt = {{ lv: "{SYNCED_LV}", en: "{SYNCED_EN}" }};\n'
    )

print("hero tracks:", len(hero), "contours:", len(contours))
for h in hero:
    print(" ", h["tid"], h["aid"], len(h["d"]), h["name"])
print("cards:")
for c in cards:
    print(" ", c["id"], c["nameEn"], c["box"], len(c["path"]))
