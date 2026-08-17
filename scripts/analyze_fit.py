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
    ax.plot(d, smooth(p), color=PALETTE["power"], lw=0.9, label="Jauda (30 s)")
    ax.axhline(ftp, color=PALETTE["accent"], ls="--", lw=1, label=f"FTP {ftp} W")
    ax2 = ax.twinx()
    ax2.plot(d, smooth(hr), color=PALETTE["hr"], lw=0.9, alpha=0.8, label="HR")
    ax2.set_ylabel("HR (sitieni/min)", color=PALETTE["hr"])
    ax2.grid(False)
    ax.set_xlabel("Attālums (km)")
    ax.set_ylabel("Jauda (W)")
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
    ax.set_ylabel("Jauda (W)")
    ax.legend(fontsize=9)
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, "02_power_curve.png"), bbox_inches="tight")
    plt.close(fig)


# HR zones shared across sheets for this athlete — keep in sync with the
# "Atsauces vērtības" block written into each sheet's Method section.
HR_ZONES = [
    ("Z1", 0, 120), ("Z2", 121, 142), ("Z3", 143, 166),
    ("Z4", 167, 189), ("Z5", 190, 999),
]
ZONE_COLOR = [PALETTE["grey"], PALETTE["good"], PALETTE["power"],
              PALETTE["warn"], PALETTE["hr"]]


def chart_zones(sessions: dict, outdir, filename="03_zones.png"):
    """sessions: {label -> heart_rate ndarray}. One grouped bar per label."""
    labels = list(sessions.keys())
    fig, ax = plt.subplots(figsize=(9, 4.5))
    x = np.arange(len(HR_ZONES))
    width = 0.8 / len(labels)
    for i, label in enumerate(labels):
        hr = np.nan_to_num(sessions[label])
        total = max(len(hr), 1)
        pct = [100 * np.sum((hr >= lo) & (hr <= hi)) / total for _, lo, hi in HR_ZONES]
        ax.bar(x + i * width, pct, width, label=label,
               color=[ZONE_COLOR[j] for j in range(len(HR_ZONES))],
               alpha=1.0 if len(labels) == 1 else 0.55 + 0.45 * i / max(1, len(labels) - 1))
    ax.set_xticks(x + width * (len(labels) - 1) / 2)
    ax.set_xticklabels([f"{z} ({lo}-{hi if hi < 999 else '+'})" for z, lo, hi in HR_ZONES])
    ax.set_ylabel("% no laika")
    if len(labels) > 1:
        ax.legend(fontsize=9)
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, filename), bbox_inches="tight")
    plt.close(fig)


def chart_decoupling(recs, outdir, window_s=600, filename="04_decoupling.png"):
    """Rolling power:HR efficiency over the ride, first half vs second half."""
    d = series(recs, "distance") / 1000
    p, hr = np.nan_to_num(series(recs, "power")), np.nan_to_num(series(recs, "heart_rate"))
    if len(p) < window_s * 2:
        return None

    kernel = np.ones(window_s) / window_s
    p_roll = np.convolve(p, kernel, "same")
    hr_roll = np.convolve(hr, kernel, "same")
    ef = np.divide(p_roll, hr_roll, out=np.zeros_like(p_roll), where=hr_roll > 0)

    half = len(ef) // 2
    ef1, ef2 = float(np.mean(ef[window_s:half])), float(np.mean(ef[half:-window_s or None]))
    drift = (ef2 - ef1) / ef1 * 100 if ef1 else float("nan")

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(d, ef, color=PALETTE["power"], lw=1.2)
    ax.axhline(ef1, color=PALETTE["good"], ls="--", lw=1, label=f"1. puse {ef1:.3f}")
    ax.axhline(ef2, color=PALETTE["warn"], ls="--", lw=1, label=f"2. puse {ef2:.3f}")
    ax.axvline(d[half] if half < len(d) else d[-1], color=PALETTE["grey"], ls=":", lw=1)
    ax.set_xlabel("Attālums (km)")
    ax.set_ylabel("Jaudas/HR attiecība (EF)")
    ax.set_title(f"Decoupling: {drift:+.1f}%", fontsize=10, loc="left")
    ax.legend(fontsize=9)
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, filename), bbox_inches="tight")
    plt.close(fig)
    return {"first": ef1, "second": ef2, "drift_pct": drift}


