#!/usr/bin/env python3
"""
Take raw photos and videos off your phone and turn them into publishable media.

    media-inbox/2026-07-25/*.jpg  *.mp4   ->   photos into the repo,
                                               videos onto Bunny,
                                               markdown printed to paste.

Photos go in the repo because they are small, they version alongside the
analysis, and next/image handles the rest. Videos go to Bunny because git keeps
every version of every binary forever and /public video gets no adaptive
bitrate. Nothing here uploads a photo or commits a video.

Setup (once)
------------
1. Bunny dashboard -> Storage -> your zone -> "FTP & API Access".
   Copy the *password* — that is the storage API key.
2. Bunny dashboard -> Storage -> your zone -> "Connected pull zones".
   If empty, create one. Note its hostname, e.g. endurance-data.b-cdn.net
   Without a pull zone the files exist but are not reachable from the web.
3. Put both in .env.local (already gitignored):

       BUNNY_STORAGE_ZONE=endurance-data
       BUNNY_STORAGE_KEY=xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx
       BUNNY_CDN_HOST=endurance-data.b-cdn.net
       # BUNNY_STORAGE_REGION=      # blank = Falkenstein; "de", "ny", "la"...

Usage
-----
    python scripts/sync_media.py 2026-07-25
    python scripts/sync_media.py 2026-07-25 --dry-run

Optional: `pip install pillow` to downscale photos. Without it they are copied
as-is, which is fine but wastes repo space on 4000px phone photos.
"""

from __future__ import annotations

import argparse
import mimetypes
import os
import shutil
import sys
import urllib.error
import urllib.request
from pathlib import Path

PHOTO_EXT = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
VIDEO_EXT = {".mp4", ".mov", ".webm", ".m4v"}

MAX_PHOTO_PX = 2400   # plenty for full-bleed at 2x; Vercel's own cap is 8192
JPEG_QUALITY = 82

# Videos smaller than this stay in the repo instead of going to Bunny.
# Default 0 = everything goes to Bunny, which keeps one mental model: photos
# live in git, video lives on the CDN. Raise it if you want small clips to
# work without network access in dev.
LOCAL_VIDEO_MB = 0


def load_env(root: Path) -> dict[str, str]:
    """Read .env.local without a dependency. Real env vars win."""
    env: dict[str, str] = {}
    f = root / ".env.local"
    if f.exists():
        for line in f.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip("\"'")
    for k in ("BUNNY_STORAGE_ZONE", "BUNNY_STORAGE_KEY", "BUNNY_CDN_HOST",
              "BUNNY_STORAGE_REGION"):
        if os.environ.get(k):
            env[k] = os.environ[k]
    return env


def slugify(name: str) -> str:
    """WhatsApp Video 2026-07-25 at 11.32.10.mp4 -> whatsapp-video-11-32-10.mp4"""
    stem, ext = os.path.splitext(name)
    table = str.maketrans({
        "ā": "a", "č": "c", "ē": "e", "ģ": "g", "ī": "i", "ķ": "k",
        "ļ": "l", "ņ": "n", "š": "s", "ū": "u", "ž": "z",
    })
    out = stem.lower().translate(table)
    out = "".join(c if c.isalnum() else "-" for c in out)
    while "--" in out:
        out = out.replace("--", "-")
    return out.strip("-") + ext.lower()


def shrink_photo(src: Path, dst: Path, dry: bool) -> str:
    try:
        from PIL import Image, ImageOps
    except ImportError:
        if not dry:
            shutil.copy2(src, dst)
        return "copied (install pillow to downscale)"

    if dry:
        return "would downscale"

    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)          # honour phone rotation
        before = max(im.size)
        if before > MAX_PHOTO_PX:
            im.thumbnail((MAX_PHOTO_PX, MAX_PHOTO_PX), Image.LANCZOS)
        if dst.suffix.lower() in (".jpg", ".jpeg"):
            im.convert("RGB").save(dst, "JPEG", quality=JPEG_QUALITY, optimize=True)
        else:
            im.save(dst)
        return f"{before}px -> {max(im.size)}px"


