"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`site-nav${scrolled ? " scrolled" : ""}`}>
      <div className="mark">
        <b>JP</b>Personīgais Atlants
      </div>
      <div className="links">
        <a href="#saturs">Saturs</a>
        <a href="#jaunakais">Jaunākais</a>
        <a href="#kontakti">Kontakti</a>
      </div>
    </nav>
  );
}
