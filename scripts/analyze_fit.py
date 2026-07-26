#!/usr/bin/env python3
"""
Parse Garmin .FIT files and emit the numbers and charts a training sheet needs.

Generalised from the ad hoc analysis behind sheet 02-01. Everything here comes
from the raw file rather than a platform summary, because the two things Strava
and Garmin Connect will not tell you are (a) how long each individual stop was
and (b) what the mean-maximal power curve looks like inside a long ride.

Usage
-----
    pip install fitdecode numpy matplotlib
    python scripts/analyze_fit.py ride.FIT run.FIT --date 2026-08-09 --ftp 259

Writes charts to public/triatlons/<date>/charts/ and prints a metrics block to
stdout, ready to paste into a content file.

Notes
-----
* Chart PNGs keep stable numbered filenames so figure numbers stay consistent
  across sheets; that is why the output folder must be namespaced by date.
* Carbohydrate oxidation is a MODEL, not a measurement — see CARB_* below.
* Sweat loss is not estimated here at all. Weigh yourself before and after and
  the guesswork disappears.
"""

from __future__ import annotations

import argparse
import os
import sys

try:
    import fitdecode
    import numpy as np
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
except ImportError as e:  # pragma: no cover
    sys.exit(f"missing dependency: {e}\n  pip install fitdecode numpy matplotlib")

# --- assumptions, all in one place so they can be argued with -----------------
GROSS_EFFICIENCY = 0.23      # mechanical work -> total energy expenditure
CARB_BASE = 0.42             # carb fraction of fuel at zero intensity
CARB_SLOPE = 0.42            # additional carb fraction per unit IF
CARB_KJ_PER_G = 17.0
NP_WINDOW = 30               # seconds, for normalised power

PALETTE = {
    "power": "#2E6F9E", "hr": "#C0392B", "good": "#27AE60",
    "warn": "#E67E22", "grey": "#7F8C8D", "accent": "#8E44AD",
}

plt.rcParams.update({
    "figure.dpi": 150, "font.size": 10, "axes.grid": True, "grid.alpha": 0.25,
    "axes.spines.top": False, "axes.spines.right": False,
})


# --- parsing -----------------------------------------------------------------

def read_fit(path: str) -> dict:
    """Pull records, laps, sessions and timer events out of a .FIT file."""
    out = {"records": [], "laps": [], "sessions": [], "events": []}
    key = {"record": "records", "lap": "laps", "session": "sessions", "event": "events"}
    with fitdecode.FitReader(path) as fit:
        for frame in fit:
            if frame.frame_type != fitdecode.FIT_FRAME_DATA:
                continue
            bucket = key.get(frame.name)
            if bucket:
                out[bucket].append({f.name: f.value for f in frame.fields})
    return out


def series(records: list[dict], field: str) -> np.ndarray:
    return np.array(
        [r.get(field) if r.get(field) is not None else np.nan for r in records],
        dtype=float,
    )


def stops(events: list[dict], tz_offset_h: int = 3) -> list[tuple[str, float]]:
    """
    Reconstruct individual pauses from timer stop/start pairs.

    This is the bit no platform exposes. tz_offset_h converts the UTC
    timestamps in the file to local time for display (Latvia summer = +3).
    """
    import datetime as dt

    result, pending = [], None
    for e in (x for x in events if x.get("event") == "timer"):
        t, kind = e["timestamp"], e.get("event_type")
        if kind in ("stop", "stop_all"):
            pending = t
        elif kind == "start" and pending is not None:
            local = pending + dt.timedelta(hours=tz_offset_h)
            result.append((local.strftime("%H:%M:%S"), (t - pending).total_seconds() / 60))
            pending = None
    return result


def normalised_power(power: np.ndarray) -> float:
    if len(power) < NP_WINDOW:
        return float("nan")
    rolled = np.convolve(np.nan_to_num(power), np.ones(NP_WINDOW), "valid") / NP_WINDOW
    return float((np.mean(rolled**4)) ** 0.25)


