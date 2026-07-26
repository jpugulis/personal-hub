import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
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
  const left = daysToRace();
  const sheets = getSheets();
  const count = String(sheets.length).padStart(2, "0");

  return (
    <>
      <Nav sub />
      <div className="art-wrap" style={{ "--w": INK } as React.CSSProperties}>
        <div className="art-crumb">
          <span>
            <Link href="/">Atlants</Link> — Teritorija 02
          </span>
          <span className="r">
            Podersdorf · 06.09.2026 · atlikušas {left} dienas
          </span>
        </div>

        <header className="art-head">
          <div className="art-sheetno">02 — Triatlons</div>
          <h1 className="art-title">Ironman ceļš</h1>
          <p className="art-title-en">
            Triathlon — treniņi · sacensības · izturība · dati
          </p>
          <p className="art-lede">
            Šī teritorija tiek kartēta ar reāliem datiem. Katra analīze ir
            veidota no neapstrādātiem Garmin <code>.FIT</code> failiem, nevis no
            platformu kopsavilkumiem — jo tur pazūd tas, kas ir svarīgākais.
          </p>
        </header>

        <div className="art-band">
          <div>
            <div className="k">Mērķis</div>
            <div className="v">226 km</div>
            <div className="s">3,8 · 180 · 42,2</div>
          </div>
          <div>
            <div className="k">Sacensības</div>
            <div className="v">Podersdorf</div>
            <div className="s">Austrija · 06.09.2026</div>
          </div>
          <div>
            <div className="k">Atlicis</div>
            <div className="v">{left} dienas</div>
            <div className="s">līdz startam</div>
          </div>
          <div>
            <div className="k">Analīzes</div>
            <div className="v">{count}</div>
            <div className="s">publicētas loksnes</div>
          </div>
        </div>

        <div className="section-head">
          <span>Analīzes — Sheets</span>
          <span className="r">{count} loksnes</span>
        </div>

        <div className="art-list">
          {sheets.map((s) => (
            <Link key={s.slug} className="art-card" href={`/triatlons/${s.slug}`}>
              <span className="n">{s.sheet}</span>
              <span>
                <h2>{s.titleLv}</h2>
                <span className="sub">{s.subtitleLv}</span>
              </span>
              <span className="meta">
                {s.dateLv}
                <br />
                {s.metaLine}
              </span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>

        <p className="art-soon">
          Nākamās loksnes — sacensību atskaites, garo bricku analīzes un
          noslēguma taperēšanas dati. Datu avots: Garmin · Strava · WHOOP.
        </p>
      </div>
      <Footer />
    </>
  );
}
