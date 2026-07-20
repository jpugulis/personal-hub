"use client";

import { useEffect, useRef } from "react";
import type { Territory } from "@/lib/types";
import { territoryCount } from "@/data/territories";

interface Props {
  territory: Territory | null;
  open: boolean;
  onClose: () => void;
}

export default function TerritoryPanel({ territory, open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      /* single focusable element — keep focus inside the dialog */
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const total = String(territoryCount).padStart(2, "0");

  return (
    <div
      className={`panel${open ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label={territory ? `Teritorija — ${territory.name}` : "Teritorija"}
      style={{ "--w": territory?.ink } as React.CSSProperties}
    >
      <div className="panel-top">
        <span>
          Teritorija {territory?.num ?? "—"} / {total}
        </span>
        <button
          ref={closeRef}
          type="button"
          className="panel-close"
          onClick={onClose}
        >
          Aizvērt ✕
        </button>
      </div>
      <div className="panel-body">
        <div className="stagger panel-num">
          Nr. {territory?.num ?? "—"} — Personīgais Atlants
        </div>
        <div className="stagger panel-name">{territory?.name ?? "—"}</div>
        <div className="stagger panel-teaser">
          {territory?.teaserPanel ?? "—"}
        </div>
        <div className="stagger panel-foot">
          <div className="panel-datum">
            {territory?.datumLines[0]}
            <br />
            {territory?.datumLines[1]}
          </div>
          <span className="panel-cta">Teritorija tiek kartēta — drīzumā</span>
        </div>
      </div>
    </div>
  );
}