def mean_max(power: np.ndarray, durations: list[int]) -> dict[int, float]:
    pn = np.nan_to_num(power)
    out = {}
    for d in durations:
        if len(pn) >= d:
            out[d] = float(np.convolve(pn, np.ones(d), "valid").max() / d)
    return out


def decoupling(power: np.ndarray, hr: np.ndarray) -> dict:
    """First-half vs second-half power:HR efficiency. Above 5% is worth noting."""
    half = len(power) // 2
    ef = []
    for sl in (slice(0, half), slice(half, None)):
        p, h = np.nanmean(power[sl]), np.nanmean(hr[sl])
        ef.append(p / h if h else float("nan"))
    drift = (ef[1] - ef[0]) / ef[0] * 100 if ef[0] else float("nan")
    return {"first": ef[0], "second": ef[1], "drift_pct": drift}


def carb_oxidised_g(power: np.ndarray, ftp: int) -> float:
    """Modelled, not measured. Intensity-scaled carb fraction of total energy."""
    p = np.nan_to_num(power)
    frac = np.clip(CARB_BASE + CARB_SLOPE * np.clip(p / ftp, 0, 1.4), 0.35, 0.88)
    return float(np.sum((p / GROSS_EFFICIENCY) * frac / (CARB_KJ_PER_G * 1000)))


# --- charts ------------------------------------------------------------------

def chart_power_hr(recs, outdir, ftp):
    d = series(recs, "distance") / 1000
    p, hr = series(recs, "power"), series(recs, "heart_rate")

    def smooth(a, w=30):
        a = np.nan_to_num(a, nan=float(np.nanmean(a)))
        return np.convolve(a, np.ones(w) / w, "same")

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(d, smooth(p), color=PALETTE["power"], lw=0.9, label="Power (30 s)")
    ax.axhline(ftp, color=PALETTE["accent"], ls="--", lw=1, label=f"FTP {ftp} W")
    ax2 = ax.twinx()
    ax2.plot(d, smooth(hr), color=PALETTE["hr"], lw=0.9, alpha=0.8, label="HR")
    ax2.set_ylabel("HR (bpm)", color=PALETTE["hr"])
    ax2.grid(False)
    ax.set_xlabel("Distance (km)")
    ax.set_ylabel("Power (W)")
    h1, l1 = ax.get_legend_handles_labels()
    h2, l2 = ax2.get_legend_handles_labels()
    ax.legend(h1 + h2, l1 + l2, loc="upper right", fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, "01_bike_power_hr.png"), bbox_inches="tight")
    plt.close(fig)


def chart_power_curve(recs, outdir, ftp):
    durations = [5, 15, 30, 60, 120, 300, 600, 1200, 1800, 3600, 7200, 10800]
    mm = mean_max(series(recs, "power"), durations)
    xs, ys = list(mm.keys()), list(mm.values())

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.semilogx(xs, ys, "o-", color=PALETTE["power"], lw=2, ms=6)
    ax.axhline(ftp, color=PALETTE["accent"], ls="--", lw=1.2, label=f"FTP {ftp} W")
    ax.set_xticks([5, 15, 30, 60, 300, 1200, 3600, 10800])
    ax.set_xticklabels(["5s", "15s", "30s", "1min", "5min", "20min", "1h", "3h"])
    ax.set_ylabel("Power (W)")
    ax.legend(fontsize=9)
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, "02_power_curve.png"), bbox_inches="tight")
    plt.close(fig)


# --- report ------------------------------------------------------------------

