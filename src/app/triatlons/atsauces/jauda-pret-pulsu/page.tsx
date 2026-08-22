import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WattsVsBeats from "@/components/WattsVsBeats";

const INK = "#C8401F";

export const metadata: Metadata = {
  title: "Jauda pret pulsu — Personīgais Atlants",
  description:
    "Ko patiesībā parāda jauda, pulss un normalizētā jauda — un kas jāvēro Ironman velo posmā, un kāpēc.",
  openGraph: {
    title: "Jauda pret pulsu",
    description:
      "Garās distances tempa atsauce: jauda, pulss un normalizētā jauda.",
    url: "https://pugulis.com/triatlons/atsauces/jauda-pret-pulsu",
    siteName: "Personīgais Atlants",
    locale: "lv_LV",
    alternateLocale: "en_GB",
    type: "article",
  },
};

export default function WattsVsBeatsPage() {
  return (
    <>
      <Nav sub />
      <article className="art-wrap" style={{ "--w": INK } as React.CSSProperties}>
        <WattsVsBeats />
      </article>
      <Footer />
    </>
  );
}
