import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const INK = "#C8401F";
const C = "/triatlons/charts";

export const metadata: Metadata = {
  title: "Viena treniņa anatomija — 154 km, brick skrējiens un divi krampji",
  description:
    "154 km ar IF 0.85, 4:50 km no velo un divi krampji — neapstrādātu Garmin FIT datu analīze 43 dienas pirms Ironman Podersdorf.",
  openGraph: {
    title: "Viena treniņa anatomija — 154 km un divi krampji",
    description:
      "Neapstrādātu FIT datu analīze: kāpēc abas kvadricepsa muskuļa galvas sarāva krampī, un ko tas nozīmē Podersdorf.",
    url: "https://pugulis.com/triatlons/2026-07-25-tour-de-viduszeme",
    siteName: "Personīgais Atlants",
    locale: "lv_LV",
    type: "article",
    images: [{ url: `${C}/07_overnight_hrv.png`, width: 1785, height: 765 }],
  },
};

/* ------------------------------------------------------------------ */
/* small presentational helpers                                        */
/* ------------------------------------------------------------------ */

function Fig({
  src,
  alt,
  caption,
  note,
  w = 1800,
  h = 1000,
}: {
  src: string;
  alt: string;
  caption: string;
  note?: string;
  w?: number;
  h?: number;
}) {
  return (
    <figure className="art-fig">
      <Image src={src} alt={alt} width={w} height={h} sizes="100vw" />
      <figcaption>
        <span>{caption}</span>
        {note && <span>{note}</span>}
      </figcaption>
    </figure>
  );
}