def bunny_upload(path: Path, remote: str, env: dict[str, str], dry: bool) -> str:
    zone = env.get("BUNNY_STORAGE_ZONE")
    key = env.get("BUNNY_STORAGE_KEY")
    if not zone or not key:
        return "SKIPPED — BUNNY_STORAGE_ZONE / BUNNY_STORAGE_KEY not set"

    region = env.get("BUNNY_STORAGE_REGION", "").strip()
    host = f"{region}.storage.bunnycdn.com" if region else "storage.bunnycdn.com"
    url = f"https://{host}/{zone}/{remote}"

    if dry:
        return f"would PUT -> {url}"

    data = path.read_bytes()
    ctype = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    req = urllib.request.Request(url, data=data, method="PUT", headers={
        "AccessKey": key,
        "Content-Type": ctype,
        "Content-Length": str(len(data)),
    })
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            if r.status in (200, 201):
                return f"uploaded {len(data) / 1e6:.2f} MB"
            return f"unexpected status {r.status}"
    except urllib.error.HTTPError as e:
        hint = " (wrong storage key?)" if e.code == 401 else ""
        return f"FAILED {e.code}{hint}"
    except urllib.error.URLError as e:
        return f"FAILED — {e.reason}"


def main() -> None:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("date", help="sheet date, YYYY-MM-DD — also the inbox folder")
    ap.add_argument("--dry-run", action="store_true", help="report, change nothing")
    args = ap.parse_args()

    root = Path(__file__).resolve().parent.parent
    inbox = root / "media-inbox" / args.date
    if not inbox.is_dir():
        sys.exit(f"no such folder: {inbox.relative_to(root)}\n"
                 f"  mkdir -p media-inbox/{args.date}   then drop files in it")

    env = load_env(root)
    cdn = env.get("BUNNY_CDN_HOST", "").rstrip("/")
    photo_dir = root / "public" / "triatlons" / args.date / "photos"
    if not args.dry_run:
        photo_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(p for p in inbox.iterdir() if p.is_file() and not p.name.startswith("."))
    if not files:
        sys.exit(f"{inbox.relative_to(root)} is empty")

    photos: list[str] = []
    videos: list[tuple[str, str, bool]] = []   # (url_or_path, caption, is_local)

    print(f"\n{'DRY RUN — ' if args.dry_run else ''}{len(files)} file(s) "
          f"in media-inbox/{args.date}\n{'-' * 64}")

    for f in files:
        ext = f.suffix.lower()
        name = slugify(f.name)
        size_mb = f.stat().st_size / 1e6

        if ext in PHOTO_EXT:
            if ext == ".heic":
                print(f"  {f.name}\n    SKIPPED — convert HEIC to JPEG first "
                      f"(Preview: File > Export)")
                continue
            note = shrink_photo(f, photo_dir / name, args.dry_run)
            print(f"  {f.name}\n    photo -> photos/{name}  [{note}]")
            photos.append(f"photos/{name}")

        elif ext in VIDEO_EXT:
            if size_mb < LOCAL_VIDEO_MB:
                if not args.dry_run:
                    shutil.copy2(f, photo_dir / name)
                print(f"  {f.name}\n    video {size_mb:.2f} MB -> repo "
                      f"(under {LOCAL_VIDEO_MB} MB, Bunny not worth it)")
                videos.append((f"photos/{name}", "", True))
            else:
                remote = f"triatlons/{args.date}/{name}"
                status = bunny_upload(f, remote, env, args.dry_run)
                print(f"  {f.name}\n    video {size_mb:.2f} MB -> Bunny  [{status}]")
                url = f"https://{cdn}/{remote}" if cdn else f"BUNNY_CDN_HOST-not-set/{remote}"
                videos.append((url, "", False))
        else:
            print(f"  {f.name}\n    ignored (unknown type)")

    # ---- ready-to-paste markdown -------------------------------------------
    print(f"\n{'=' * 64}\nPaste into content/triatlons/{args.date}-<slug>.md\n{'=' * 64}\n")

    if photos:
        if len(photos) == 1:
            print("```figure")
            print(f"src: {photos[0]}")
            print("alt: ")
            print("caption: ")
            print("```\n")
        else:
            print("```gallery")
            for p in photos:
                print(f"{p} | ")
            print("```\n")

    for url, _, is_local in videos:
        print("```video")
        print(f"src: {url}" if not is_local else f"id: {url}")
        print("caption: ")
        print("```\n")

    if videos and not cdn and any(not lo for _, _, lo in videos):
        print("!! BUNNY_CDN_HOST is not set, so the URLs above are placeholders.")
        print("   Bunny -> Storage -> your zone -> Connected pull zones -> hostname\n")

    print("Captions are blank on purpose — write them, they carry the story.\n")


if __name__ == "__main__":
    main()
