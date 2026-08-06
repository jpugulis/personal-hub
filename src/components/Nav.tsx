"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LangSwitch from "@/components/LangSwitch";
import { useLang } from "@/components/LangProvider";
import { ui } from "@/lib/i18n";

/**
 * @param sub — true on pages other than the homepage, so the section
 *              anchors resolve back to the root document.
 */
export default function Nav({ sub = false }: { sub?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const { lang } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const base = sub ? "/" : "";

  return (
    <nav className={`site-nav${scrolled ? " scrolled" : ""}`}>
      <div className="mark">
        {sub ? (
          <Link href="/" style={{ display: "inline" }}>
            <b>JP</b>
            {ui.siteName[lang]}
          </Link>
        ) : (
          <>
            <b>JP</b>
            {ui.siteName[lang]}
          </>
        )}
      </div>
      <div className="links">
        <a href={`${base}#saturs`}>{ui.navContents[lang]}</a>
        <a href={`${base}#jaunakais`}>{ui.navLatest[lang]}</a>
        <a href={`${base}#kontakti`}>{ui.navContact[lang]}</a>
        <LangSwitch place="nav" />
      </div>
    </nav>
  );
}
