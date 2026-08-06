#!/usr/bin/env python3
"""
Inventory everything sitting in Bunny storage and write it to a manifest.

    python3 scripts/bunny_ls.py

Bunny has no MCP connector and its API is not reachable from the sandbox, so
this runs on your machine, where the keys already are, and leaves behind a
committable JSON file describing what is up there. Nothing is uploaded,
moved or deleted — this only reads.

Output
------
    scripts/data/bunny-manifest.json    every zone, every file, public URLs
    a summary printed to the terminal

The manifest holds no secrets: zone names, file paths, sizes, dates and the
public CDN URLs that anyone with the link could reach anyway. Passwords are
used in memory and never written.

Setup
-----
One account-level key unlocks every zone at once. Bunny dashboard ->
Account Settings -> API -> copy the API key, then add to .env.local:

    BUNNY_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

Without it the script falls back to the single zone already configured
there (BUNNY_STORAGE_ZONE + BUNNY_STORAGE_KEY).
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "scripts" / "data" / "bunny-manifest.json"

PHOTO_EXT = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".avif", ".gif"}
VIDEO_EXT = {".mp4", ".mov", ".webm", ".m4v", ".avi"}

# Bunny's primary region has no host prefix; every other region does.
PRIMARY_REGIONS = {"", "de", "falkenstein"}


def load_env() -> dict[str, str]:
    """Read .env.local without a dependency. Real env vars win."""
    env: dict[str, str] = {}
    f = ROOT / ".env.local"
    if f.exists():
        for line in f.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip("\"'")
    for k in ("BUNNY_API_KEY", "BUNNY_STORAGE_ZONE", "BUNNY_STORAGE_KEY",
              "BUNNY_CDN_HOST", "BUNNY_STORAGE_REGION"):
        if os.environ.get(k):
            env[k] = os.environ[k]
    return env


def get_json(url: str, key: str) -> object:
    req = urllib.request.Request(
        url, headers={"AccessKey": key, "Accept": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def storage_host(region: str) -> str:
    region = (region or "").strip().lower()
    return "storage.bunnycdn.com" if region in PRIMARY_REGIONS \
        else f"{region}.storage.bunnycdn.com"


def kind_of(name: str) -> str:
    ext = os.path.splitext(name)[1].lower()
    if ext in PHOTO_EXT:
        return "photo"
    if ext in VIDEO_EXT:
        return "video"
    return "other"


def walk(zone: str, key: str, host: str, cdn: str | None,
         path: str = "") -> list[dict]:
    """Recursively list a storage zone. Bunny returns one directory per call."""
    url = f"https://{host}/{zone}/{path}"
    try:
        entries = get_json(url, key)
    except urllib.error.HTTPError as e:
        print(f"    ! {path or '/'} -> HTTP {e.code}", file=sys.stderr)
        return []
    except urllib.error.URLError as e:
        print(f"    ! {path or '/'} -> {e.reason}", file=sys.stderr)
        return []

    out: list[dict] = []
    for e in entries if isinstance(entries, list) else []:
        name = e.get("ObjectName", "")
        child = f"{path}{name}/" if e.get("IsDirectory") else f"{path}{name}"
        if e.get("IsDirectory"):
            out.extend(walk(zone, key, host, cdn, child))
        else:
            out.append({
                "path": child,
                "kind": kind_of(name),
                "bytes": e.get("Length", 0),
                "changed": (e.get("LastChanged") or "")[:19],
                "url": f"https://{cdn}/{child}" if cdn else None,
            })
    return out


def zones_from_account(api_key: str) -> list[dict]:
    print("Listing storage zones from the account API…")
    data = get_json("https://api.bunny.net/storagezone", api_key)
    zones = []
    for z in data if isinstance(data, list) else []:
        hostnames = [
            h.get("Value")
            for pz in (z.get("PullZones") or [])
            for h in (pz.get("Hostnames") or [])
            if h.get("Value")
        ]
        zones.append({
            "name": z.get("Name"),
            "region": z.get("Region", ""),
            "password": z.get("Password"),
            "cdn": hostnames[0] if hostnames else None,
            "all_hostnames": hostnames,
        })
    return zones


def zones_from_env(env: dict[str, str]) -> list[dict]:
    name = env.get("BUNNY_STORAGE_ZONE")
    key = env.get("BUNNY_STORAGE_KEY")
    if not name or not key:
        sys.exit(
            "No BUNNY_API_KEY, and no BUNNY_STORAGE_ZONE / BUNNY_STORAGE_KEY\n"
            "in .env.local either. See the setup notes at the top of this file."
        )
    print(f"No BUNNY_API_KEY — falling back to the single zone '{name}'.")
    return [{
        "name": name,
        "region": env.get("BUNNY_STORAGE_REGION", ""),
        "password": key,
        "cdn": env.get("BUNNY_CDN_HOST"),
        "all_hostnames": [env["BUNNY_CDN_HOST"]] if env.get("BUNNY_CDN_HOST") else [],
    }]


def human(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.0f} {unit}" if unit == "B" else f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} GB"


def main() -> None:
    env = load_env()
    api_key = env.get("BUNNY_API_KEY")
    zones = zones_from_account(api_key) if api_key else zones_from_env(env)

    manifest = {"zones": []}
    grand_files = 0
    grand_bytes = 0

    for z in sorted(zones, key=lambda x: x["name"] or ""):
        host = storage_host(z["region"])
        print(f"\n{z['name']}  ({z['region'] or 'de'} · {z['cdn'] or 'no pull zone!'})")
        files = walk(z["name"], z["password"], host, z["cdn"])
        files.sort(key=lambda f: f["path"])

        by_kind: dict[str, int] = {}
        total = 0
        for f in files:
            by_kind[f["kind"]] = by_kind.get(f["kind"], 0) + 1
            total += f["bytes"]

        folders = sorted({f["path"].rsplit("/", 1)[0] for f in files if "/" in f["path"]})
        for d in folders[:40]:
            n = sum(1 for f in files if f["path"].startswith(d + "/"))
            print(f"    {d}/  — {n} files")
        if len(folders) > 40:
            print(f"    … and {len(folders) - 40} more folders")
        if not folders and files:
            print(f"    (flat) — {len(files)} files")
        print(f"    {len(files)} files, {human(total)}, {by_kind}")
        if not z["cdn"]:
            print("    ! no pull zone connected — these files have no public URL")

        grand_files += len(files)
        grand_bytes += total
        manifest["zones"].append({
            "name": z["name"],
            "region": z["region"],
            "cdn": z["cdn"],
            "hostnames": z["all_hostnames"],
            "counts": by_kind,
            "bytes": total,
            "folders": folders,
            "files": files,
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
                   encoding="utf-8")
    print(f"\n{len(manifest['zones'])} zones, {grand_files} files, {human(grand_bytes)}")
    print(f"Written to {OUT.relative_to(ROOT)}")
    print("No passwords are in that file — safe to commit.")


if __name__ == "__main__":
    main()