function Sec({
  n,
  lv,
  en,
  children,
}: {
  n: string;
  lv: string;
  en: string;
  children: React.ReactNode;
}) {
  return (
    <section className="art-sec">
      <h2>
        <span className="n">
          {n} — {en}
        </span>
        {lv}
      </h2>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* diagrams — hand-authored, atlas palette, no runtime dependency      */
/* ------------------------------------------------------------------ */

function ReflexLoop() {
  return (
    <div className="art-dia">
      <svg viewBox="0 0 900 460" role="img" aria-labelledby="d1t">
        <title id="d1t">
          Kontroles cilpa: muskuļa vārpsta un Golgi cīpslas orgāns pretēji
          iedarbojas uz alfa motoneironu
        </title>
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
            markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#1a1712" />
          </marker>
          <marker id="ahg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
            markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#5c7a2e" />
          </marker>
          <marker id="ahr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
            markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#c8401f" />
          </marker>
        </defs>

        {/* muscle spindle */}
        <rect className="d-box" x="30" y="26" width="252" height="92" />
        <text className="d-t-b" x="46" y="50">
          MUSKUĻA VĀRPSTA
        </text>
        <text className="d-s" x="46" y="68">
          muskuļa iekšpusē, paralēli šķiedrām
        </text>
        <text className="d-s" x="46" y="84">
          mēra: GARUMU / stiepšanos
        </text>
        <text className="d-s" x="46" y="104" fill="#5c7a2e">
          → gāzes pedālis
        </text>

        {/* golgi tendon organ */}
        <rect className="d-box" x="30" y="248" width="252" height="104" />
        <text className="d-t-b" x="46" y="272">
          GOLGI CĪPSLAS ORGĀNS
        </text>
        <text className="d-s" x="46" y="290">
          muskuļa–cīpslas savienojumā, virknē
        </text>
        <text className="d-s" x="46" y="306">
          mēra: SPĒKU / spraigumu
        </text>
        <text className="d-s" x="46" y="326" fill="#c8401f">
          → bremze (autogēnā inhibīcija)
        </text>

        {/* interneuron */}
        <rect className="d-box" x="344" y="266" width="156" height="66" />
        <text className="d-t-b" x="358" y="292">
          INHIBĪCIJAS
        </text>
        <text className="d-t-b" x="358" y="308">
          INTERNEIRONS
        </text>
        <text className="d-s" x="358" y="324">
          muguras smadzenēs
        </text>

        {/* alpha motor neuron */}
        <rect className="d-box-hi" x="572" y="104" width="298" height="112" />
        <text className="d-t-b" x="590" y="132">
          ALFA MOTONEIRONS
        </text>
        <text className="d-s" x="590" y="152">
          gala kopējais ceļš — tā izlādes
        </text>
        <text className="d-s" x="590" y="168">
          frekvence IR kontrakcijas komanda
        </text>
        <text className="d-s" x="590" y="192" fill="#c8401f">
          gāze + bremze → viena izeja
        </text>

        {/* contraction + force */}
        <rect className="d-box" x="572" y="272" width="298" height="46" />
        <text className="d-t" x="590" y="301">
          Muskulis saraujas
        </text>
        <rect className="d-box" x="344" y="386" width="526" height="46" />
        <text className="d-t" x="362" y="415">
          Spēks parādās uz cīpslas — cilpa noslēdzas
        </text>

        {/* wiring */}
        <path className="d-line-ex" markerEnd="url(#ahg)"
          d="M282 72 H 430 V 140 H 566" />
        <text className="d-s" x="300" y="62" fill="#5c7a2e">
          Ia aferents — monosinaptisks, IEROSINA ⊕
        </text>

        <path className="d-line" markerEnd="url(#ah)" d="M282 299 H 338" />
        <text className="d-s" x="288" y="290">
          Ib
        </text>

        <path className="d-line-in" markerEnd="url(#ahr)"
          d="M500 299 H 536 V 186 H 566" />
        <text className="d-s" x="506" y="240" fill="#c8401f">
          NOMĀC ⊖
        </text>

        <path className="d-line" markerEnd="url(#ah)" d="M721 216 V 266" />
        <path className="d-line" markerEnd="url(#ah)" d="M721 318 V 380" />
        <path className="d-dash" markerEnd="url(#ah)"
          d="M344 409 H 156 V 358" />
      </svg>
      <div className="dl">
        Att. A — Divi sensori, viena izeja. Vārpsta ierosina, Golgi orgāns nomāc.
      </div>
    </div>
  );
}

function RunawayDiagram() {
  return (
    <div className="art-dia">
      <svg viewBox="0 0 900 330" role="img" aria-labelledby="d2t">
        <title id="d2t">
          Svaigs muskulis pret nogurušu un saīsinātu muskuli — bremzes zudums
        </title>
        <defs>
          <marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#1a1712" />
          </marker>
        </defs>

        {/* fresh */}
        <rect className="d-box" x="14" y="18" width="392" height="296" />
        <text className="d-t-b" x="34" y="46">
          SVAIGS — līdzsvarā
        </text>

        <text className="d-s" x="34" y="86">
          Ia ierosme
        </text>
        <rect x="130" y="74" width="130" height="14" fill="#5c7a2e" />
        <text className="d-s" x="272" y="86">
          normāla
        </text>

        <text className="d-s" x="34" y="124">
          Ib inhibīcija
        </text>
        <rect x="130" y="112" width="130" height="14" fill="#c8401f" />
        <text className="d-s" x="272" y="124">
          normāla
        </text>

        <path className="d-line" markerEnd="url(#ah2)" d="M210 140 V 176" />
        <rect className="d-box-ok" x="60" y="182" width="300" height="72" />
        <text className="d-t-b" x="80" y="212">
          KONTROLĒTA IZLĀDE
        </text>
        <text className="d-s" x="80" y="234">
          apm. 10–50 Hz · brīvprātīga
        </text>
        <text className="d-s" x="80" y="284">
          Cīpslas spraigums pietiekams, lai
        </text>
        <text className="d-s" x="80" y="300">
          bremze nepārtraukti darbotos.
        </text>

        {/* arrow between */}
        <path className="d-line" markerEnd="url(#ah2)" d="M410 166 H 484" />
        <text className="d-s" x="412" y="140">
          4,5 h · IF 0,85
        </text>
        <text className="d-s" x="412" y="156">
          30 min pie IF 1,02
        </text>
        <text className="d-s" x="412" y="196">
          33 °C · −3 L
        </text>
        <text className="d-s" x="412" y="212">
          8 km skrējiena
        </text>

        {/* fatigued */}
        <rect className="d-box-hi" x="494" y="18" width="392" height="296" />
        <text className="d-t-b" x="514" y="46" fill="#c8401f">
          NOGURIS + SAĪSINĀTS — bez bremzes
        </text>

        <text className="d-s" x="514" y="86">
          Ia ierosme
        </text>
        <rect x="614" y="74" width="196" height="14" fill="#5c7a2e" />
        <text className="d-s" x="820" y="86">
          ↑ augusi
        </text>

        <text className="d-s" x="514" y="124">
          Ib inhibīcija
        </text>
        <rect x="614" y="112" width="26" height="14" fill="#c8401f" />
        <text className="d-s" x="650" y="124" fill="#c8401f">
          ↓ sabrukusi
        </text>

        <path className="d-line" markerEnd="url(#ah2)" d="M694 140 V 176" />
        <rect x="544" y="182" width="300" height="72" fill="#c8401f" />
        <text className="d-t-b" x="564" y="212" fill="#f4efe6">
          NEKONTROLĒTA IZLĀDE
        </text>
        <text className="d-s" x="564" y="234" fill="#f4efe6">
          150+ Hz · patvaļīga, pašuzturoša
        </text>
        <text className="d-s" x="564" y="284">
          Mazāk spēka + saīsināts muskulis
        </text>
        <text className="d-s" x="564" y="300" fill="#c8401f">
          = gandrīz nav Ib signāla → KRAMPIS
        </text>
      </svg>
      <div className="dl">
        Att. B — Gāze uz augšu, bremze nost. Tas ir viss krampja mehānisms.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Article() {
  return (
    <>
      <Nav sub />
      <article className="art-wrap" style={{ "--w": INK } as React.CSSProperties}>
        <div className="art-crumb">
          <span>
            <Link href="/">Atlants</Link> —{" "}
            <Link href="/triatlons">02 Triatlons</Link> — Nr. 02-01
          </span>
          <span className="r">25.07.2026 · 43 dienas pirms Podersdorf</span>
        </div>

        <header className="art-head">
          <div className="art-sheetno">Nr. 02-01 — Treniņa analīze</div>
          <h1 className="art-title">Viena treniņa anatomija</h1>
          <p className="art-title-en">
            154 km, brick skrējiens un divi krampji — Anatomy of a Key Session
          </p>
          <p className="art-lede">
            Trīs dienu logs: diena pirms, pati diena un nakts pēc. Viss zemāk
            nāk no neapstrādātiem Garmin <code>.FIT</code> failiem, Strava,
            WHOOP un Garmin Connect — nevis no platformu kopsavilkumiem, kas
            noslēpj lielāko daļu no tā, kas ir svarīgi.
          </p>
        </header>

        <div className="art-band">
          <div>
            <div className="k">Velo</div>
            <div className="v">154,4 km</div>
            <div className="s">4:32:06 kustībā</div>
          </div>
          <div>
            <div className="k">Normalizētā jauda</div>
            <div className="v">220 W</div>
            <div className="s">IF 0,85 · 3 095 kJ</div>
          </div>
          <div>
            <div className="k">Brick skrējiens</div>
            <div className="v">9,57 km</div>
            <div className="s">51:16 · vid. SF 153</div>
          </div>
          <div>
            <div className="k">Pauzes</div>
            <div className="v">1:28</div>
            <div className="s">13 apstāšanās</div>
          </div>
        </div>

        <div className="art-body">
          {/* ---------------- kopsavilkums ---------------- */}
          <section className="art-sec">
            <h2>
              <span className="n">Kopsavilkums — TL;DR</span>
              Īsumā
            </h2>
            <ul className="art-tldr">
              <li>
                <strong>Tas nebija garais brauciens, tas bija sacensības.</strong>{" "}
                NP 220 W pie IF 0,85 četrarpus stundas, tostarp 30 minūtes pie
                94–102% no FTP. 30 minūšu jauda (243 W) iznāca{" "}
                <em>lielāka</em> nekā 20 minūšu jauda (237 W) — tempu noteica
                grupa, nevis manas kājas.
              </li>
              <li>
                <strong>Motors ir apsteidzis grafiku.</strong> 228 W pilnu stundu
                dziļi 4,5 stundu braucienā. Pēc tam 5:07–5:16/km no velo, sirds
                ritmam nemaz neizejot no 3. zonas.
              </li>
              <li>
                <strong>Kājas atpaliek no motora.</strong> Abpusēji{" "}
                <em>vastus medialis</em> krampji 5. un 9. kilometrā. Nulle
                sekunžu 4. sirdsdarbības zonā — nekas sirds pusē neierobežoja.
                Tas bija tikai un vienīgi muskulārs.
              </li>
              <li>
                <strong>
                  Sākotnēji krampi tika skaidroti galvenokārt ar neiromuskulāru
                  nogurumu. Ar reāliem uztura skaitļiem rokā šis svars bija
                  nepareizs.
                </strong>{" "}
                Šķidruma atjaunošana bija ~45% no zudumiem, nātrija ~27%.
                Hidratācija pārceļas no līdzfaktora uz līdzcēloni.
              </li>
              <li>
                <strong>Nakts HRV līkne ir nedēļas interesantākie dati.</strong>{" "}
                Tā sākās ap 40 ms un kāpa visu nakti līdz ~100 ms, nevis bija
                augsta jau no iemigšanas. Tā izskatās liels, bet veiksmīgi
                uzņemts stimuls.
              </li>
              <li>
                <strong>Kofeīns ir mainīgais, par kuru neviens nerunā.</strong>{" "}
                Ap 440 mg brauciena laikā, ~200 mg no tā aptuveni 90 minūtes
                pirms sliktākā krampja. Kofeīns paaugstina motoneirona
                uzbudināmību — tieši nepareizajā virzienā.
              </li>
            </ul>
          </section>

          {/* ---------------- 1 ---------------- */}
          <Sec n="01" lv="Konteksts" en="The 48-hour setup">
            <h3>Piektdiena, 24. jūlijs — diena pirms</h3>
            <p>
              Atklātā ūdens peldējums 3,34 km, 74:33 — “pilnais aplis”. Vakarā
              vēla un liela maltīte: pasta ar vistu un sieru, dzeltenie tomāti,
              medus kūka, izotoniskais dzēriens.
            </p>
            <p>
              Šī vakariņa ir svarīga divreiz. Tā piepildīja glikogēna krājumus,
              kas pirms 154 km ir labi. Tā bija arī par lielu un par vēlu, kas
              sabojāja nakti.
            </p>

            <h3>Nakts pirms — 6:13 gultā</h3>
            <div className="art-tw">
              <table className="art-t">
                <caption>Garmin · nakts 24.→25.07.2026</caption>
                <tbody>
                  <tr>
                    <th>Gulta / celšanās</th>
                    <td>01:09 → 08:00</td>
                  </tr>
                  <tr className="em">
                    <th>Laiks gultā</th>
                    <td>6:13</td>
                  </tr>
                  <tr>
                    <th>Vid. nakts SF</th>
                    <td>54 sitieni/min</td>
                  </tr>
                  <tr>
                    <th>Miera SF</th>
                    <td>48 sitieni/min</td>
                  </tr>
                  <tr>
                    <th>Nakts HRV</th>
                    <td>70 ms</td>
                  </tr>
                  <tr>
                    <th>Nemierīgi mirkļi</th>
                    <td>48</td>
                  </tr>
                  <tr>
                    <th>Body Battery pieaugums</th>
                    <td>+46</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Divas stundas par maz, un Body Battery uzlādējās tikai +46. Tātad
              154 km sākās no jau kompromitētas bāzes. To ir vērts paturēt prātā
              — tā ir daļa no atbildes, kāpēc muskulārā puse padevās, bet aerobā
              nē.
            </p>

            <h3>Nedēļas slodze</h3>
            <Fig
              src={`${C}/09_weekly_load.png`}
              alt="Nedēļas TSS sadalījums 20.–26. jūlijs"
              caption="Att. 09 — Nedēļas slodze, 20.–26. jūlijs"
              note="Aplēstais TSS"
              w={1485}
              h={645}
            />
            <p>
              <strong>53% no nedēļas slodzes iekrita vienā dienā.</strong> Divas
              pilnas atpūtas dienas plus tikai divas mērenas kvalitātes dienas ir
              tieši tas, kāpēc sestdiena varēja aiziet tik strauji. Tas ir arī
              iemesls, kāpēc slodzes kāpums dienas ietvaros bija tik ass. Sešas
              dienas iepriekš bija pilna 70.3 simulācija (1,79 km / 90 km /
              12,3 km). Tātad: puse Ironman un 154 km grupas brauciens pie
              IF 0,85 septiņu dienu laikā.
            </p>
          </Sec>

          {/* ---------------- 2 ---------------- */}
          <Sec n="02" lv="Velo" en="The bike">
            <p>
              154,4 km · 4:32:06 kustībā · 6:01:05 kopā · NP 220 W · vid. 190 W ·
              IF 0,85 · 3 095 kJ · vid. SF 151 / maks. 188 · 543 m kāpuma ·
              17 → 33 °C · treniņa efekts 4,7 aerobais / 2,9 anaerobais.
            </p>
            <Fig
              src={`${C}/01_bike_power_hr.png`}
              alt="Jauda un sirdsdarbība pa distanci, 154 km brauciens"
              caption="Att. 01 — Jauda un sirdsdarbība pa distanci"
              note="30 s slīdošais vidējais"
              w={1785}
              h={1035}
            />

            <h3>Posmu sadalījums</h3>
            <div className="art-tw">
              <table className="art-t">
                <caption>
                  Aprēķināts no neapstrādātiem ierakstiem · FTP 259 W
                </caption>
                <thead>
                  <tr>
                    <th>Posms</th>
                    <th>min</th>
                    <th>km</th>
                    <th>km/h</th>
                    <th>vid. W</th>
                    <th>NP</th>
                    <th>IF</th>
                    <th>SF</th>
                    <th>kad.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Iesildīšanās Carnikava → Berģi</td>
                    <td>40,6</td>
                    <td>18,4</td>
                    <td>27,1</td>
                    <td>160</td>
                    <td>190</td>
                    <td>0,73</td>
                    <td>131</td>
                    <td>77</td>
                  </tr>
                  <tr>
                    <td>Grupa, svaigi + pavējš</td>
                    <td>23,4</td>
                    <td>13,4</td>
                    <td>34,2</td>
                    <td>182</td>
                    <td>240</td>
                    <td>0,93</td>
                    <td>137</td>
                    <td>83</td>
                  </tr>
                  <tr className="em">
                    <td>Murjāņi — ALL OUT</td>
                    <td>30,0</td>
                    <td>20,8</td>
                    <td>41,6</td>
                    <td>232</td>
                    <td>265</td>
                    <td>1,02</td>
                    <td>165</td>
                    <td>86</td>
                  </tr>
                  <tr>
                    <td>Pēc Murjāņiem</td>
                    <td>57,0</td>
                    <td>36,3</td>
                    <td>38,2</td>
                    <td>202</td>
                    <td>224</td>
                    <td>0,87</td>
                    <td>154</td>
                    <td>80</td>
                  </tr>
                  <tr>
                    <td>Sliktais segums → Limbaži</td>
                    <td>9,4</td>
                    <td>3,9</td>
                    <td>25,1</td>
                    <td>135</td>
                    <td>197</td>
                    <td>0,76</td>
                    <td>132</td>
                    <td className="hi">58</td>
                  </tr>
                  <tr className="em">
                    <td>Limbaži → Saulkrasti (pretvējš)</td>
                    <td>66,8</td>
                    <td>37,1</td>
                    <td>33,4</td>
                    <td>205</td>
                    <td>218</td>
                    <td>0,84</td>
                    <td>163</td>
                    <td>81</td>
                  </tr>
                  <tr>
                    <td>Saulkrasti → Gauja</td>
                    <td>9,2</td>
                    <td>5,4</td>
                    <td>35,2</td>
                    <td>158</td>
                    <td>171</td>
                    <td>0,66</td>
                    <td>142</td>
                    <td>81</td>
                  </tr>
                  <tr>
                    <td>Gauja → mājas, atsildīšanās</td>
                    <td>26,0</td>
                    <td>14,0</td>
                    <td>32,4</td>
                    <td>170</td>
                    <td>186</td>
                    <td>0,72</td>
                    <td>152</td>
                    <td>76</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Pauzes — 1 h 28 min no tām</h3>
            <p>
              Strava parāda, ka pauzes bija, bet ne to, cik gara bija katra. No
              taimera notikumiem <code>.FIT</code> failā:
            </p>
            <div className="art-tw">
              <table className="art-t">
                <caption>
                  Rekonstruēts no <code>timer</code> notikumu pāriem
                </caption>
                <thead>
                  <tr>
                    <th>Laiks</th>
                    <th>Ilgums</th>
                    <th>Kas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>09:07–09:09</td>
                    <td>13,4 min</td>
                    <td>Berģu Depo, tikšanās</td>
                  </tr>
                  <tr>
                    <td>11:12</td>
                    <td>3,1 min</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>11:23</td>
                    <td>0,5 min</td>
                    <td>—</td>
                  </tr>
                  <tr className="em">
                    <td>11:25</td>
                    <td>47,2 min</td>
                    <td>ParkCafe, Limbaži</td>
                  </tr>
                  <tr>
                    <td>13:03</td>
                    <td>0,5 min</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>13:21</td>
                    <td>15,6 min</td>
                    <td>Saulkrasti, saldējums</td>
                  </tr>
                  <tr>
                    <td>13:45</td>
                    <td>7,7 min</td>
                    <td>Saulkrasti, benzīntanks</td>
                  </tr>
                  <tr className="em">
                    <td>Kopā</td>
                    <td>88,3 min</td>
                    <td>13 apstāšanās</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              47 minūšu kafejnīcas pauze nav noapaļošanas kļūda. Ķermeņa
              temperatūra normalizējās, plazmas tilpums daļēji atjaunojās, kājas
              atdzisa un sastinga. Viss pēc Limbažiem faktiski bija otrs
              brauciens, kas sākts uz jau bojātām kājām.
            </p>

            <h3>Jaudas līkne</h3>
            <Fig
              src={`${C}/02_power_curve.png`}
              alt="Vidēji maksimālās jaudas līkne"
              caption="Att. 02 — Vidēji maksimālās jaudas līkne"
              note="% no FTP 259 W"
              w={1335}
              h={735}
            />
            <p>Trīs lasījumi:</p>
            <p>
              <strong>
                1. 30 minūšu jauda pārsniedza 20 minūšu jaudu.
              </strong>{" "}
              Tas notiek tikai tad, ja griestus noteica kāds cits — grupa uzlika
              tempu, un piepūle noturējās pusstundu, sākot no 30. kilometra.
              Kopā ar 228 W pilnu stundu tas nozīmē, ka 259 W FTP ir reāls, nevis
              vēlmju domāšana.
            </p>
            <p>
              <strong>
                2. Murjāņi bija sacensības sliekšņa režīmā gara brauciena vidū.
              </strong>{" "}
              Trīsdesmit minūtes pie IF 1,02, ar 619 W 30 sekundes un 941 W
              5 sekundes, 24.–50. kilometrā — ar vēl 100 km un skrējienu
              priekšā. Aerobi viss kārtībā. Muskulāri — tur tika iesēts krampis.
            </p>
            <p>
              <strong>
                3. Pretvēja stunda bija sacensībām nozīmīgākais fragments visā
                failā.
              </strong>{" "}
              66,8 minūtes, 205 W, SF 163, bez lielas aizsegu palīdzības, ar
              četrām stundām noguruma apakšā. Tas ir tas fizioloģiskais stāvoklis,
              kas Podersdorf būs 130. kilometrā. Un tas noturējās.
            </p>

            <h3>Zonas un atsaiste</h3>
            <Fig
              src={`${C}/03_zones.png`}
              alt="Jaudas un sirdsdarbības zonu sadalījums"
              caption="Att. 03 — Zonu sadalījums, velo un skrējiens"
              w={1785}
              h={660}
            />
            <Fig
              src={`${C}/04_decoupling.png`}
              alt="Jaudas un sirdsdarbības atsaiste brauciena laikā"
              caption="Att. 04 — Aerobā atsaiste (Pw:HR)"
              note="−8,6% pirmā pret otro pusi"
              w={1635}
              h={660}
            />
            <p>
              Jaudas un sirdsdarbības efektivitāte nokrita no 1,312 uz 1,199 —{" "}
              <strong>−8,6% atsaiste</strong>, virs 5% “labi adaptēts” robežas.
              Kadence tajā pašā laikā aizslīdēja no 81 uz 78 apgr./min.
            </p>
            <div className="art-note">
              <div className="lbl">Godīgs iebildums</div>
              <p>
                Šis skaitlis ir sajaukts ar citiem faktoriem. Temperatūra
                pakāpās līdz 33 °C, pirmā puse bija ar pavēju un aizsegā, otrā
                pretvējā. Aizstāvams lasījums ir{" "}
                <em>mērena izturības sprauga, lielā mērā izskaidrojama ar
                karstumu</em> — nevis “nepietiekami trenēts”. Tas ir rādītājs, kas
                jāpārbauda nākamajā garajā braucienā kontrolētā intensitātē, kur
                traucējošo faktoru ir mazāk.
              </p>
            </div>
            <p>
              <strong>Kreisās/labās puses balanss: 50,1 / 49,9.</strong> Ideāli
              vienmērīgi. Nekādas mehāniskas asimetrijas — kas abpusējo krampi
              padara loģiskāku, nevis mazāk loģisku.
            </p>
          </Sec>

          {/* ---------------- 3 ---------------- */}
          <Sec n="03" lv="Brick skrējiens" en="The brick run">
            <p>
              9,57 km · 51:16 kustībā · 1:06:43 kopā · vid. SF 153 · maks. SF 166
              · skriešanas jauda 374 W (NP 408).
            </p>
            <Fig
              src={`${C}/05_run_laps.png`}
              alt="Skrējiena kilometru sadalījums, kontakta laiks un soļa garums"
              caption="Att. 05 — Kilometri, mehānika un krampju momenti"
              note="Sarkanie = krampja ietekmētie km"
              w={1635}
              h={1335}
            />
            <div className="art-tw">
              <table className="art-t">
                <caption>Automātiskie 1 km apļi</caption>
                <thead>
                  <tr>
                    <th>km</th>
                    <th>temps</th>
                    <th>SF</th>
                    <th>kadence</th>
                    <th>kontakts</th>
                    <th>soļa garums</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>5:14</td>
                    <td>145</td>
                    <td>166</td>
                    <td>270 ms</td>
                    <td>1138 mm</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>5:07</td>
                    <td>156</td>
                    <td>166</td>
                    <td>265</td>
                    <td>1169</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>5:08</td>
                    <td>160</td>
                    <td>164</td>
                    <td>266</td>
                    <td>1178</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>5:16</td>
                    <td>161</td>
                    <td>162</td>
                    <td>267</td>
                    <td>1170</td>
                  </tr>
                  <tr className="em">
                    <td>5</td>
                    <td>5:56</td>
                    <td>159</td>
                    <td>156</td>
                    <td>292</td>
                    <td>1061</td>
                  </tr>
                  <tr>
                    <td>6</td>
                    <td>5:27</td>
                    <td>142</td>
                    <td>162</td>
                    <td>270</td>
                    <td>1132</td>
                  </tr>
                  <tr>
                    <td>7</td>
                    <td>5:02</td>
                    <td>154</td>
                    <td>164</td>
                    <td>262</td>
                    <td>1210</td>
                  </tr>
                  <tr className="em">
                    <td>8</td>
                    <td className="hi">4:50</td>
                    <td>157</td>
                    <td>166</td>
                    <td className="hi">255</td>
                    <td className="hi">1238</td>
                  </tr>
                  <tr className="em">
                    <td>9</td>
                    <td>6:07</td>
                    <td>146</td>
                    <td>154</td>
                    <td className="hi">298</td>
                    <td className="hi">1062</td>
                  </tr>
                  <tr>
                    <td>10</td>
                    <td>5:23</td>
                    <td>155</td>
                    <td>162</td>
                    <td>275</td>
                    <td>1162</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Skrējiena apstāšanās</h3>
            <div className="art-tw">
              <table className="art-t">
                <thead>
                  <tr>
                    <th>Laiks</th>
                    <th>Ilgums</th>
                    <th>Kas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>15:06:52</td>
                    <td>5,1 min</td>
                    <td>Pelde jūrā</td>
                  </tr>
                  <tr>
                    <td>15:12:25</td>
                    <td>4,7 min</td>
                    <td>Zeķe + krampis #1, kreisais vastus medialis</td>
                  </tr>
                  <tr>
                    <td>15:23:30</td>
                    <td>1,4 min</td>
                    <td>—</td>
                  </tr>
                  <tr className="em">
                    <td>15:34:55</td>
                    <td>4,0 min</td>
                    <td>Krampis #2, otra kāja — 2 min līdz varēja paiet</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong>
                87,7% no skrējiena bija 3. sirdsdarbības zonā. Nulle sekunžu
                4. zonā.
              </strong>{" "}
              Maksimālā SF bija 166 — divdesmit divi sitieni zem velo maksimuma.
              Sirds un asinsvadu sistēmai šis skrējiens bija viegls. Katrs
              ierobežojums bija muskulārs.
            </p>
            <p>
              Un mehānika stāsta šo stāstu ar neparastu precizitāti. 8. aplī —
              tajā 4:50 kilometrā — kontakta laiks bija 255 ms un soļa garums
              1238 mm: <strong>labākā mehānika visā dienā</strong>. 9. aplī
              kontakta laiks uzsprāga līdz 298 ms un soļa garums sabruka līdz
              1062 mm. Muskulis padevās tieši tajā mirklī, kad skrējiens bija
              vislabākais. Tā nav sagadīšanās — tas ir mehānisma paraksts.
            </p>
          </Sec>

          {/* ---------------- 4 ---------------- */}
          <Sec n="04" lv="Kas patiesībā tika uzņemts" en="Fuelling & hydration">
            <p>
              Šī ir tā sadaļa, kuras trūka pirmajā analīzē, un tā mainīja
              secinājumu.
            </p>
            <Fig
              src={`${C}/06_fuelling.png`}
              alt="Ogļhidrātu bilance un šķidruma un nātrija bilance"
              caption="Att. 06 — Ogļhidrātu, šķidruma un nātrija bilance"
              note="Oksidācija modelēta no mehāniskā darba"
              w={1785}
              h={1185}
            />

            <div className="art-tw">
              <table className="art-t">
                <caption>Uzņemšanas hronoloģija · vietējais laiks</caption>
                <thead>
                  <tr>
                    <th>Laiks</th>
                    <th>Uzņemts</th>
                    <th>Ogļh.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>~07:00</td>
                    <td>Pasta ar vistu (pāri no vakariņām) + 3×3 g kreatīna</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>09:09</td>
                    <td>½ flat white, Berģu Depo</td>
                    <td>~3 g</td>
                  </tr>
                  <tr className="em">
                    <td>~09:50</td>
                    <td>SiS 40 g gēls — Murjāņu piepūles laikā</td>
                    <td>40 g</td>
                  </tr>
                  <tr>
                    <td>~11:10</td>
                    <td>SiS 40 g gēls + elektrolīti</td>
                    <td>40 g</td>
                  </tr>
                  <tr>
                    <td>11:25–12:12</td>
                    <td>
                      Limbaži: sāļā maizīte, kafija, ½ Red Bull, šokolādes kūka
                    </td>
                    <td>~79 g</td>
                  </tr>
                  <tr>
                    <td>~12:45</td>
                    <td>SiS 40 g nootropiskais gēls — pretvējā</td>
                    <td>40 g</td>
                  </tr>
                  <tr>
                    <td>~13:30</td>
                    <td>Saldējuma kokteilis, Saulkrasti</td>
                    <td>~50 g</td>
                  </tr>
                  <tr>
                    <td>~13:50</td>
                    <td>0,5 L Coca-Cola, benzīntanks</td>
                    <td>~53 g</td>
                  </tr>
                  <tr>
                    <td>visu braucienu</td>
                    <td>Sporta dzēriens</td>
                    <td>80 g</td>
                  </tr>
                  <tr className="em">
                    <td>Kopā</td>
                    <td>—</td>
                    <td>~385 g</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Ogļhidrāti: pietiekami kopumā, slikti laikā</h3>
            <p>
              Aplēstā oksidācija brauciena laikā, no 3 095 kJ mehāniskā darba pie
              ~23% bruto efektivitātes ar intensitātei pieskaņotu ogļhidrātu
              daļu: <strong>~610 g</strong>. Uzņemts 385 g. Tas ir{" "}
              <strong>~225 g deficīts tikai velo daļā</strong>, pirms skrējiens
              pielika vēl aptuveni 140 g oksidācijas pret nulli uzņemtā.
            </p>
            <p>
              Kopējie glikogēna krājumi trenētam sportistam ir ~500–600 g. Tātad
              vairāk kā puse aizgāja, sākot no rīta, kurā brokastis bija
              uzsildītas pārpalikumi.
            </p>
            <p>
              Bet kopsumma nav īstā problēma — 385 g pa 4,5 stundām kustībā ir
              86 g/h, kas ir cienījami.{" "}
              <strong>Problēma ir sadalījums:</strong>
            </p>
            <ul>
              <li>
                <strong>
                  Nulle ogļhidrātu pirmajās 63 riteņbraukšanas minūtēs.
                </strong>
              </li>
              <li>
                Pirmais gēls pienāca <em>dienas grūtāko 30 minūšu laikā</em>, nevis
                pirms tām.
              </li>
              <li>
                Aptuveni 40% no dienas uzņemtā tika apēsts sēžot uz vietas
                pieturās, kur strādājošajam muskulim no tā ir vismazākais
                labums.
              </li>
            </ul>

            <h3>Šķidrums un nātrijs — skaitlis, kas mainīja secinājumu</h3>
            <div className="art-tw">
              <table className="art-t">
                <caption>
                  Zudumi aplēsti: 1,25–1,5 L/h pie 17–33 °C, sviedru nātrijs
                  ~900 mg/L
                </caption>
                <thead>
                  <tr>
                    <th></th>
                    <th>Uzņemts</th>
                    <th>Aplēstais zudums</th>
                    <th>Atjaunots</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="em">
                    <td>Šķidrums</td>
                    <td>~2,8 L</td>
                    <td>5,6–6,75 L</td>
                    <td className="hi">~45%</td>
                  </tr>
                  <tr className="em">
                    <td>Nātrijs</td>
                    <td>~1 350 mg</td>
                    <td>4 000–6 000 mg</td>
                    <td className="hi">~27%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong>
                Tas, visticamāk, ir 3–4 L deficīts — 4–5% no ķermeņa masas.
              </strong>{" "}
              Veiktspējas un krampju riska robežas atrodas ap 2%. Un nātrijs bija
              gandrīz pilnībā nejaušs: viens elektrolītu gēls, sporta dzēriens,
              sāļā maizīte, kola. Nekas apzināts.
            </p>
            <div className="art-note">
              <div className="lbl">Trūkstošais dators</div>
              <p>
                Ķermeņa svars pirms un pēc brauciena aizstātu visu šo aplēsi ar
                vienu izmērītu skaitli. Tas ir lētākais un vērtīgākais pieejamais
                datu punkts, un tas netika paņemts.
              </p>
            </div>

            <h3>Kofeīns: ~440 mg, un laiks ir aizdomīgs</h3>
            <div className="art-tw">
              <table className="art-t">
                <thead>
                  <tr>
                    <th>Avots</th>
                    <th>Apm. kofeīns</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>½ flat white</td>
                    <td>~65 mg</td>
                  </tr>
                  <tr>
                    <td>Kafija, Limbaži</td>
                    <td>~90 mg</td>
                  </tr>
                  <tr>
                    <td>½ Red Bull</td>
                    <td>~40 mg</td>
                  </tr>
                  <tr className="em">
                    <td>Nootropiskais gēls (~12:45)</td>
                    <td>~200 mg</td>
                  </tr>
                  <tr>
                    <td>0,5 L Coca-Cola</td>
                    <td>~48 mg</td>
                  </tr>
                  <tr className="em">
                    <td>Kopā</td>
                    <td>~440 mg</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Paturiet to prātā nākamajai sadaļai. Aptuveni 200 mg pienāca ap
              90 minūtēm pirms otrā, sliktākā krampja.
            </p>
          </Sec>

          {/* ---------------- 5 ---------------- */}
          <Sec n="05" lv="Krampis, izskaidrots pa īstam" en="The cramp mechanism">
            <p>
              Šo ir vērts saprast, jo mehānisms ir patiesi elegants un tas nosaka
              risinājumu.
            </p>

            <h3>5.1 — Muskulis pats neizlemj, cik stipri saraukties</h3>
            <p>
              Pastāv kontroles cilpa. Divi sensori baro vienu izeju, un tie velk
              pretējos virzienos.
            </p>
            <ReflexLoop />
            <p>
              <strong>Muskuļa vārpsta ir gāzes pedālis.</strong> Tā sēž muskuļa
              vēdera iekšpusē, blakus šķiedrām, un mēra <em>garumu</em>. Izstiep
              muskuli, un vārpsta izlādējas pa <strong>Ia tipa aferentu</strong>{" "}
              nervu — kas aiziet uz muguras smadzenēm un savienojas{" "}
              <em>tieši</em>, pāri vienai sinapsei, ar tā paša muskuļa alfa
              motoneironu. Efekts ir <strong>ierosinošs</strong>: stiepšanās →
              vārpsta izlādējas → motoneirons izlādējas → muskulis saraujas. Tas
              ir stiepšanās reflekss, tas pats, ko ārsts pārbauda, uzsitot pa
              ceļgalu.
            </p>
            <p>
              <strong>Golgi cīpslas orgāns ir bremze.</strong> Tas sēž tur, kur
              muskulis satiekas ar cīpslu, <em>virknē</em> ar šķiedrām, tāpēc
              viss spēks iet caur to. Tas mēra <em>spraigumu</em>, nevis garumu.
              Kad spēks pieaug, orgāns izlādējas pa{" "}
              <strong>Ib tipa aferentu</strong> — un, kas ir būtiski, šī šķiedra{" "}
              <strong>nesavienojas</strong> tieši ar motoneironu. Tā savienojas ar{" "}
              <strong>inhibīcijas interneironu</strong>, kas tad noslāpē alfa
              motoneironu. Efekts ir <strong>nomācošs</strong>: liels spēks →
              orgāns izlādējas → interneirons → motoneirons apklust → muskulis
              atslābst.
            </p>
            <p>
              Šo pēdējo cilpu sauc par <strong>autogēno inhibīciju</strong>, un
              tās uzdevums ir neļaut tev saplēst sevi gabalos. Tas ir iemesls,
              kāpēc tu nevari brīvprātīgi saraukties tik stipri, lai pārrautu
              savu cīpslu.
            </p>

            <h3>5.2 — Ko nogurums nodara cilpai</h3>
            <RunawayDiagram />
            <p>
              Ilgstošā, liela spēka, nogurdinošā darbā — tā ir Martina
              Švelnusa (Schwellnus){" "}
              <strong>izmainītās neiromuskulārās kontroles</strong> hipotēze,
              tagad dominējošais skaidrojums ar slodzi saistītiem muskuļu
              krampjiem (EAMC) — divas lietas nobīdās pretējos virzienos:
            </p>
            <p>
              <strong>Gāzes pedālis kļūst smagāks.</strong> Ilgstoša kontrakcija
              palielina muskuļa vārpstas jutību un izlādes frekvenci. Vairāk Ia
              ierosmes pienāk pie motoneirona.
            </p>
            <p>
              <strong>
                Bremze atsakās — un tā atsakās divu savstarpēji pastiprinošu
                iemeslu dēļ.
              </strong>{" "}
              Šī ir mehāniski svarīgākā daļa:
            </p>
            <ol>
              <li>
                Noguris muskulis rada <strong>mazāk spēka pie tās pašas nervu
                komandas</strong>. Golgi orgāns mēra spēku. Mazāk spēka uz cīpslas
                nozīmē mazāk Ib izlāžu, kas nozīmē mazāk inhibīcijas. Bremze
                izdziest tieši tāpēc, ka muskulis ir noguris.
              </li>
              <li>
                Kad muskulis ir <strong>saīsinātā pozīcijā</strong>, cīpslas
                spraigums ir vēl zemāks pie jebkura aktivācijas līmeņa. Saīsini
                nogurušu muskuli, un Golgi signāls nokrīt gandrīz līdz nullei.
              </li>
            </ol>

            <h3>
              5.3 — “Alfa motoneirona izlāde aiziet nevaldāmi” — vienkāršā valodā
            </h3>
            <p>
              Gāze uz augšu, bremze nost. Alfa motoneirons pazaudē savu
              inhibējošo ierobežojumu, un tā izlādes frekvence kāpj bez nekā, kas
              to apturētu.
            </p>
            <div className="art-verdict">
              <div className="lbl">Ko šī frāze nozīmē</div>
              <p>
                Motoneirona izeja kāpj bez negatīvās atgriezeniskās saites, kas
                to normāli izslēgtu. Tas ir termostats ar nogrieztu sensoru —
                krāsns turpina kurties, jo nekas tai nesaka apstāties. Nevis
                “smadzenes sūtīja stiprāku signālu”. Komandu cilpa pazaudēja savu
                izslēgšanas slēdzi.
              </p>
            </div>
            <p>
              EMG to apstiprina tieši. Krampja pārņemts muskulis izlādējas pie{" "}
              <strong>150 Hz un vairāk</strong>, tālu pāri ~30–50 Hz griestiem
              brīvprātīgā maksimālā kontrakcijā. Un aktivitāte ir{" "}
              <strong>lokalizēta</strong> — tas ir motorisko vienību plankums
              vienā muskuļa reģionā, nevis viss muskulis kopā. Tāpēc krampis
              sajūtas kā mezgls vienā konkrētā vietā, nevis kā viss kvadriceps
              vienlaikus.
            </p>

            <h3>5.4 — Kāpēc stiepšana pārtrauc krampi dažās sekundēs</h3>
            <p>
              Tas izriet tieši no mehānisma, un šo daļu vairums saprot uz otru
              pusi.
            </p>
            <p>
              Stiepšana neko “neatlaiž”.{" "}
              <strong>
                Stiepšana atjauno cīpslas spraigumu → kas atjauno Golgi orgāna
                izlādi → kas atjauno Ib inhibīciju → kas izslēdz nevaldāmo alfa
                motoneironu.
              </strong>{" "}
              Tu manuāli pārstartē salūzušo bremzi.
            </p>
            <p>
              Tas ir mehāniskais iemesls, kāpēc pasīvā stiepšana ir vienīgā
              iejaukšanās ar patiesi spēcīgiem pierādījumiem{" "}
              <em>akūtai</em> krampja atvieglošanai, un kāpēc tā darbojas dažās
              sekundēs, kamēr magnija tablete fiziski nevar tik ātri iedarboties.
            </p>
            <p>
              Konkrēti <em>vastus medialis</em>: stāvot satver potīti, pievelc
              papēdi pie sēžamvietas, pastum gurnu uz priekšu. Pagarini
              kvadricepsu. Turi, līdz atlaižas.
            </p>

            <h3>5.5 — Kāpēc tieši šis krampis, trijās daļās</h3>
            <p>
              <strong>1. Iedarbināšanas pozīcija bija kā no mācību grāmatas.</strong>{" "}
              Ceļgala pilnīga saliekšana, lai uzvilktu zeķi, noliek{" "}
              <em>vastus medialis</em> tā īsākajā iespējamajā garumā — minimāls
              cīpslas spraigums, minimāla Golgi izlāde, minimāla bremze. Svaigam
              muskulim tas ir pilnīgi nekaitīgi; cilvēki to dara katru rītu.
              Muskulim, kas tikko bija izdarījis 30 minūtes pie IF 1,02,
              4,5 stundas darba un 5 km skrējiena, bremze jau bija vāja, un
              saīsināšana atņēma pēdējo.
            </p>
            <p>
              Pozīcijas specifika ir spēcīgākais atsevišķais pierādījums šim
              mehānismam.{" "}
              <strong>
                Tīram elektrolītu deficīta krampim ir vienalga, kādā leņķī ir
                tavs ceļgals. Šim nebija.
              </strong>
            </p>
            <p>
              <strong>
                2. Izplatība bija abpusēja, kas norāda uz centrālo cēloni.
              </strong>{" "}
              Vispirms kreisā kāja, tad labā 9. kilometrā. Velo kreisās/labās
              puses balanss bija 50,1/49,9 — nekādas asimetrijas, nekādas vienas
              kājas problēmas. Abi kvadricepsi saņēma identisku devu un abi
              nonāca tajā pašā vājās bremzes stāvoklī. Otrais padevās kalniņā,
              kur kvadriceps strādā ar lielu spēku un, caur vēlo atbalsta fāzi un
              atgrūšanos, relatīvi saīsinātā pozīcijā.
            </p>
            <p>
              <strong>3. Deva bija jauna.</strong> Murjāņu bloks — 30 min pie
              94–102% FTP, 619 W 30 s, 941 W 5 s, 111 m kāpuma pie 86 apgr./min —
              nav nekur atrodams iepriekšējās četrās nedēļās. 70.3 simulācija
              sešas dienas iepriekš bija 90 km pie krietni zemākas slodzes.
              Kvadricepsiem vienkārši nekad nebija prasīta šī konkrētā spēka,
              ilguma un tam sekojošas skriešanas kombinācija.
            </p>

            <h3>5.6 — Līdzfaktori, kas nolaida slieksni</h3>
            <p>
              Mehānisms iepriekš skaidro, <em>kā</em> krampis izšāva. Šie skaidro,{" "}
              <em>kāpēc slieksnis vispār bija tik zems</em> — un tieši te jaunie
              uztura dati liek pārskatīt secinājumu.
            </p>
            <div className="art-grid">
              <div>
                <div className="k">⊕ Trešā ierosme</div>
                <div className="t">Hipohidratācija</div>
                <p>
                  ~45% šķidruma atjaunots, ap 3–4 L deficīts. Mazāks starpšūnu
                  tilpums nozīmē, ka metabolīti — kālijs, laktāts, adenozīns,
                  bradikinīns — koncentrējas augstākā koncentrācijā ap nervu
                  galiem. Tie sensibilizē III un IV tipa muskuļu aferentus, kas
                  baro papildu ierosmi tajā pašā muguras smadzeņu ķēdē.
                </p>
              </div>
              <div>
                <div className="k">⊕ Membrānas uzbudināmība</div>
                <div className="t">Nātrija deficīts</div>
                <p>
                  ~27% atjaunots, ap 3 000–4 500 mg neatjaunots. Veicina plazmas
                  tilpuma zudumu un nobīda jonu gradientus pāri muskuļa
                  membrānai, paceļot miera uzbudināmību.
                </p>
              </div>
              <div>
                <div className="k">⊕ Vieglāk palaist garām</div>
                <div className="t">Kofeīns ~440 mg</div>
                <p>
                  Kofeīns ir adenozīna receptoru antagonists, un adenozīns
                  centrālajā nervu sistēmā ir <em>inhibējošs</em> — to bloķējot,
                  motoneirona uzbudināmība pieaug. Lielākās devās kofeīns arī
                  sensibilizē rianodīna receptoru, palielinot kalcija izdalīšanos
                  no sarkoplazmatiskā tīkla. Abi efekti spiež tieši nepareizajā
                  virzienā.
                </p>
              </div>
              <div>
                <div className="k">↑ Paātrina mehānismu</div>
                <div className="t">Glikogēna izsīkums</div>
                <p>
                  Nulle ogļhidrātu pirmajās 63 minūtēs, ~225 g deficīts velo
                  daļā. Izsīkušas šķiedras nogurst ātrāk; ātrāks nogurums nozīmē
                  ātrāku Golgi signāla sabrukumu. Tas nepievieno jaunu mehānismu
                  — tas paātrina esošo.
                </p>
              </div>
              <div>
                <div className="k">↑ Pastiprina visu</div>
                <div className="t">Karstums — līdz 33 °C</div>
                <p>
                  Paātrina centrālo nogurumu un rada iepriekš minētos sviedru
                  zudumus. Iedarbojas gan uz primāro mehānismu, gan uz
                  hidratāciju.
                </p>
              </div>
              <div>
                <div className="k">Konteksts</div>
                <div className="t">Aukstā ūdens iegremdēšana</div>
                <p>
                  Piecu minūšu pelde jūrā tieši noguruma pagrieziena punktā.
                  Nogurušas muskulatūras atdzesēšana paaugstina krampja
                  uzņēmību. Tas bija sprūds. Slodze bija cēlonis.
                </p>
              </div>
            </div>

            <h3>5.7 — Pārskatītais secinājums</h3>
            <div className="art-verdict">
              <div className="lbl">Secinājums</div>
              <p>
                Neiromuskulārais nogurums bija mehānisms. Hipohidratācija,
                nātrija deficīts, kofeīna slodze un priekšgalā sakrājies
                glikogēna izsīkums bija slieksni nolaidošie līdzfaktori — un
                šķidruma un nātrija daļa bija būtiski lielāka, nekā sākotnēji
                pieņemts.
              </p>
            </div>
            <p>
              Sākotnēji elektrolīti tika svērti kā sekundāri, jo pozīcijas
              specifiskais sprūds ir tik spēcīgs pierādījums neiromuskulārajam
              ceļam, un jo klasiskie Ironman lauka pētījumi (Schwellnus, Sulzer)
              neatrada <em>nekādu</em> atšķirību seruma nātrijā vai hidratācijas
              stāvoklī starp tiem, kam bija krampji, un tiem, kam nebija. Tā
              literatūra ir reāla un tā joprojām stāv.
            </p>
            <p>
              Bet tie pētījumi salīdzināja sportistus ar plaši līdzīgu, pārsvarā
              saprātīgu uzņemšanu. Tie nesalīdzināja ar cilvēku, kas atjauno
              ceturto daļu sava nātrija un mazāk par pusi šķidruma pie 33 °C.
              Tāda apjoma deficīts ir ārpus diapazona, ko tie pētījumi
              iztvēra, un “sāļo sviedrētāju” pretliteratūra (Stofan, Bergeron) ir
              tieši par to asti.
            </p>
            <p>
              Praktiskās sekas ir svarīgākas par klasifikāciju:{" "}
              <strong>
                neiromuskulārā daļa tiek labota lēni, nedēļu laikā, ar kadences
                darbu un ekscentrisku spēku. Hidratācijas daļu var salabot jau
                nākamajā braucienā.
              </strong>{" "}
              Vispirms dari to ātro.
            </p>

            <h3>5.8 — Ko magnijs var un ko nevar</h3>
            <ul>
              <li>
                <strong>
                  Ar slodzi saistītiem krampjiem pierādījumi to neatbalsta.
                </strong>{" "}
                Cochrane pārskats (Garrison et al.) neatrada nozīmīgu magnija
                efektu ar slodzi saistītiem krampjiem pieaugušajiem. Ieguvums,
                kas pastāv, lielā mērā attiecas uz grūtniecības krampjiem.
              </li>
              <li>
                <strong>Tas ir zema riska, un bisglicināts ir pareizā forma</strong>{" "}
                — labi uzsūcas, saudzīgs kuņģim, daudz mazāks caurejas efekts
                nekā oksīdam vai citrātam. Trīskārša deva diez vai nodarīja
                ļaunumu.
              </li>
              <li>
                <strong>Tas, visticamāk, palīdzēja miegam.</strong> Glicīnam
                pašam ir mērens nomierinošs un termoregulējošs efekts, un 1:38
                dziļā miega atbilst labai naktij. Labs rezultāts — tikai
                jāpieraksta pareizajam cēlonim.
              </li>
              <li>
                <strong>Neļauj tam kļūt par plānu.</strong> Risinājums ir
                šķidrums, nātrijs, kadence un ekscentriskais spēks. Magnijs
                labākajā gadījumā ir neliela palīgloma.
              </li>
            </ul>
            <p>
              <strong>Kreatīns, 9 g:</strong> pierādījumi neatbalsta kreatīnu kā
              krampju cēloni — vairāki pētījumi atrod neitrālu vai nedaudz
              aizsargājošu efektu. Tas gan ievelk ūdeni muskulī intracelulāri,
              kas paaugstina kopējā ķermeņa ūdens vajadzību. Nevis problēma pati
              par sevi; vēl viens iemesls, kāpēc šķidruma uzņemšanai vajadzēja
              būt lielākai.
            </p>
          </Sec>

          {/* ---------------- 6 ---------------- */}
          <Sec n="06" lv="Nakts pēc" en="The night after">
            <p>
              Laiks gultā 8:42 · aizmidzis 8:07 · efektivitāte 94% · iemigšana
              3 min · dziļais 1:38 · REM 1:35 · vieglais 4:54 · nomodā 0:35 ·
              WHOOP Recovery 35% · dabiska pamošanās.
            </p>
            <Fig
              src={`${C}/08_two_nights.png`}
              alt="Divu nakšu salīdzinājums pirms un pēc treniņa"
              caption="Att. 08 — Nakts pirms pret nakti pēc"
              note="Zaļais = kustējās pareizajā virzienā"
              w={2235}
              h={650}
            />

            <h3>Nakts HRV līkne — nedēļas labākie dati</h3>
            <Fig
              src={`${C}/07_overnight_hrv.png`}
              alt="Nakts HRV līknes salīdzinājums abām naktīm"
              caption="Att. 07 — Nakts HRV trajektorija"
              note="Aptuveni, digitalizēts no Garmin grafikiem"
              w={1785}
              h={765}
            />
            <p>
              Novērojums bija pareizs: parasti HRV ir augsts jau no iemigšanas.
              Šajā naktī tas sākās ap <strong>40 ms</strong> un vienmērīgi kāpa
              visu nakti, sasniedzot{" "}
              <strong>30 dienu normas augšgalu (~100 ms) līdz rītam</strong> —
              gradients aptuveni +7 ms uz katru miega stundu.
            </p>
            <p>
              Šī agrā nomāktība nav slikta zīme. Tā ir dienas autonomās izmaksas,
              kas tiek nomaksātas reāllaikā. Tajās pirmajās divās stundās
              ķermenis vienlaikus darbināja:
            </p>
            <ol>
              <li>
                <strong>Atlikušo simpātisko dzinuli</strong> — cirkulējošie
                kateholamīni pēc 4,5 stundu piepūles neizzūd acumirklī
              </li>
              <li>
                <strong>Paaugstinātu skābekļa patēriņu pēc slodzes (EPOC)</strong>{" "}
                — vielmaiņa vēl virs bāzes līmeņa
              </li>
              <li>
                <strong>Glikogēna atjaunošanu</strong> — ATP patērējošs process,
                un caurums bija ~350 g
              </li>
              <li>
                <strong>Plazmas tilpuma atjaunošanu</strong> — hipovolēmisks,
                tāpēc renīna–angiotenzīna–aldosterona sistēma bija aktīva, un
                tās aktivācija ir simpātiski mediēta.{" "}
                <em>Tieši šeit dehidratācija parādās miega datos.</em>
              </li>
              <li>
                <strong>Muskuļu remonta signalizāciju</strong> — iekaisuma
                kaskāde no parastā treniņa bojājuma plus reāls krampja izraisīts
                bojājums
              </li>
              <li>
                <strong>Lielas atjaunošanās maltītes gremošanu</strong>
              </li>
            </ol>
            <p>
              Vienmērīgais kāpums no 40 uz 100 ms ir šī uzkrājuma nokārtošana.
              Normas augšgala sasniegšana līdz rītam, dabiska pamošanās, laba
              pašsajūta, +65 Body Battery:{" "}
              <strong>
                tā izskatās liels, bet veiksmīgi uzņemts stimuls.
              </strong>{" "}
              Ja HRV visu nakti būtu palicis pie 40–50 ms, tā būtu pavisam cita
              saruna.
            </p>

            <h3>Tas, kas pelna cieņu</h3>
            <ul>
              <li>
                <strong>Body Battery zemākais punkts — 5.</strong> Faktiski
                pilnīgs izsīkums. Tas ir godīgākais skaitlis visā datu kopā par
                to, cik liela bija diena.
              </li>
              <li>
                <strong>WHOOP Recovery 35% (dzeltens).</strong> WHOOP smagi sver
                agro nakts HRV nomāktību un savu miera pulsa mērījumu. Piesardzība
                nav nepareiza.
              </li>
              <li>
                <strong>Nemiers augšup (58 pret 48), traucējumi 18.</strong>{" "}
                Gandrīz noteikti sāpoša, tikko krampī bijusi kvadricepss.
              </li>
              <li>
                <strong>Miega vajadzība 10:11 pret 8:07 iegūtajām</strong> — divu
                stundu iztrūkums, un no 6:13 nakts ir pārnests parāds. Tas vēl
                nav atmaksāts.
              </li>
              <li>
                <strong>Garmin HRV 69 ms pret 30 dienu joslu 74–102.</strong>{" "}
                Joprojām atzīmēts kā “Balanced”, bet pie apakšējās malas.
              </li>
            </ul>

            <h3>Par miera pulsa novērojumu</h3>
            <div className="art-tw">
              <table className="art-t">
                <thead>
                  <tr>
                    <th></th>
                    <th>Garmin</th>
                    <th>WHOOP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Miera SF, nakts pēc</td>
                    <td>46 (no 48)</td>
                    <td>53 (normas augšmala)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Garmin ziņo zemāko noturīgo nakts vērtību; WHOOP mēra tieši lēnā
              viļņa miega laikā. Metodes atšķiras, tāpēc absolūtie skaitļi nav
              salīdzināmi. Sajūta, ka “miera pulss bija mazliet augstāks”, ir
              WHOOP atbalstīta un Garmin noliegta.
            </p>
            <div className="art-note">
              <div className="lbl">Godīgais lasījums</div>
              <p>
                Miera pulss nebija jēgpilni paaugstināts. Īstais signāls ir agrā
                nakts HRV nomāktība, un tā izzuda. Vispārējais likums — uzticies
                tendencēm vienas ierīces ietvaros, nekad absolūtām vērtībām starp
                divām.
              </p>
            </div>
          </Sec>

          {/* ---------------- 7 ---------------- */}
          <Sec n="07" lv="Ko tas nozīmē Podersdorf" en="Race implications">
            <p>
              43 dienas līdz startam. Podersdorf ir līdzens un atklāts — vējš ir
              visa tā velo trases būtība. No šīs nedēļas nogales iznāca trīs
              konkrēti skaitļi.
            </p>

            <h3>Velo: NP 175–188 W (IF 0,68–0,72)</h3>
            <p>
              Šis brauciens bija NP 220 W četrarpus stundas. Sacensību dienā
              vajadzētu justies krietni vieglāk nekā šodien.
            </p>
            <div className="art-note">
              <div className="lbl">Cietie griesti</div>
              <p>
                Nekad virs 260 W ilgāk par 30 sekundēm. Nekad virs 300 W vispār.
                Līdzenā trasē nav nekāda iemesla šaudīties, un katrs uzrāviens
                virs sliekšņa ir izņēmums no skrējiena konta.
              </p>
            </div>

            <h3>Kadence 85–90 apgr./min — tā ir krampja apdrošināšana</h3>
            <p>
              Šajā dienā vidēji 82, otrajā pusē aizslīdot uz 78, un līdz 58
              sliktajā segumā. Zema kadences malšana ir vienīgā vērtīgākā
              maiņa, jo tā tieši slogo to muskuli, kas padevās. Augstāka kadence
              pie tās pašas jaudas nozīmē mazāku maksimālo spēku uz katru
              apgriezienu, kas nozīmē mazāku nogurumu spēku ražojošajās šķiedrās,
              kas nozīmē, ka Golgi bremze paliek funkcionāla ilgāk.
            </p>

            <h3>Skrējiens: 5:15–5:30/km sākumā, SF 140–150 līdz pusei</h3>
            <p>
              5:07–5:16/km pie SF 153 iznāca no krietni grūtāka brauciena, nekā
              Austrijā būs. Tas atbalsta 3:40–3:50 Ironman maratonu,{" "}
              <em>ja</em> velo daļa ir disciplinēta. Bet krampis pienāca
              9,5. kilometrā —{" "}
              <strong>
                izturība tālāk par šo distanci nav pierādīta, un tas tagad ir
                lielākais atklātais jautājums visā sagatavošanās ciklā.
              </strong>
            </p>

            <h3>Uztura un hidratācijas protokols — jāizmēģina, nevis improvizē</h3>
            <div className="art-tw">
              <table className="art-t">
                <thead>
                  <tr>
                    <th>Parametrs</th>
                    <th>Mērķis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ogļhidrāti</td>
                    <td>80–100 g/h, sākot jau pirmajās 20 minūtēs</td>
                  </tr>
                  <tr>
                    <td>Nātrijs</td>
                    <td>700–1 000 mg/h, apzināti, nevis nejauši</td>
                  </tr>
                  <tr>
                    <td>Šķidrums</td>
                    <td>750 ml–1 L/h, mērīts pēc iztukšotām pudelēm</td>
                  </tr>
                  <tr className="em">
                    <td>Kofeīns</td>
                    <td>ne vairāk par 200 mg kopā uz velo, pēdējā stundā nemaz</td>
                  </tr>
                  <tr>
                    <td>Svēršanās</td>
                    <td>pirms un pēc katra gara brauciena no šī brīža</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Kofeīna griesti ir reāla rekomendācija, nevis piemetinājums. Ņemot
              vērā 5. sadaļas mehānismu, 440 mg iekraušana krampjiem uzņēmīgā
              dienā ir darbs pret sevi.
            </p>
          </Sec>

          {/* ---------------- 8 ---------------- */}
          <Sec n="08" lv="Plāns no šī brīža" en="The plan from here">
            <h3>Šodien, svētdien 26. jūlijā</h3>
            <p>
              Viegls peldējums 1 500 m: bez lāpstiņām, bez pleznām, bez smagiem
              kāju vingrinājumiem, un nekādu brasa kāju sitienu — tas ir
              visdrošākais veids, kā atkal iedarbināt adduktoru vai{" "}
              <em>vastus medialis</em> krampi. Agresīva šķidruma un nātrija
              atjaunošana; deficīts vēl nav slēgts. Nekādas stiepšanas{" "}
              <em>iekšā</em> krampī bijušajā muskulī — tikai saudzīga kustību
              amplitūda, jo audos ir mikrobojājumi.
            </p>

            <h3>Šī nedēļa, 27.07.–02.08.: uzņemt, nevis celt</h3>
            <p>
              Mērķis ~500–550 TSS. Neviena velo sesija virs IF 0,80. Nekādas
              smagas skriešanas. Pirmais skrējiens otrdien, viegls, līdzens,
              maksimums 40 minūtes.
            </p>
            <p>
              Kārdinājums pēc dienas, kas izdevās tik labi, ir uzreiz spiest
              vēlreiz. Tas izniekotu stimulu. Adaptācija notiek tagad, un tai
              vajag vietu.
            </p>

            <h3>Sākt nekavējoties: ekscentrisks kvadricepsa spēks, 2× nedēļā</h3>
            <p>
              Tempo izklupieni un bulgāru izklupieni, 3×8 katrai kājai, trīs
              sekunžu nolaišanās fāze. Sākt viegli otrdien. Sešas nedēļas ir
              pietiekami, lai jēgpilni paceltu krampja slieksni — neiromuskulāra
              problēma atbild uz neiromuskulāru treniņu, un tieši šis veids
              būvē spēka kapacitāti garos muskuļa garumos, kas ir tas, kas
              sabrūkošai Golgi cilpai vajadzīgs.
            </p>

            <h3>08.–09. un 15.–16. augusts: divas sesijas, kas izlemj sacensības</h3>
            <p>
              4,5–5 h pie IF 0,68–0,72, kadence 85–90, pilns sacensību uzturs un
              nātrijs, pēc tam 60–75 min skrējiens pie 5:20–5:30/km.
            </p>
            <p>
              Mērķis noteikti <strong>nav</strong> iet smagi. Iet smagi jau ir
              pierādīts. Nav pierādīts tas, ka var iet{" "}
              <em>gari Ironman intensitātē, nesabrūkot kvadricepsiem</em> — un tas
              ir vienīgais, ko vēl ir vērts pārbaudīt.
            </p>

            <h3>Galvenās sesijas jāpabeidz līdz ~23. augustam</h3>
            <p>No tā trīs nedēļu taperēšana līdz 6. septembrim.</p>

            <div className="art-verdict">
              <div className="lbl">Traumu risks: mērens, nevis augsts</div>
              <p>
                Nekas strukturāls. Bet spēcīgs abpusējs kvadricepsa krampis,
                −8,6% atsaiste, 43 dienas līdz startam un šķidruma deficīts
                4–5% robežās kopā nozīmē, ka nākamajām septiņām dienām jābūt
                patiesi vieglām. Risks nav sestdienas sesija. Risks ir tas, kas
                tiks izdarīts, atbildot uz to, cik labi sestdiena sajutās.
              </p>
            </div>
          </Sec>

          {/* ---------------- bottom line ---------------- */}
          <section className="art-sec">
            <h2>
              <span className="n">Apakšsvītra — Bottom line</span>
              Kopumā
            </h2>
            <p>
              Motors ir apsteidzis grafiku. Trīsdesmit minūtes pie 94% no FTP
              154 km brauciena vidū, 228 W pilnu stundu četras stundas dziļi, un
              4:50 kilometrs no velo — tie visi ir spēcīgi rādītāji sešas nedēļas
              pirms starta. Podersdorf ir labi sasniedzams.
            </p>
            <p>
              Krampis nav trausluma pierādījums. Tā ir konkrēta, labi izprasta un
              labojama sprauga starp aerobo sistēmu, kas ir priekšā, un muskulāro
              sistēmu, kas pie liela spēka atpaliek — un ko krietni pasliktināja
              hidratācijas un nātrija plāns, kas nebija plāns.
            </p>
            <p>
              Kadence, ekscentriskais spēks, apzināts nātrijs un divi disciplinēti
              gari bricki to aizver.
            </p>
            <p>
              <strong>Tagad nedēļu jābūt garlaicīgam.</strong>
            </p>
          </section>

          {/* ---------------- foot ---------------- */}
          <footer className="art-foot">
            <div className="h">Metode</div>
            Viss iegūts no neapstrādātiem Garmin <code>.FIT</code> failiem,
            parsētiem ar Python (<code>fitdecode</code>), nevis no platformu
            kopsavilkumiem. Pauzes rekonstruētas no <code>timer</code> notikumu
            pāriem. Vidēji maksimālā jauda — slīdošā konvolūcija pār pilnu
            sekunžu jaudas rindu. Normalizētā jauda — 30 s slīdošais vidējais
            ceturtajā pakāpē, tad ceturtā sakne. Atsaiste — jaudas un
            sirdsdarbības attiecība 10 minūšu logos. Ogļhidrātu oksidācija
            modelēta no mehāniskā darba pie 23% pieņemtas bruto efektivitātes.
            Kreisās/labās puses balanss dekodēts no <code>left_right_balance</code>{" "}
            lauka. Sviedru zudumi aplēsti, nevis izmērīti.
            <div className="h">Atsauces vērtības</div>
            FTP 259 W (iestatīts manuāli) · SF zonas Z1 ≤120, Z2 121–142,
            Z3 143–166, Z4 167–189, Z5 190+ · skriešanas tempa zonas no maratona
            3:18 · 30 dienu HRV josla 74–102 ms.
            <div className="h">Avoti</div>
            <a
              href="https://www.strava.com/activities/19457560099"
              target="_blank"
              rel="noopener"
            >
              Strava — TDVz Tour De VidusZeme
            </a>{" "}
            ·{" "}
            <a
              href="https://www.strava.com/activities/19458666369"
              target="_blank"
              rel="noopener"
            >
              Strava — BRICK Run
            </a>{" "}
            ·{" "}
            <a
              href="https://www.strava.com/activities/19448932165"
              target="_blank"
              rel="noopener"
            >
              Strava — peldējums 24.07.
            </a>{" "}
            · Garmin Connect · WHOOP
            <div className="h">Literatūra</div>
            Schwellnus MP, “Cause of exercise associated muscle cramps — altered
            neuromuscular control, dehydration or electrolyte depletion?”,{" "}
            <em>Br J Sports Med</em> 2009 · Schwellnus MP, Drew N, Collins M,{" "}
            <em>Br J Sports Med</em> 2011 · Stofan JR et al.,{" "}
            <em>Int J Sport Nutr Exerc Metab</em> 2005 · Garrison SR et al.,
            “Magnesium for skeletal muscle cramps”, <em>Cochrane</em> 2020 ·
            Minetto MA et al., par krampju EMG izlādes raksturlielumiem.
            <div className="h">Loksne</div>
            Nr. 02-01 · Analīzes logs 24.–26.07.2026 · Personīgais Atlants,
            2026. gada izdevums
          </footer>
        </div>
      </article>
      <Footer />
    </>
  );
}
