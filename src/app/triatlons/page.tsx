import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TriatlonsIndex from "@/components/TriatlonsIndex";
import { getSheets } from "@/lib/sheets";

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

/** Re-render daily so the countdown does not go stale between deploys. */
export const revalidate = 86400;

function daysToRace() {
  const race = new Date("2026-09-06T00:00:00Z");
  return Math.max(0, Math.ceil((race.getTime() - Date.now()) / 86_400_000));
}

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