def report(path: str, ftp: int, outdir: str) -> None:
    data = read_fit(path)
    recs, sess = data["records"], (data["sessions"] or [{}])[0]
    sport = sess.get("sport", "unknown")
    power, hr = series(recs, "power"), series(recs, "heart_rate")

    elapsed = sess.get("total_elapsed_time", 0) or 0
    moving = sess.get("total_timer_time", 0) or 0

    print(f"\n{'=' * 68}\n{os.path.basename(path)}  —  {sport}\n{'=' * 68}")
    print(f"  distance      {(sess.get('total_distance') or 0) / 1000:.2f} km")
    print(f"  moving        {moving / 3600:.4f} h  ({moving / 60:.1f} min)")
    print(f"  elapsed       {elapsed / 3600:.4f} h")
    print(f"  stopped       {(elapsed - moving) / 60:.1f} min")
    print(f"  avg / max HR  {sess.get('avg_heart_rate')} / {sess.get('max_heart_rate')}")
    print(f"  ascent        {sess.get('total_ascent')} m")
    print(f"  temp          {sess.get('min_temperature')} -> {sess.get('max_temperature')} C")

    lrb = sess.get("left_right_balance")
    if isinstance(lrb, int):
        print(f"  L/R balance   {(lrb & 0x3FFF) / 100:.2f}% left")

    if not np.all(np.isnan(power)):
        npw = normalised_power(power)
        print(f"  avg power     {np.nanmean(power):.0f} W")
        print(f"  NP            {npw:.0f} W   (IF {npw / ftp:.2f})")
        print(f"  work          {(sess.get('total_work') or 0) / 1000:.0f} kJ")
        print(f"  carb oxidised ~{carb_oxidised_g(power, ftp):.0f} g   [modelled]")
        print("\n  mean-maximal power:")
        for d, w in mean_max(power, [5, 30, 60, 300, 1200, 1800, 3600]).items():
            label = f"{d}s" if d < 60 else f"{d // 60}min"
            print(f"    {label:>7}  {w:6.0f} W   {w / ftp * 100:5.1f}% FTP")

        if not np.all(np.isnan(hr)):
            dec = decoupling(power, hr)
            flag = "  <-- above 5%" if abs(dec["drift_pct"]) > 5 else ""
            print(f"\n  decoupling    {dec['first']:.3f} -> {dec['second']:.3f}"
                  f"  = {dec['drift_pct']:+.1f}%{flag}")

    pauses = stops(data["events"])
    if pauses:
        total = sum(m for _, m in pauses)
        print(f"\n  stops ({len(pauses)}, {total:.1f} min total):")
        for t, m in pauses:
            mark = "  *" if m >= 5 else ""
            print(f"    {t}   {m:5.1f} min{mark}")

    laps = data["laps"]
    if len(laps) > 1:
        print(f"\n  laps ({len(laps)}):")
        for i, lap in enumerate(laps, 1):
            dist = (lap.get("total_distance") or 0) / 1000
            tm = lap.get("total_timer_time") or 0
            pace = f"{int(tm / dist // 60)}:{int(tm / dist % 60):02d}/km" if dist > 0.1 else "-"
            print(f"    {i:>3}  {dist:5.2f} km  {tm / 60:6.2f} min  {pace:>9}"
                  f"  HR {lap.get('avg_heart_rate') or '-'}")

    if sport == "cycling" and not np.all(np.isnan(power)):
        os.makedirs(outdir, exist_ok=True)
        chart_power_hr(recs, outdir, ftp)
        chart_power_curve(recs, outdir, ftp)
        print(f"\n  charts -> {outdir}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="+", help=".FIT files")
    ap.add_argument("--date", required=True, help="sheet date, YYYY-MM-DD")
    ap.add_argument("--ftp", type=int, default=259)
    ap.add_argument("--outdir", default=None, help="override chart output dir")
    args = ap.parse_args()

    outdir = args.outdir or os.path.join("public", "triatlons", args.date, "charts")
    for f in args.files:
        report(f, args.ftp, outdir)
    print(f"\nNext: write content/triatlons/{args.date}-<slug>.md "
          f"(see content/README.md)\n")


if __name__ == "__main__":
    main()
