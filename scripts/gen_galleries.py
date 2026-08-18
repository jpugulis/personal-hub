#!/usr/bin/env python3
"""
Build the photo galleries on the expedition pages from Bunny storage.

    python3 scripts/bunny_ls.py        # refresh the manifest first
    python3 scripts/gen_galleries.py   # then this

Run it after connecting a pull zone to each cycling storage zone — without
one there is no public URL and this script will tell you so and stop.

How the split works
-------------------
Thumbnails are written into the repo, small and cheap, and the grid loads
those. The full-size photo stays on Bunny and is only fetched when you open
the lightbox. That keeps the repository light without making a gallery of
16 phone photos download 60 MB before it renders.

Videos are skipped. .mov files off plain storage have no adaptive bitrate,
and one of them is 104 MB.

Originals that browsers can't display inline — HEIC is the common case,
straight off an iPhone — are converted to a full-size JPEG and uploaded back
to the same zone as "<name>-full.jpg"; the lightbox links to that instead of
the raw HEIC. Web-safe originals (jpg/png/webp) are linked directly, unchanged.

Existing galleries are left alone unless you pass --force, so the hand-picked
2026 Kurzeme selection is not overwritten by accident.

    python3 scripts/gen_galleries.py --dry-run
    python3 scripts/gen_galleries.py --only 2025-latgale
    python3 scripts/gen_galleries.py --force
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "scripts" / "data" / "bunny-manifest.json"
SITE = ROOT / "sites" / "cycling"

# Bunny storage zone -> expedition page slug
ZONE_TO_PAGE = {
    "cycling-valga-2023": "2023-estonia",
    "cycling-gnp-2024": "2024-gauja",
    "cycling-latgale-2025": "2025-latgale",
    "cycling-kurzeme-2026": "2026-kurzeme",
    "cycling-melnsils-2025": "2025-melnsils",
}

THUMB_PX = 900
THUMB_QUALITY = 78
FULL_PX = 2400
FULL_QUALITY = 88
WEB_SAFE_EXT = {".jpg", ".jpeg", ".png", ".webp"}
PRIMARY_REGIONS = {"", "de", "falkenstein"}


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    f = ROOT / ".env.local"
    if f.exists():
        for line in f.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip("\"'")
    for k in ("BUNNY_API_KEY",):
        if os.environ.get(k):
            env[k] = os.environ[k]
    return env


def zone_passwords(api_key: str) -> dict[str, tuple[str, str]]:
    """zone name -> (password, region). Needed to pull the originals down."""
    req = urllib.request.Request(
        "https://api.bunny.net/storagezone",
        headers={"AccessKey": api_key, "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
    return {z["Name"]: (z.get("Password", ""), z.get("Region", "")) for z in data}


def storage_host(region: str) -> str:
    region = (region or "").strip().lower()
    return "storage.bunnycdn.com" if region in PRIMARY_REGIONS \
        else f"{region}.storage.bunnycdn.com"


def fetch(url: str, key: str) -> bytes:
    req = urllib.request.Request(url, headers={"AccessKey": key})
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read()


def upload(data: bytes, url: str, key: str) -> None:
    req = urllib.request.Request(url, data=data, method="PUT", headers={
        "AccessKey": key,
        "Content-Type": "image/jpeg",
        "Content-Length": str(len(data)),
    })
    with urllib.request.urlopen(req, timeout=120) as r:
        if r.status not in (200, 201):
            raise urllib.error.HTTPError(url, r.status, "unexpected status", None, None)


def make_full_jpeg(raw: bytes) -> bytes:
    """Browser-safe full-size version of an original the browser can't
    render inline (HEIC off an iPhone is the common case)."""
    from PIL import Image, ImageOps
    import io

    with Image.open(io.BytesIO(raw)) as im:
        im = ImageOps.exif_transpose(im)
        im.thumbnail((FULL_PX, FULL_PX), Image.LANCZOS)
        out = io.BytesIO()
        im.convert("RGB").save(out, "JPEG", quality=FULL_QUALITY, optimize=True)
        return out.getvalue()


def make_thumb(raw: bytes, dst: Path) -> str:
    try:
        from PIL import Image, ImageOps
    except ImportError:
        sys.exit("Pillow is needed to build thumbnails:  pip3 install pillow")
    import io

    with Image.open(io.BytesIO(raw)) as im:
        im = ImageOps.exif_transpose(im)          # honour phone rotation
        before = max(im.size)
        im.thumbnail((THUMB_PX, THUMB_PX), Image.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.convert("RGB").save(dst, "JPEG", quality=THUMB_QUALITY, optimize=True)
    return f"{before}px -> {THUMB_PX}px, {dst.stat().st_size / 1024:.0f} KB"


def has_gallery(page: Path) -> bool:
    return 'class="gallery"' in page.read_text(encoding="utf-8")


def close_of_div(src: str, open_at: int) -> int:
    """End offset of the </div> matching the <div> that starts at open_at."""
    i = src.index(">", open_at) + 1
    depth = 1
    while depth:
        nxt_open = src.find("<div", i)
        nxt_close = src.find("</div>", i)
        if nxt_close == -1:
            raise ValueError("unbalanced <div> in page")
        if nxt_open != -1 and nxt_open < nxt_close:
            depth += 1
            i = nxt_open + 4
        else:
            depth -= 1
            i = nxt_close + 6
    return i


def write_gallery(page: Path, items: list[tuple[str, str]], dry: bool) -> str:
    """
    items = [(thumb_src, full_url)]

    The gallery lives inside the same .wrap as the <article>, immediately
    before it — the structure the Kurzeme page already uses. Only the
    <div class="gallery"> block itself is ever replaced; its wrapper and
    everything after it are left alone.
    """
    src = page.read_text(encoding="utf-8")

    rows = "\n".join(
        f'    <button data-full="{full}">'
        f'<img loading="lazy" src="{thumb}" alt=""></button>'
        for thumb, full in items
    )
    block = f'  <div class="gallery">\n{rows}\n  </div>'

    g = src.find('<div class="gallery"')
    if g != -1:
        start = src.rindex("\n", 0, g) + 1        # keep the line's indentation
        out = src[:start] + block + src[close_of_div(src, g):]
    else:
        anchor = src.index("<article>")
        start = src.rindex("\n", 0, anchor) + 1
        out = src[:start] + block + "\n\n" + src[start:]

    if not dry:
        page.write_text(out, encoding="utf-8")
    return f"{len(items)} photos"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true",
                    help="rebuild galleries that already exist")
    ap.add_argument("--only", help="one page slug, e.g. 2025-latgale")
    args = ap.parse_args()

    if not MANIFEST.exists():
        sys.exit("No manifest. Run:  python3 scripts/bunny_ls.py")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    zones = {z["name"]: z for z in manifest["zones"]}

    todo = [(z, p) for z, p in ZONE_TO_PAGE.items()
            if not args.only or p == args.only]
    if not todo:
        sys.exit(f"--only {args.only} matched no expedition.")

    # Check this before touching the network, so a forgotten pull zone is
    # reported instantly rather than as a connection error.
    missing_cdn = [z for z, _ in todo
                   if z in zones and not zones[z].get("cdn")]
    if missing_cdn:
        print("These zones have no pull zone connected, so their files have no")
        print("public URL and cannot be shown on the site:\n")
        for z in missing_cdn:
            print(f"    {z}")
        print("\nBunny dashboard -> Storage -> the zone -> Connected Pull Zones")
        print("-> Add. Then re-run scripts/bunny_ls.py and try this again.")
        sys.exit(1)

    env = load_env()
    api_key = env.get("BUNNY_API_KEY")
    if not api_key:
        sys.exit("BUNNY_API_KEY is not in .env.local — needed to download originals.")
    try:
        creds = zone_passwords(api_key)
    except urllib.error.HTTPError as e:
        sys.exit(f"Bunny API returned HTTP {e.code}. If it is 401, check BUNNY_API_KEY.")
    except urllib.error.URLError as e:
        sys.exit(f"Could not reach the Bunny API: {e.reason}")

    for zone_name, slug in todo:
        zone = zones.get(zone_name)
        page = SITE / slug / "index.html"
        if not zone or not page.exists():
            print(f"skip {slug} — no zone or no page")
            continue
        if has_gallery(page) and not args.force:
            print(f"skip {slug} — already has a gallery (--force to rebuild)")
            continue

        password, region = creds.get(zone_name, ("", ""))
        host = storage_host(region)
        photos = sorted((f for f in zone["files"] if f["kind"] == "photo"),
                        key=lambda f: f["path"])
        print(f"\n{slug}  ({len(photos)} photos from {zone_name})")

        items: list[tuple[str, str]] = []
        for i, f in enumerate(photos, 1):
            thumb_rel = f"/images/{slug}/{i}-t.jpg"
            thumb_abs = SITE / "images" / slug / f"{i}-t.jpg"
            ext = os.path.splitext(f["path"])[1].lower()
            web_safe = ext in WEB_SAFE_EXT
            stem = f["path"][: -len(ext)] if ext else f["path"]
            full_remote = f["path"] if web_safe else f"{stem}-full.jpg"
            full_url = f"https://{zone['cdn']}/{full_remote}"
            if args.dry_run:
                note = "would thumb" if web_safe else "would thumb + convert full to JPEG"
                print(f"    {i:>2}. {note} {f['path']}")
            else:
                try:
                    raw = fetch(f"https://{host}/{zone_name}/{f['path']}", password)
                except urllib.error.HTTPError as e:
                    print(f"    {i:>2}. ! {f['path']} -> HTTP {e.code}")
                    continue
                note = make_thumb(raw, thumb_abs)
                if not web_safe:
                    full_jpeg = make_full_jpeg(raw)
                    upload(full_jpeg, f"https://{host}/{zone_name}/{full_remote}", password)
                    note += f", full -> {full_remote} ({len(full_jpeg) / 1024:.0f} KB)"
                print(f"    {i:>2}. {f['path']} — {note}")
            items.append((thumb_rel, full_url))

        if items:
            print("   ", write_gallery(page, items, args.dry_run),
                  "(dry run)" if args.dry_run else "written")

    print("\nDone. Check the pages, then commit.")


if __name__ == "__main__":
    main()