def chart_run_laps(laps: list[dict], outdir, filename="05_run_laps.png"):
    """Per-km pace + HR, mirroring sheet 02-01's run-mechanics figure. A tight
    y-range on pace matters here — these splits are usually a few seconds
    apart, and a zero-baselined bar chart would flatten that into noise."""
    rows = [lap for lap in laps if (lap.get("total_distance") or 0) > 500]
    if not rows:
        return
    kms = list(range(1, len(rows) + 1))
    pace_s = [(lap.get("total_timer_time") or 0) / max((lap.get("total_distance") or 1) / 1000, 0.01)
              for lap in rows]
    hr = [lap.get("avg_heart_rate") or 0 for lap in rows]

    fig, ax = plt.subplots(figsize=(9, 4.5))
    ms = 6 if len(kms) <= 25 else 3.5
    lw = 1.8 if len(kms) <= 25 else 1.3
    ax.plot(kms, pace_s, "o-", color=PALETTE["power"], lw=lw, ms=ms, label="Temps")
    pad = max(4.0, (max(pace_s) - min(pace_s)) * 0.4)
    ax.set_ylim(max(pace_s) + pad, min(pace_s) - pad)  # inverted: faster reads higher
    ax.set_ylabel("Temps (s/km)", color=PALETTE["power"])
    ax.set_xlabel("km")
    # thin ticks on long races — 43 labels crammed into 9" is unreadable
    step = 1 if len(kms) <= 25 else 5
    ax.set_xticks([k for k in kms if k % step == 0 or k == kms[-1]])
    ax2 = ax.twinx()
    ax2.plot(kms, hr, "o-", color=PALETTE["hr"], lw=lw, ms=ms, label="HR")
    ax2.set_ylabel("HR (sitieni/min)", color=PALETTE["hr"])
    ax2.grid(False)
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, filename), bbox_inches="tight")
    plt.close(fig)


def chart_pace_hr(recs, outdir, filename="01_pace_hr.png"):
    """Distance-based pace + HR trace — the running counterpart to
    chart_power_hr, for sheets with no bike leg to anchor a power axis to."""
    d = series(recs, "distance") / 1000
    speed = series(recs, "enhanced_speed")
    hr = series(recs, "heart_rate")
    pace_s = np.where(speed > 0.3, 1000 / np.where(speed > 0.3, speed, np.nan), np.nan)

    def smooth(a, w=30):
        a = np.nan_to_num(a, nan=float(np.nanmean(a[~np.isnan(a)])) if np.any(~np.isnan(a)) else 0)
        return np.convolve(a, np.ones(w) / w, "same")

    fig, ax = plt.subplots(figsize=(12, 6))
    p = smooth(pace_s)
    ax.plot(d, p, color=PALETTE["power"], lw=0.9, label="Temps (30 s)")
    lo, hi = np.percentile(p, [1, 99])
    pad = (hi - lo) * 0.15
    ax.set_ylim(hi + pad, lo - pad)  # inverted: faster reads higher
    ax2 = ax.twinx()
    ax2.plot(d, smooth(hr), color=PALETTE["hr"], lw=0.9, alpha=0.8, label="HR")
    ax2.set_ylabel("HR (sitieni/min)", color=PALETTE["hr"])
    ax2.grid(False)
    ax.set_xlabel("Attālums (km)")
    ax.set_ylabel("Temps (s/km)", color=PALETTE["power"])
    h1, l1 = ax.get_legend_handles_labels()
    h2, l2 = ax2.get_legend_handles_labels()
    ax.legend(h1 + h2, l1 + l2, loc="upper right", fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, filename), bbox_inches="tight")
    plt.close(fig)


