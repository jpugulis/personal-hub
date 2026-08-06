#!/usr/bin/env python3
"""
Safety net for scripts/gen_galleries.py.

The gallery writer edits hand-written pages, so before it is allowed near
the real site it has to prove three things: it puts the gallery in the right
place, replacing an existing one touches nothing else on the page, and the
result is still balanced HTML.

    python3 scripts/test_galleries.py
"""

from __future__ import annotations

import importlib.util
import pathlib
import re
import shutil
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "sites" / "cycling"

spec = importlib.util.spec_from_file_location("gg", ROOT / "scripts" / "gen_galleries.py")
gg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gg)

ITEMS = [(f"/images/x/{i}-t.jpg", f"https://x.b-cdn.net/IMG_{i}.jpeg") for i in (1, 2, 3)]

failures = 0


def ok(name: str, passed: bool, detail: str = "") -> None:
    global failures
    if not passed:
        failures += 1
    print(f"{'  ok  ' if passed else 'FAIL  '}{name}{' — ' + detail if detail else ''}")


def balanced(html: str) -> bool:
    VOID = {"br", "img", "hr", "input", "meta", "link", "source", "track", "wbr", "col"}
    stack: list[str] = []
    for m in re.finditer(r"<(/?)([a-zA-Z][\w-]*)\b[^>]*?(/?)>", html):
        closing, name, self_closed = m.groups()
        tag = name.lower()
        if tag in VOID or self_closed:
            continue
        if closing:
            if not stack or stack.pop() != tag:
                return False
        else:
            stack.append(tag)
    return not stack


def body(html: str) -> str:
    return html[html.index("<body"): html.rindex("</body>") + 7]


tmp = pathlib.Path(tempfile.mkdtemp())

# ---- a page with no gallery yet -----------------------------------------
page = tmp / "a.html"
shutil.copy(SITE / "2025-latgale" / "index.html", page)
before = page.read_text(encoding="utf-8")
gg.write_gallery(page, ITEMS, dry=False)
after = page.read_text(encoding="utf-8")

ok("new · gallery inserted", 'class="gallery"' in after)
ok("new · one gallery only", after.count('class="gallery"') == 1)
ok("new · three buttons", after.count("data-full=") == 3)
ok("new · sits before the article", after.index('class="gallery"') < after.index("<article>"))
ok("new · shares the article's wrap",
   after.rindex('<div class="wrap wide">', 0, after.index('class="gallery"'))
   == after.rindex('<div class="wrap wide">', 0, after.index("<article>")))
ok("new · article untouched",
   before[before.index("<article>"):] == after[after.index("<article>"):])
ok("new · head untouched",
   before[:before.index('<div class="wrap wide">')] == after[:after.index('<div class="wrap wide">')])
ok("new · lightbox container still there", '<div class="lb"' in after)
ok("new · balanced", balanced(body(after)))

# ---- a page that already has one, rebuilt with --force -------------------
page2 = tmp / "b.html"
shutil.copy(SITE / "2026-kurzeme" / "index.html", page2)
b0 = page2.read_text(encoding="utf-8")
gg.write_gallery(page2, ITEMS, dry=False)
b1 = page2.read_text(encoding="utf-8")

ok("force · still one gallery", b1.count('class="gallery"') == 1)
ok("force · 12 replaced by 3", b0.count("data-full=") == 12 and b1.count("data-full=") == 3)
ok("force · article untouched",
   b0[b0.index("<article>"):] == b1[b1.index("<article>"):])
ok("force · helmet section survived", "Ķivere" in b1 and 'figure class="shot"' in b1)
ok("force · day table survived", b1.count("<table>") == b0.count("<table>"))
ok("force · stat blocks survived", b1.count('class="stat"') == b0.count('class="stat"'))
ok("force · map and legend survived", '<svg id="map"' in b1 and 'id="legend"' in b1)
ok("force · report links survived", b1.count('class="dl"') == b0.count('class="dl"'))
ok("force · everything before the gallery untouched",
   b0[:b0.index('<div class="gallery"')] == b1[:b1.index('<div class="gallery"')])
ok("force · balanced", balanced(body(b1)))

# ---- rebuilding twice must be stable ------------------------------------
gg.write_gallery(page2, ITEMS, dry=False)
ok("idempotent · second run changes nothing", page2.read_text(encoding="utf-8") == b1)

# ---- dry run must not write ---------------------------------------------
page3 = tmp / "c.html"
shutil.copy(SITE / "2024-gauja" / "index.html", page3)
c0 = page3.read_text(encoding="utf-8")
gg.write_gallery(page3, ITEMS, dry=True)
ok("dry run · file untouched", page3.read_text(encoding="utf-8") == c0)

shutil.rmtree(tmp, ignore_errors=True)
print("\n" + (f"{failures} FAILED" if failures else "gallery writer verified"))
sys.exit(1 if failures else 0)
