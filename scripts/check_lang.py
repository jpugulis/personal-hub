#!/usr/bin/env python3
"""
Guard against the two things that went wrong in v1.2:

  1. a single string carrying both Latvian and English
     ("Viena dzīve · daudzas teritorijas — one life, many territories")
  2. a territory that has copy in one language only

Run from the repo root:  python3 scripts/check_lang.py
"""
import json
import pathlib
import re
import sys

LV_MARKS = set("āčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ")

EN_WORDS = {
    "the", "and", "many", "one", "life", "contents", "open", "routes",
    "latest", "territories", "training", "racing", "data", "mountains",
    "expeditions", "cultures", "photography", "logbook", "service", "close",
    "territory", "adventures", "community", "chess", "hockey", "volleyball",
    "workshop", "infrastructure", "automation", "website", "websites",
    "sheets", "goal", "race", "remaining", "analyses", "published",
    "sources", "report", "walks", "riding", "instruction", "equipment",
    "maintenance", "wax", "edges", "repair", "page", "season", "club",
    "experiments", "endurance", "road", "until", "start",
}

# Proper nouns and brand terms that are legitimately identical in both
# editions — including "sajūtu inženieri", which stays untranslated by choice.
ALLOW = {
    "strava", "gpx", "ai", "podersdorf", "kolka", "dubulti", "7nieks",
    "novuss", "ironman", "brick", "archivo", "ibm", "plex", "mono",
    "pugulis", "jānis", "pūgulis", "atlants", "atlas", "sajūtu",
    "inženieri", "baltais", "kalns", "rajons", "km", "tour", "kurzeme",
    "day", "evening", "afternoon", "ride", "run", "trail", "jptravel",
    "cycling", "jpsnowboard", "skr", "baltaiskalns", "com", "lv", "app",
    "vercel", "garmin", "whoop", "fit",
}

FILES = [
    "src/lib/i18n.ts",
    "src/data/stravaRoutes.ts",
    "src/components/TriatlonsIndex.tsx",
    "src/components/SheetHead.tsx",
]

TERRITORIES = "content/site/territories.json"


def words_of(s: str) -> set[str]:
    return {w.lower() for w in re.findall(r"[A-Za-zĀ-žā-ž]+", s)} - ALLOW


def has_lv_marks(s: str) -> bool:
    """Diacritics outside allow-listed words only."""
    for w in re.findall(r"[A-Za-zĀ-žā-ž]+", s):
        if w.lower() in ALLOW:
            continue
        if any(c in LV_MARKS for c in w):
            return True
    return False


def main() -> int:
    root = pathlib.Path(__file__).resolve().parent.parent
    problems: list[str] = []

    for rel in FILES:
        src = (root / rel).read_text(encoding="utf-8")
        for m in re.finditer(r'\b(lv|en):\s*"([^"]*)"', src):
            side, text = m.group(1), m.group(2)
            if side == "lv" and words_of(text) & EN_WORDS:
                problems.append(f"{rel}: Latvian string carries English — {text!r}")
            if side == "en" and has_lv_marks(text):
                problems.append(f"{rel}: English string carries Latvian — {text!r}")

    # The territory copy is JSON so it can be edited from /edit; check the
    # data rather than the loader.
    raw = (root / TERRITORIES).read_text(encoding="utf-8")
    data = json.loads(raw)["territories"]

    if len(data) != 8:
        problems.append(f"{TERRITORIES}: {len(data)} territories, expected 8")

    for t in data:
        who = t.get("id", "?")
        for field in ("name", "teaser", "teaserPanel"):
            v = t.get(field) or {}
            if not v.get("lv") or not v.get("en"):
                problems.append(f"{TERRITORIES}: {who}.{field} missing a language")
                continue
            if words_of(v["lv"]) & EN_WORDS:
                problems.append(f"{TERRITORIES}: {who}.{field}.lv carries English — {v['lv']!r}")
            if has_lv_marks(v["en"]):
                problems.append(f"{TERRITORIES}: {who}.{field}.en carries Latvian — {v['en']!r}")
        lines = t.get("datumLines") or {}
        for lang in ("lv", "en"):
            if len(lines.get(lang) or []) != 2:
                problems.append(f"{TERRITORIES}: {who}.datumLines.{lang} must have 2 lines")

    if re.search(r"ziem", raw, re.I):
        problems.append(f"{TERRITORIES}: winter framing still present — check Baltais Kalns")

    if problems:
        print("\n".join(problems))
        return 1

    print("PASS — no mixed-language strings; all 8 territories bilingual")
    return 0


if __name__ == "__main__":
    sys.exit(main())