def chart_speed_hr(recs, outdir, filename="01_bike_speed_hr.png"):
    """Distance-based speed + HR trace — the no-power-meter counterpart to
    chart_power_hr, for a bike leg recorded without a power meter."""
    d = series(recs, "distance") / 1000
    speed_kmh = series(recs, "enhanced_speed") * 3.6
    hr = series(recs, "heart_rate")

    def smooth(a, w=30):
        a = np.nan_to_num(a, nan=float(np.nanmean(a[~np.isnan(a)])) if np.any(~np.isnan(a)) else 0)
        return np.convolve(a, np.ones(w) / w, "same")

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(d, smooth(speed_kmh), color=PALETTE["power"], lw=0.9, label="Ātrums (30 s)")
    ax2 = ax.twinx()
    ax2.plot(d, smooth(hr), color=PALETTE["hr"], lw=0.9, alpha=0.8, label="HR")
    ax2.set_ylabel("HR (sitieni/min)", color=PALETTE["hr"])
    ax2.grid(False)
    ax.set_xlabel("Attālums (km)")
    ax.set_ylabel("Ātrums (km/h)")
    h1, l1 = ax.get_legend_handles_labels()
    h2, l2 = ax2.get_legend_handles_labels()
    ax.legend(h1 + h2, l1 + l2, loc="upper right", fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, filename), bbox_inches="tight")
    plt.close(fig)


# --- multisport ----------------------------------------------------------

def slice_by_session(records: list[dict], laps: list[dict], sess: dict):
    """A multisport file (triathlon, brick) has one FIT with several `session`
    messages back to back. Split the shared record/lap stream into the window
    for just this leg, by wall-clock timestamp — the only thing that reliably
    separates them."""
    start = sess.get("start_time")
    elapsed = sess.get("total_elapsed_time") or 0
    if start is None:
        return records, laps
    import datetime as dt
    end = start + dt.timedelta(seconds=elapsed)
    recs = [r for r in records if start <= (r.get("timestamp") or start) < end]
    # lap.timestamp is unreliable in this file (constant, equal to the whole
    # activity's start) — lap.start_time is the one that actually varies.
    laps_out = [l for l in laps if start <= (l.get("start_time") or start) < end]

    # record.distance is cumulative from the very start of the multisport
    # file, not this leg — a bike leg starting after a swim+T1 would chart
    # as "2 km to 92 km" instead of "0 to 90". Rebase to leg-relative.
    first_dist = next((r.get("distance") for r in recs if r.get("distance") is not None), None)
    if first_dist:
        recs = [{**r, "distance": (r["distance"] - first_dist) if r.get("distance") is not None else None}
                for r in recs]
    return recs, laps_out


SPORT_LABEL_LV = {
    "swimming": "Peldējums", "cycling": "Velo", "running": "Skrējiens",
    "transition": "Maiņa",
}


