"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

const T = {
  atlas: { lv: "Atlants", en: "Atlas" },
  territory: { lv: "02 Triatlons", en: "02 Triathlon" },
  sheetKind: { lv: "Treniņa analīze", en: "Session analysis" },
  lvOnly: {
    lv: "",
    en: "This sheet is published in Latvian.",
  },
} as const;

interface Props {
  sheet: string;
  crumbNote: string;
  titleLv: string;
  subtitleLv: string;
  subtitleEn: string;
  lede: string;
}

/**
 * Breadcrumb + article header. The analyses themselves are written in
 * Latvian, so in the English edition the header is translated and the body
 * is flagged rather than machine-mangled.
 */
export default function SheetHead({
  sheet,
  crumbNote,
  titleLv,
  subtitleLv,
  subtitleEn,
  lede,
}: Props) {
  const { lang } = useLang();

  return (
    <>
      <div className="art-crumb">
        <span>
          <Link href="/">{T.atlas[lang]}</Link> —{" "}
          <Link href="/triatlons">{T.territory[lang]}</Link> — {sheet}
        </span>
        <span className="r">{crumbNote}</span>
      </div>

      <header className="art-head">
        <div className="art-sheetno">
          {sheet} — {T.sheetKind[lang]}
        </div>
        <h1 className="art-title">{titleLv}</h1>
        {(lang === "lv" ? subtitleLv : subtitleEn) && (
          <p className="art-title-en">
            {lang === "lv" ? subtitleLv : subtitleEn}
          </p>
        )}
        {lang === "en" && <p className="art-lang-note">{T.lvOnly.en}</p>}
        {lede && <p className="art-lede">{lede}</p>}
      </header>
    </>
  );
}
