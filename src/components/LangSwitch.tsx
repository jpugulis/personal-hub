"use client";

import { useLang } from "@/components/LangProvider";
import { ui } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const OPTIONS: { code: Lang; label: string; full: string }[] = [
  { code: "lv", label: "LV", full: "Latviski" },
  { code: "en", label: "EN", full: "English" },
];

/**
 * LV | EN switch, styled as a map legend key.
 * @param place — "nav" sits in the fixed header, "foot" in the colophon.
 */
export default function LangSwitch({ place = "nav" }: { place?: "nav" | "foot" }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={`lang-switch lang-switch--${place}`}
      role="group"
      aria-label={ui.langLabel[lang]}
    >
      {OPTIONS.map((o, i) => (
        <span key={o.code}>
          {i > 0 && <span className="lang-sep" aria-hidden="true" />}
          <button
            type="button"
            className={`lang-opt${o.code === lang ? " is-on" : ""}`}
            aria-current={o.code === lang ? "true" : undefined}
            lang={o.code}
            title={o.full}
            onClick={() => setLang(o.code)}
          >
            {o.label}
          </button>
        </span>
      ))}
    </div>
  );
}
