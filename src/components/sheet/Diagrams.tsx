/**
 * Named diagrams, referenced from markdown by a fenced `diagram` block:
 *
 *     ```diagram
 *     reflex-loop
 *     ```
 *
 * These are presentation, not content, so they live in the website project.
 * To add one: write the component, register it in DIAGRAMS, document the key
 * in content/README.md.
 */

function ReflexLoop() {
  return (
    <svg viewBox="0 0 900 460" role="img" aria-labelledby="d1t">
      <title id="d1t">
        Kontroles cilpa: muskuļa vārpsta un Golgi cīpslas orgāns pretēji iedarbojas uz
        alfa motoneironu
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

      <rect className="d-box" x="30" y="26" width="252" height="92" />
      <text className="d-t-b" x="46" y="50">MUSKUĻA VĀRPSTA</text>
      <text className="d-s" x="46" y="68">muskuļa iekšpusē, paralēli šķiedrām</text>
      <text className="d-s" x="46" y="84">mēra: GARUMU / stiepšanos</text>
      <text className="d-s" x="46" y="104" fill="#5c7a2e">→ gāzes pedālis</text>

      <rect className="d-box" x="30" y="248" width="252" height="104" />
      <text className="d-t-b" x="46" y="272">GOLGI CĪPSLAS ORGĀNS</text>
      <text className="d-s" x="46" y="290">muskuļa–cīpslas savienojumā, virknē</text>
      <text className="d-s" x="46" y="306">mēra: SPĒKU / spraigumu</text>
      <text className="d-s" x="46" y="326" fill="#c8401f">→ bremze (autogēnā inhibīcija)</text>

      <rect className="d-box" x="344" y="266" width="156" height="66" />
      <text className="d-t-b" x="358" y="292">INHIBĪCIJAS</text>
      <text className="d-t-b" x="358" y="308">INTERNEIRONS</text>
      <text className="d-s" x="358" y="324">muguras smadzenēs</text>

      <rect className="d-box-hi" x="572" y="104" width="298" height="112" />
      <text className="d-t-b" x="590" y="132">ALFA MOTONEIRONS</text>
      <text className="d-s" x="590" y="152">gala kopējais ceļš — tā izlādes</text>
      <text className="d-s" x="590" y="168">frekvence IR kontrakcijas komanda</text>
      <text className="d-s" x="590" y="192" fill="#c8401f">gāze + bremze → viena izeja</text>

      <rect className="d-box" x="572" y="272" width="298" height="46" />
      <text className="d-t" x="590" y="301">Muskulis saraujas</text>
      <rect className="d-box" x="344" y="386" width="526" height="46" />
      <text className="d-t" x="362" y="415">Spēks parādās uz cīpslas — cilpa noslēdzas</text>

      <path className="d-line-ex" markerEnd="url(#ahg)" d="M282 72 H 430 V 140 H 566" />
      <text className="d-s" x="300" y="62" fill="#5c7a2e">
        Ia aferents — monosinaptisks, IEROSINA ⊕
      </text>
      <path className="d-line" markerEnd="url(#ah)" d="M282 299 H 338" />
      <text className="d-s" x="288" y="290">Ib</text>
      <path className="d-line-in" markerEnd="url(#ahr)" d="M500 299 H 536 V 186 H 566" />
      <text className="d-s" x="506" y="240" fill="#c8401f">NOMĀC ⊖</text>
      <path className="d-line" markerEnd="url(#ah)" d="M721 216 V 266" />
      <path className="d-line" markerEnd="url(#ah)" d="M721 318 V 380" />
      <path className="d-dash" markerEnd="url(#ah)" d="M344 409 H 156 V 358" />
    </svg>
  );
}

function Runaway() {
  return (
    <svg viewBox="0 0 900 330" role="img" aria-labelledby="d2t">
      <title id="d2t">
        Svaigs muskulis pret nogurušu un saīsinātu muskuli — bremzes zudums
      </title>
      <defs>
        <marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
          markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#1a1712" />
        </marker>
      </defs>

      <rect className="d-box" x="14" y="18" width="392" height="296" />
      <text className="d-t-b" x="34" y="46">SVAIGS — līdzsvarā</text>
      <text className="d-s" x="34" y="86">Ia ierosme</text>
      <rect x="130" y="74" width="130" height="14" fill="#5c7a2e" />
      <text className="d-s" x="272" y="86">normāla</text>
      <text className="d-s" x="34" y="124">Ib inhibīcija</text>
      <rect x="130" y="112" width="130" height="14" fill="#c8401f" />
      <text className="d-s" x="272" y="124">normāla</text>
      <path className="d-line" markerEnd="url(#ah2)" d="M210 140 V 176" />
      <rect className="d-box-ok" x="60" y="182" width="300" height="72" />
      <text className="d-t-b" x="80" y="212">KONTROLĒTA IZLĀDE</text>
      <text className="d-s" x="80" y="234">apm. 10–50 Hz · brīvprātīga</text>
      <text className="d-s" x="80" y="284">Cīpslas spraigums pietiekams, lai</text>
      <text className="d-s" x="80" y="300">bremze nepārtraukti darbotos.</text>

      <path className="d-line" markerEnd="url(#ah2)" d="M410 166 H 484" />
      <text className="d-s" x="412" y="140">4,5 h · IF 0,85</text>
      <text className="d-s" x="412" y="156">30 min pie IF 1,02</text>
      <text className="d-s" x="412" y="196">33 °C · −3 L</text>
      <text className="d-s" x="412" y="212">8 km skrējiena</text>

      <rect className="d-box-hi" x="494" y="18" width="392" height="296" />
      <text className="d-t-b" x="514" y="46" fill="#c8401f">
        NOGURIS + SAĪSINĀTS — bez bremzes
      </text>
      <text className="d-s" x="514" y="86">Ia ierosme</text>
      <rect x="614" y="74" width="196" height="14" fill="#5c7a2e" />
      <text className="d-s" x="820" y="86">↑ augusi</text>
      <text className="d-s" x="514" y="124">Ib inhibīcija</text>
      <rect x="614" y="112" width="26" height="14" fill="#c8401f" />
      <text className="d-s" x="650" y="124" fill="#c8401f">↓ sabrukusi</text>
      <path className="d-line" markerEnd="url(#ah2)" d="M694 140 V 176" />
      <rect x="544" y="182" width="300" height="72" fill="#c8401f" />
      <text className="d-t-b" x="564" y="212" fill="#f4efe6">NEKONTROLĒTA IZLĀDE</text>
      <text className="d-s" x="564" y="234" fill="#f4efe6">
        150+ Hz · patvaļīga, pašuzturoša
      </text>
      <text className="d-s" x="564" y="284">Mazāk spēka + saīsināts muskulis</text>
      <text className="d-s" x="564" y="300" fill="#c8401f">
        = gandrīz nav Ib signāla → KRAMPIS
      </text>
    </svg>
  );
}

export const DIAGRAMS: Record<string, { el: React.ReactNode; label: string }> = {
  "reflex-loop": {
    el: <ReflexLoop />,
    label: "Att. A — Divi sensori, viena izeja. Vārpsta ierosina, Golgi orgāns nomāc.",
  },
  runaway: {
    el: <Runaway />,
    label: "Att. B — Gāze uz augšu, bremze nost. Tas ir viss krampja mehānisms.",
  },
};