def report_multisport(path: str, ftp: int, outdir: str) -> dict:
    """A single .FIT holding several legs back to back (triathlon, brick) —
    Podersdorf in September will produce exactly this shape of file, so this
    is the general case, not a one-off."""
    data = read_fit(path)
    all_sessions = data["sessions"]
    print(f"\n{'=' * 68}\n{os.path.basename(path)}  —  multisport, {len(all_sessions)} legs\n{'=' * 68}")

    by_sport_hr: dict[str, np.ndarray] = {}
    legs = []
    for i, sess in enumerate(all_sessions):
        sport = sess.get("sport", "unknown")
        recs, laps = slice_by_session(data["records"], data["laps"], sess)
        hr = series(recs, "heart_rate")
        elapsed = sess.get("total_elapsed_time", 0) or 0
        moving = sess.get("total_timer_time", 0) or 0
        dist_km = (sess.get("total_distance") or 0) / 1000

        label = SPORT_LABEL_LV.get(sport, sport)
        print(f"\n--- {i + 1}. {label} ({sport}) ---")
        print(f"  start         {sess.get('start_time')}")
        print(f"  distance      {dist_km:.3f} km")
        print(f"  moving        {moving / 60:.2f} min   elapsed {elapsed / 60:.2f} min")
        print(f"  avg / max HR  {sess.get('avg_heart_rate')} / {sess.get('max_heart_rate')}")
        if sess.get("avg_cadence") is not None:
            print(f"  avg cadence   {sess.get('avg_cadence')}")
        if sess.get("total_ascent") is not None:
            print(f"  ascent        {sess.get('total_ascent')} m")
        power = series(recs, "power")
        if not np.all(np.isnan(power)):
            npw = normalised_power(power)
            print(f"  avg / NP power {np.nanmean(power):.0f} / {npw:.0f} W")

        if not np.all(np.isnan(hr)):
            by_sport_hr[label] = hr

        legs.append({"sport": sport, "label": label, "sess": sess, "recs": recs,
                     "laps": laps, "hr": hr, "moving": moving, "elapsed": elapsed,
                     "dist_km": dist_km})

    # charts: one per endurance leg, plus a combined zones chart
    os.makedirs(outdir, exist_ok=True)
    for leg in legs:
        if leg["sport"] == "cycling":
            chart_speed_hr(leg["recs"], outdir)
            print(f"\n  chart -> 01_bike_speed_hr.png")
        elif leg["sport"] == "running":
            chart_pace_hr(leg["recs"], outdir, filename="02_run_pace_hr.png")
            if len(leg["laps"]) > 2:
                chart_run_laps(leg["laps"], outdir, filename="04_run_laps.png")
            print(f"\n  chart -> 02_run_pace_hr.png")

    if by_sport_hr:
        chart_zones(by_sport_hr, outdir, filename="03_zones.png")
        print(f"\n  chart -> 03_zones.png")

    return {"legs": legs}


# --- report ------------------------------------------------------------------

def report(path: str, ftp: int, outdir: str) -> dict:
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
        dec_full = chart_decoupling(recs, outdir)
        if dec_full:
            flag = "  <-- above 5%" if abs(dec_full["drift_pct"]) > 5 else ""
            print(f"\n  decoupling (10 min rolling)  {dec_full['first']:.3f} -> "
                  f"{dec_full['second']:.3f}  = {dec_full['drift_pct']:+.1f}%{flag}")
        print(f"\n  charts -> {outdir}")
    elif sport == "running" and len(laps) > 2:
        os.makedirs(outdir, exist_ok=True)
        chart_pace_hr(recs, outdir)
        chart_run_laps(laps, outdir)
        print(f"\n  charts -> {outdir}")

    return {"sport": sport, "hr": hr, "laps": laps}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="+", help=".FIT files")
    ap.add_argument("--date", required=True, help="sheet date, YYYY-MM-DD")
    ap.add_argument("--ftp", type=int, default=259)
    ap.add_argument("--outdir", default=None, help="override chart output dir")
    args = ap.parse_args()

    outdir = args.outdir or os.path.join("public", "triatlons", args.date, "charts")
    by_sport: dict[str, np.ndarray] = {}
    for f in args.files:
        n_sessions = len(read_fit(f)["sessions"])
        if n_sessions > 1:
            report_multisport(f, args.ftp, outdir)
            continue
        result = report(f, args.ftp, outdir)
        if not np.all(np.isnan(result["hr"])):
            by_sport[result["sport"]] = result["hr"]

    if by_sport:
        os.makedirs(outdir, exist_ok=True)
        label = {"cycling": "Velo", "running": "Skrējiens"}
        chart_zones({label.get(k, k): v for k, v in by_sport.items()}, outdir)
        print(f"\n  zones chart -> {outdir}/03_zones.png")

    print(f"\nNext: write content/triatlons/{args.date}-<slug>.md "
          f"(see content/README.md)\n")


if __name__ == "__main__":
    main()
