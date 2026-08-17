import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TriatlonsIndex from "@/components/TriatlonsIndex";
import { getSheets } from "@/lib/sheets";
import { daysToRace } from "@/lib/race";

const INK = "#C8401F";

export const metadata: Metadata = {
  title: "02 · Triatlons — Personīgais Atlants",
  description:
    "Ironman ceļš — treniņi, sacensības, izturība un dati. Neapstrādātu FIT datu analīzes ceļā uz Ironman Podersdorf 2026.",
  openGraph: {
    title: "02 · Triatlons — Personīgais Atlants",
    description:
      "Ironman ceļš — treniņi, sacensības, izturība un dati. Ceļā uz Podersdorf, 06.09.2026.",
    url: "https://pugulis.com/triatlons",
    siteName: "Personīgais Atlants",
    locale: "lv_LV",
    alternateLocale: "en_GB",
    type: "website",
  },
};

/**
 * Re-render daily. This only fixes the number in the HTML a crawler or a
 * no-JS reader sees — a low-traffic ISR page hands the first visitor after
 * the window the *stale* copy and regenerates behind them, so the countdown
 * is corrected on mount in TriatlonsIndex as well.
 */
export const revalidate = 86400;

export default function TriatlonsPage() {
  const sheets = getSheets().map((s) => ({
    slug: s.slug,
    sheet: s.sheet,
    titleLv: s.titleLv,
    subtitleLv: s.subtitleLv,
    dateLv: s.dateLv,
    metaLine: s.metaLine,
  }));

  return (
    <>
      <Nav sub />
      <div className="art-wrap" style={{ "--w": INK } as React.CSSProperties}>
        <TriatlonsIndex sheets={sheets} left={daysToRace()} />
      </div>
      <Footer />
    </>
  );
}
