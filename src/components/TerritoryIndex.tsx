"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { territories } from "@/data/territories";
import type { Territory } from "@/lib/types";
import TerritoryPanel from "@/components/TerritoryPanel";
import { useLang } from "@/components/LangProvider";
import { ui } from "@/lib/i18n";

export default function TerritoryIndex() {
  const listRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Territory | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const { lang } = useLang();

  /* reveal rows on scroll */
  useEffect(() => {
    const rows = listRef.current?.querySelectorAll<HTMLElement>(".row");
    if (!rows) return;
    if (!("IntersectionObserver" in window)) {
      rows.forEach((r) => r.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    rows.forEach((r) => io.observe(r));
    /* safety net: never leave content hidden (e.g. bots, odd viewports) */
    const failsafe = window.setTimeout(
      () => rows.forEach((r) => r.classList.add("in")),
      3000
    );
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  const openPanel = useCallback((t: Territory, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setActive(t);
    setOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = "";
    triggerRef.current?.focus();
  }, []);

  return (
    <>
      <main className="index" id="saturs" ref={listRef}>
        <div className="section-head">
          <span>{ui.contentsHead[lang]}</span>
          <span className="r">{ui.contentsCount[lang]}</span>
        </div>

        {territories.map((t) => {
          const datum = t.datumLines[lang];
          const inner = (
            <>
              <span className="plate" style={{ "--w": t.ink } as React.CSSProperties} />
              <span className="num">{t.num}</span>
              <span>
                <span className="name">{t.name[lang]}</span>
                <span className="teaser">{t.teaser[lang]}</span>
              </span>
              <span className="datum">
                {datum[0]}
                {t.sample && t.sampleOnLine === 0 && <sup>*</sup>}
                <br />
                {datum[1]}
                {t.sample && t.sampleOnLine === 1 && <sup>*</sup>}
              </span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </>
          );
          const style = { "--w": t.ink } as React.CSSProperties;

          if (t.hrefInternal) {
            return (
              <Link key={t.id} className="row" style={style} href={t.hrefInternal}>
                {inner}
              </Link>
            );
          }

          return t.href ? (
            <a
              key={t.id}
              className="row"
              style={style}
              href={t.href}
              target="_blank"
              rel="noopener"
            >
              {inner}
            </a>
          ) : (
            <button
              key={t.id}
              type="button"
              className="row"
              style={style}
              onClick={(e) => openPanel(t, e.currentTarget)}
            >
              {inner}
            </button>
          );
        })}
      </main>

      <TerritoryPanel territory={active} open={open} onClose={closePanel} />
    </>
  );
}
