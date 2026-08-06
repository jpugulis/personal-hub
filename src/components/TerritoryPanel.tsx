"use client";

import { useEffect, useRef } from "react";
import type { Territory } from "@/lib/types";
import { territoryCount } from "@/data/territories";
import { useLang } from "@/components/LangProvider";
import { ui } from "@/lib/i18n";

interface Props {
  territory: Territory | null;
  open: boolean;
  onClose: () => void;
}

export default function TerritoryPanel({ territory, open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { lang } = useLang();

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
  const label = ui.panelTerritory[lang];
  const datum = territory?.datumLines[lang];

  return (
    <div
      className={`panel${open ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label={territory ? `${label} — ${territory.name[lang]}` : label}
      style={{ "--w": territory?.ink } as React.CSSProperties}
    >
      <div className="panel-top">
        <span>
          {label} {territory?.num ?? "—"} / {total}
        </span>
        <button
          ref={closeRef}
          type="button"
          className="panel-close"
          onClick={onClose}
        >
          {ui.panelClose[lang]}
        </button>
      </div>
      <div className="panel-body">
        <div className="stagger panel-num">
          {ui.panelNr[lang]} {territory?.num ?? "—"} — {ui.siteName[lang]}
        </div>
        <div className="stagger panel-name">{territory?.name[lang] ?? "—"}</div>
        <div className="stagger panel-teaser">
          {territory?.teaserPanel[lang] ?? "—"}
        </div>
        <div className="stagger panel-foot">
          <div className="panel-datum">
            {datum?.[0]}
            <br />
            {datum?.[1]}
          </div>
          <span className="panel-cta">{ui.panelSoon[lang]}</span>
        </div>
      </div>
    </div>
  );
}
