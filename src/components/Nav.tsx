"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * @param sub — true on pages other than the homepage, so the section
 *              anchors resolve back to the root document.
 */
export default function Nav({ sub = false }: { sub?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

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
            <b>JP</b>Personīgais Atlants
          </Link>
        ) : (
          <>
            <b>JP</b>Personīgais Atlants
          </>
        )}
      </div>
      <div className="links">
        <a href={`${base}#saturs`}>Saturs</a>
        <a href={`${base}#jaunakais`}>Jaunākais</a>
        <a href={`${base}#kontakti`}>Kontakti</a>
      </div>
    </nav>
  );
}
