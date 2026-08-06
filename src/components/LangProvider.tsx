"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Lang } from "@/lib/types";
import { DEFAULT_LANG, LANG_STORAGE_KEY } from "@/lib/i18n";

/* ------------------------------------------------------------------
   Language lives in a tiny external store rather than in component
   state: the server can only know the default (Latvian), while the
   real answer is in localStorage. useSyncExternalStore lets React
   render the server snapshot and then swap to the client one without
   a cascading effect.
   ------------------------------------------------------------------ */

const listeners = new Set<() => void>();
let cached: Lang | null = null;

function readPreferred(): Lang {
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "lv" || saved === "en") return saved;
  } catch {
    /* storage unavailable — fall through to the browser preference */
  }
  return navigator.language.toLowerCase().startsWith("lv") ? "lv" : "en";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): Lang {
  if (cached === null) cached = readPreferred();
  return cached;
}

function getServerSnapshot(): Lang {
  return DEFAULT_LANG;
}

function writeLang(next: Lang) {
  if (cached === next) return;
  cached = next;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  } catch {
    /* non-fatal — the choice simply will not persist */
  }
  listeners.forEach((l) => l());
}

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<Ctx>({
  lang: DEFAULT_LANG,
  setLang: () => {},
});

export function useLang() {
  return useContext(LangContext);
}

/**
 * The server always renders Latvian, so the markup search engines and
 * no-JS visitors get is the canonical Latvian edition; English is a
 * reader preference applied on the client.
 */
export default function LangProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setLang = useCallback((l: Lang) => writeLang(l), []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
