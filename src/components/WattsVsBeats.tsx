"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

/**
 * A standalone reference article, not a dated training sheet — it carries
 * full LV and EN prose (sheets don't, see content/README.md), so it's a
 * bespoke page rather than a content/triatlons/*.md file. Source: Obsidian
 * note "04 Reference — Power, HR and Normalized Power", sections 1–7 only
 * (section 8 is this build's private numbers and stays out of the site).
 */

const T = {
  crumbAtlas: { lv: "Atlants", en: "Atlas" },
  crumbTerritory: { lv: "Teritorija 02", en: "Territory 02" },
  crumbBack: { lv: "Triatlons", en: "Triathlon" },
  sheetNo: { lv: "Atsauce", en: "Reference" },
  title: { lv: "Jauda pret pulsu", en: "Watts vs beats" },
  sub: {
    lv: "Garās distances tempa atsauce",
    en: "Long-course pacing reference",
  },
  lede: {
    lv: "Ko patiesībā parāda jauda, pulss un normalizētā jauda — un kas jāvēro Ironman velo posmā, un kāpēc.",
    en: "What power, heart rate and normalized power each actually measure — what to watch during an Ironman bike leg, and why.",
  },

  s1Kicker: { lv: "01 — Atšķirība", en: "01 — The distinction" },
  s1H: {
    lv: "Viens instruments mēra to, ko tu saražo. Otrs — cik tas tev maksā.",
    en: "One instrument measures what you produce. The other measures what it costs you.",
  },
  s1P: {
    lv: "Gandrīz visas domstarpības par tempa noturēšanu rodas tāpēc, ka šie divi skaitļi tiek uzskatīti par viena veida mērījumu. Tie tādi nav. Jauda ir cēlonis; pulss ir sekas.",
    en: "Almost every disagreement about pacing comes from treating these two numbers as if they were the same kind of measurement. They are not. Power is a cause; heart rate is an effect.",
  },
  s1PowerTag: { lv: "Jauda", en: "Power" },
  s1PowerH: { lv: "Ārējais darba temps", en: "External work rate" },
  s1PowerP: {
    lv: "Mēra vatos, pie kloķa vai pedāļa. Tā ir mehāniskā izeja — spēks reiz leņķiskais ātrums. Tā reaģē acumirklī, tā nedreifē, un tā ir identiska neatkarīgi no tā, vai esi svaigs vai izsmelts, vēss vai pārkarsis.",
    en: "Measured in watts, at the crank or pedal. It is mechanical output — force × angular velocity. It responds instantly, it does not drift, and it is identical whether you are fresh or wrecked, cool or overheating.",
  },
  s1HrTag: { lv: "Pulss", en: "Heart rate" },
  s1HrH: { lv: "Iekšējās izmaksas", en: "Internal cost" },
  s1HrP: {
    lv: "Mēra sitienos minūtē. Tā ir sirds un asinsvadu sistēmas cena par šīs jaudas radīšanu tieši šodien — šajā karstumā, ar tik daudz miega un tik daudz glikogēna. Tas atpaliek, tas dreifē, un to ietekmē ducis lietu, kam ar pedāļiem nav nekāda sakara.",
    en: "Measured in beats per minute. It is the cardiovascular price of producing that output on this day, in this heat, on this much sleep and this much glycogen. It lags, it drifts, and it is influenced by a dozen things that have nothing to do with the pedals.",
  },
  s1Close: {
    lv: "Abas īpašības ir noderīgas, un tieši pretēju iemeslu dēļ. Jauda ir precīza, bet akla. Pulss ir trokšņains, bet vērīgs.",
    en: "Both properties are useful, and for opposite reasons. Power is precise but blind. Heart rate is noisy but perceptive.",
  },

  s2Kicker: { lv: "02 — Normalizētā jauda", en: "02 — Normalized power" },
  s2H: {
    lv: "Kāpēc vidējā jauda par zemu novērtē mainīga brauciena cenu",
    en: "Why average power under-reports what a variable ride cost",
  },
  s2P1: {
    lv: "Vidējā jauda ir aritmētiskais vidējais, un tā uzskata katru vatu par vienlīdz dārgu. Fizioloģiski tā nav taisnība. Braukšana ar 300 W nemaksā trīs reizes vairāk nekā 100 W — tā maksā ievērojami vairāk, jo vielmaiņas atbilde uz intensitāti ir līklīnijas, nevis lineāra.",
    en: "Average power is an arithmetic mean, and it treats every watt as equally expensive. Physiologically that is false. Riding at 300 W does not cost three times what 100 W costs — it costs considerably more than three times, because the metabolic response to intensity is curvilinear.",
  },
  s2P2: {
    lv: "Normalizētā jauda (Endrū Kogans, Training and Racing with a Power Meter) ir mēģinājums atbildēt uz konkrētu jautājumu: kāda pastāvīga jauda būtu bijusi fizioloģiski līdzvērtīga šim mainīgajam braucienam?",
    en: "Normalized power (Andrew Coggan, Training and Racing with a Power Meter) is an attempt to answer a specific question: what constant power would have been physiologically equivalent to this variable ride?",
  },
  s2StepsH: { lv: "Algoritms", en: "The algorithm" },
  s2Steps: {
    lv: [
      "Ņem jaudas datus ar 1 Hz frekvenci.",
      "Aprēķini 30 sekunžu slīdošo vidējo.",
      "Katru no šīm izlīdzinātajām vērtībām kāpini ceturtajā pakāpē.",
      "Aprēķini šo vērtību vidējo.",
      "No iegūtā vidējā izvelc ceturtās pakāpes sakni.",
    ],
    en: [
      "Take the power stream at 1 Hz.",
      "Compute a 30-second rolling average.",
      "Raise each of those smoothed values to the 4th power.",
      "Take the mean of those values.",
      "Take the 4th root of that mean.",
    ],
  },
  s2FormulaCap: { lv: "Normalizētā jauda", en: "Normalized power" },
  s2Why30H: { lv: "Kāpēc 30 sekundes", en: "Why 30 seconds" },
  s2Why30P: {
    lv: "Tāpēc, ka tas aptuveni atbilst organisma atbildes laika konstantei uz slodzes maiņu. Skābekļa patēriņa kinētika, laktāta parādīšanās, ventilācija un pulss visi atpaliek no straujas jaudas maiņas aptuveni šādā laika mērogā. Vienas sekundes uzrāviens nerada vienas sekundes vielmaiņas uzrāvienu, tāpēc tieši izlīdzināšana ir tā, kas padara turpmāko aritmētiku jēgpilnu.",
    en: "Because that approximates the time constant of the body's response to a change in workload. Oxygen uptake kinetics, lactate appearance, ventilation and heart rate all lag a step change in power by roughly that order of magnitude. A one-second spike does not produce a one-second metabolic spike, so smoothing first is what makes the subsequent arithmetic meaningful.",
  },
  s2Why4H: { lv: "Kāpēc ceturtā pakāpe", en: "Why the fourth power" },
  s2Why4P1: {
    lv: "Tāpēc, ka intensitātes cena aug daudz straujāk nekā pati intensitāte. Laktāta uzkrāšanās asinīs, kateholamīnu izdalīšanās un muskuļu glikogenolīzes ātrums visi aug aptuveni kā relatīvās intensitātes ceturtās pakāpes funkcija. Eksponents izvēlēts empīriski — tas ir tas, kas deva vislabāko korelāciju ar izmērīto laktātu un ar subjektīvi izjusto piepūli. Tas ir līknes pielāgojums, nevis atvasinājums no pamatprincipiem, un par to ir vērts būt godīgiem.",
    en: "Because the cost of intensity rises far faster than intensity itself. Blood lactate accumulation, catecholamine release and the rate of muscle glycogenolysis all rise approximately as a quartic function of relative intensity. The exponent was chosen empirically — it is the one that made the output correlate best with measured lactate and with perceived effort. It is a curve fit, not a derivation from first principles, and it is worth being honest about that.",
  },
  s2Why4P2: {
    lv: "Praktiskās sekas: ceturtā pakāpe ārkārtīgi lielu svaru piešķir smagajiem brīžiem. Uzrāvieni dominē rezultātā. Tā ir paredzētā uzvedība.",
    en: "The practical consequence: the fourth power weights the hard moments enormously. Surges dominate the result. That is the intended behaviour.",
  },

  s3Kicker: { lv: "03 — Piemērs", en: "03 — Worked example" },
  s3H: {
    lv: "Divi braucēji, divas stundas, identiska vidējā jauda",
    en: "Two riders, two hours, identical average power",
  },
  s3P: {
    lv: "Abi vidēji notur 200 W. Viens brauc vienmērīgi; otrs mija piecas minūtes ar 100 W un piecas minūtes ar 300 W.",
    en: "Both hold 200 W on average. One rides it steadily; the other alternates five minutes at 100 W with five minutes at 300 W.",
  },
  s3SvgLabelA: { lv: "Braucējs A — vienmērīgi", en: "Rider A — steady" },
  s3SvgLabelB: { lv: "Braucējs B — ar uzrāvieniem", en: "Rider B — surging" },
  s3SvgAp: { lv: "Vid.", en: "AP" },
  s3SvgNp: { lv: "NP", en: "NP" },
  s3SvgFootA: { lv: "Vid. 200 W · NP 200 W · VI 1,00", en: "AP 200 W · NP 200 W · VI 1.00" },
  s3SvgFootB: { lv: "Vid. 200 W · NP 253 W · VI 1,27", en: "AP 200 W · NP 253 W · VI 1.27" },
  s3SvgCaption: {
    lv: "Pelēkā punktētā līnija — vidējā jauda. Zilā punktētā — normalizētā jauda. Braucēja B uzrāvieni paceļ NP par 53 W virs aritmētiskā vidējā.",
    en: "Dashed grey: average power. Dashed blue: normalized power. Rider B's surges pull NP 53 W above the arithmetic mean.",
  },
  s3TCaption: { lv: "Vienāds vidējais, atšķirīga cena", en: "Same average, different cost" },
  s3TRows: {
    lv: [
      ["Vidējā jauda", "200 W", "200 W"],
      ["Normalizētā jauda", "200 W", "253 W"],
      ["Mainīguma indekss", "1,00", "1,27"],
      ["Relatīvā vielmaiņas cena", "bāzes līmenis", "≈ +26 %"],
      ["Nobrauktais attālums līdzenumā", "bāzes līmenis", "≈ par 3 % mazāk"],
    ],
    en: [
      ["Average power", "200 W", "200 W"],
      ["Normalized power", "200 W", "253 W"],
      ["Variability index", "1.00", "1.27"],
      ["Relative metabolic cost", "baseline", "≈ +26%"],
      ["Distance covered on the flat", "baseline", "≈ 3% less"],
    ],
  },
  s3TCols: { lv: ["Braucējs A", "Braucējs B"], en: ["Rider A", "Rider B"] },
  s3NoteH: { lv: "Tas, kas svarīgi garajā distancē", en: "The part that matters for long course" },
  s3NoteP1: {
    lv: "Braucējs B samaksā aptuveni ceturtdaļu vairāk vielmaiņas ziņā un nobrauc mazāk. Tā kā aerodinamiskā pretestība aug kubā no ātruma, papildu vati, kas iztērēti augstajos posmos, nopērk mazāk ātruma, nekā zemie posmi atdod. Mainīga braukšana ir sliktāka abās grāmatvedības pusēs.",
    en: "Rider B pays roughly a quarter more metabolically and travels slightly less far. Because aerodynamic drag rises with the cube of speed, the extra watts spent on the high blocks buy less speed than the low blocks give away. Variable riding is worse on both sides of the ledger.",
  },
  s3NoteP2: {
    lv: "Šis ir viss mehāniskais arguments par labu vienmērīgai Ironman braukšanai, un to var izteikt, nepieminot ne gribasspēku, ne disciplīnu.",
    en: "This is the entire mechanical argument for riding an Ironman steadily, and it can be stated without reference to willpower or discipline.",
  },
  s3RealH: { lv: "No šī cikla", en: "From this training cycle" },
  s3RealP: {
    lv: "Tas nav tikai teorija. 2026. gada 22. augustā, 67,5 km grupas braucienā Podersdorfas gatavošanās cikla pēdējā slodzes nedēļā, tā pati attiecība parādījās praksē — pretējā virzienā no uzrāviena piemēra augstāk.",
    en: "It isn't only theory. On 22 August 2026, on a 67.5 km group ride in the final load week before Podersdorf, the same relationship showed up in practice — in the opposite direction from the surging-rider example above.",
  },
  s3RealCaption: { lv: "Pirmā puse pret otro, reāls brauciens", en: "First half vs second half, a real ride" },
  s3RealCols: { lv: ["Pirmā puse", "Otrā puse"], en: ["First half", "Second half"] },
  s3RealRows: {
    lv: [
      ["Normalizētā jauda", "191 W", "213 W"],
      ["Vid. sirdsdarbība", "139,0", "141,7"],
      ["EF (NP/SF)", "1,371", "1,500"],
    ],
    en: [
      ["Normalized power", "191 W", "213 W"],
      ["Avg heart rate", "139.0", "141.7"],
      ["EF (NP/HR)", "1.371", "1.500"],
    ],
  },
  s3RealClose: {
    lv: "+9,4 % efektivitātes pieaugums otrajā pusē — divdesmit divi vati vairāk par tikai 2,7 papildu sirdspukstiem. Nevis nogurums, bet uzlabošanās — tieši tas paraugs, ko VI un decoupling skaitļi ir domāti pamanīt.",
    en: "A +9.4% efficiency gain in the second half — twenty-two more watts for just 2.7 more heartbeats. Not fatigue but improvement — exactly the pattern VI and decoupling are meant to catch.",
  },
  s3RealLink: {
    lv: "Pilnā analīze — 22. augusta sesija →",
    en: "Full analysis — the 22 August session →",
  },

  s4Kicker: { lv: "04 — Atvasinātie lielumi", en: "04 — Derived quantities" },
  s4H: { lv: "Ko normalizētā jauda baro", en: "What normalized power feeds" },
  s4P: {
    lv: "NP pati par sevi nav īpaši interesanta. Tās vērtība ir tajā, ka uz tās pamata tiek būvēti trīs praktiski skaitļi.",
    en: "NP on its own is not very interesting. Its value is that three practical numbers are built on top of it.",
  },
  s4TCaption: { lv: "Trīs uz NP balstītie rādītāji", en: "The three numbers built on NP" },
  s4TCols: { lv: ["Rādītājs", "Formula", "Uz ko tas atbild"], en: ["Metric", "Formula", "What it answers"] },
  s4TRows: {
    lv: [
      ["Intensitātes faktors", "IF = NP ÷ FTP", "Cik smagi tas bija attiecībā pret manu slieksni? Bezdimensijas lielums, tāpēc salīdzināms starp sportistiem un starp dienām."],
      ["Treniņa slodzes punkti", "TSS = h × IF² × 100", "Cik tas maksāja kopumā? Viena stunda sliekšņa līmenī pēc definīcijas = 100. Kvadrāts liek intensitātei dominēt pār ilgumu."],
      ["Mainīguma indekss", "VI = NP ÷ vid. jauda", "Cik vienmērīgi tas tika nobraukts? 1,00 ir ideāli vienmērīga piepūle — tempa kvalitātes skaitlis."],
    ],
    en: [
      ["Intensity Factor", "IF = NP ÷ FTP", "How hard was this relative to my threshold? Dimensionless, so it compares across athletes and across days."],
      ["Training Stress Score", "TSS = h × IF² × 100", "How much did it cost in total? One hour at threshold = 100 by definition. The squared term makes intensity dominate duration."],
      ["Variability Index", "VI = NP ÷ AP", "How evenly was it ridden? 1.00 is a perfectly steady effort — the pacing-quality number."],
    ],
  },
  s4Close: {
    lv: "Ironman velo posmam tieši VI ir tas, pēc kā vērtēt izpildījumu. Labi nobraukta līdzena trase iznāk ap 1,02–1,05. Jebkas ap 1,10 vai vairāk nozīmē, ka brauciens tika izbraukts fragmentos — kā virkne mazu piepūļu, saliktu kopā — un skrējiens tiks samaksāts no tā paša maka.",
    en: "For an Ironman bike leg, VI is the one to judge execution by. A well-ridden flat course comes in around 1.02–1.05. Anything at 1.10 or above means the ride was raced in fragments — a series of small efforts stitched together — and the run will be paid for out of that.",
  },

  s5Kicker: { lv: "05 — Ierobežojumi", en: "05 — Limits" },
  s5H: { lv: "Kur normalizētajai jaudai vairs nevar uzticēties", en: "Where normalized power stops being trustworthy" },
  s5Li: {
    lv: [
      "Tas ir modelis, nevis mērījums. 30 sekunžu logs un eksponents 4 ir empīriski pielāgojumi. Tie ir labi pielāgojumi, bet tie ir pielāgojumi.",
      "Tā uzpūš vieglos braucienus. Pusotra stunda 1. zonā ar trim sprintiem uzrādīs normalizēto jaudu, kurai nav nekāda sakara ne ar to, kā brauciens juties, ne ar to, ko tas maksāja.",
      "Tā ir neuzticama zem aptuveni divdesmit minūtēm. Par maz 30 sekunžu logu, lai vidējošana uzvestos korekti.",
      "Tā neko nezina par kontekstu. Karstums, augstums, hidratācija, uzturs, uzkrātais nogurums un miegs tai ir neredzami. Divi braucieni ar identisku NP var būt radikāli atšķirīga pieredze.",
    ],
    en: [
      "It is a model, not a measurement. The 30-second window and the exponent 4 are empirical fits. They are good fits, but they are fits.",
      "It inflates easy rides. Ninety minutes in zone 1 with three sprints in it will report a normalized power that bears no relation to how the ride felt or what it cost.",
      "It is unreliable under about twenty minutes. Too few 30-second windows for the averaging to behave.",
      "It knows nothing about context. Heat, altitude, hydration, fuelling, accumulated fatigue and sleep are all invisible to it. Two rides with identical NP can be radically different experiences.",
    ],
  },
  s5P: {
    lv: "Divi uzlabojumi, par kuriem vērts zināt: xPower (Filips Skība) plakanā slīdošā vidējā vietā izmanto 25 sekunžu eksponenciāli svērto vidējo, kas labāk tiek galā ar strauji mainīgu braukšanu. W′bal reāllaikā modelē anaerobās darba kapacitātes izsīkšanu un atjaunošanos, un tas ir tiešāks muskulārās rezerves rādītājs, nekā NP — kas ir vielmaiņas vidējā vērtība — jebkad varēs būt.",
    en: "Two refinements worth knowing about: xPower (Philip Skiba) uses a 25-second exponentially-weighted average instead of a flat rolling one, which handles rapidly variable riding better. W′bal models the depletion and reconstitution of anaerobic work capacity in real time, and is a more direct read on muscular reserve than NP — which is a metabolic-average number — will ever be.",
  },

  s6Kicker: { lv: "06 — Salīdzinājums", en: "06 — Comparison" },
  s6H: { lv: "Jauda un pulss blakus", en: "Power and heart rate, side by side" },
  s6TCols: { lv: ["Jauda", "Pulss"], en: ["Power", "Heart rate"] },
  s6TRows: {
    lv: [
      ["Ko mēra", "Ārējo darba tempu", "Iekšējo cenu par tā radīšanu"],
      ["Atbildes aizture", "Nav", "30–90 s"],
      ["Dreifs 5 h laikā pie nemainīgas piepūles", "Nav", "+5–10 sit./min"],
      ["Karstuma un dehidratācijas ietekme", "Nav", "Spēcīga"],
      ["Miega, stresa, kofeīna, slimības ietekme", "Nav", "Ir"],
      ["Pārvēršas kJ → ogļhidrātu vajadzībā", "Tieši", "Tikai aptuveni"],
      ["Var noturēt griestus reāllaikā", "Jā", "Nē — aizture to sagrauj"],
      ["Parāda, kā tu tiec galā", "Nē", "Jā"],
      ["Prasa kalibrētu, uzticamu ierīci", "Jā — kritiski", "Mazāk"],
    ],
    en: [
      ["Measures", "External work rate", "Internal cost of producing it"],
      ["Response lag", "None", "30–90 s"],
      ["Drift over 5 h at constant effort", "None", "+5–10 bpm"],
      ["Affected by heat & dehydration", "No", "Strongly"],
      ["Affected by sleep, stress, caffeine, illness", "No", "Yes"],
      ["Converts to kJ → carbohydrate need", "Directly", "Only crudely"],
      ["Can enforce a ceiling in real time", "Yes", "No — the lag defeats it"],
      ["Tells you how you are coping", "No", "Yes"],
      ["Requires a calibrated, trusted device", "Yes — critically", "Less so"],
    ],
  },
  s6DoctrineH: { lv: "Pamatprincips", en: "The doctrine" },
  s6DoctrineQuote: { lv: "Jauda uzraksta plānu. Pulss to pārbauda.", en: "Power writes the plan. Heart rate audits it." },
  s6DoctrineP1: {
    lv: "Brauc pēc jaudas mērķa, jo tas ir vienīgais skaitlis, kas var apturēt uzrāvienu, pirms par to ir samaksāts — brīdī, kad pulss atspoguļo piepūli, glikogēns jau ir iztērēts. Bet turi pulsu redzeslokā kā veto, jo tas ir vienīgais skaitlis, kas spēj saskatīt karstumu, dehidratāciju, nepietiekamu uzturu un vienkārši sliktu dienu.",
    en: "Ride to a power target because it is the only number that can stop a surge before it is paid for — by the time heart rate reflects an effort, the glycogen is already spent. But keep heart rate in view as the veto, because it is the only number that can see heat, dehydration, under-fuelling and a bad day.",
  },
  s6DoctrineP2: {
    lv: "Viens svarīgs izņēmums: ja jaudas mērītāja precizitāte nav pārbaudīta, pulss pēc noklusējuma kļūst par galveno instrumentu. Mērītājs, kas rāda par 10 % par maz, ļaus sportistam noturēt šķietami atbilstošu skaitli, vienlaikus radot intensitāti, kas beidz sacensības — un displejs visu ceļu uzstās, ka plāns tiek ievērots. Nekalibrēts jaudas mērītājs ir sliktāks par jaudas mērītāja neesamību, jo tas kļūdās pārliecinoši.",
    en: "One important exception: if the power meter's accuracy is unverified, heart rate becomes the primary instrument by default. A meter reading 10% low will let an athlete hold what looks like a compliant number while producing an intensity that ends the race — and the display will insist the plan is being followed the whole way. An uncalibrated power meter is worse than no power meter, because it is confidently wrong.",
  },

  s7Kicker: { lv: "07 — Sacensībās", en: "07 — In the race" },
  s7H: { lv: "Ko patiesībā vērot velo posmā", en: "What to actually watch on the bike leg" },
  s7P: {
    lv: "Iestati datoru tā, lai šie lauki būtu redzami bez ritināšanas. Trīs sekunžu jauda ir pārāk raustīga, lai pēc tās noturētu tempu, un apļa vidējā jauda dreifē, kad aplis kļūst garš; 30 sekunžu slīdošais vidējais ir lauks, kas vislabāk atbilst fizioloģijai.",
    en: "Configure the head unit so these are visible without scrolling. Three-second power is too twitchy to pace by and lap-average power drifts as the lap gets long; a 30-second rolling average is the field that best matches the physiology.",
  },
  s7Panel: {
    lv: [
      { k: "Galvenais lauks", v: "30 s jauda", s: "Tempa skaitlis. Pietiekami gluds, lai noturētu; pietiekami atsaucīgs, lai pieķertu uzrāvienu." },
      { k: "Griesti", v: "Pulsa limits", s: "Ciets skaitlis, noteikts iepriekš. Pārsniegšana nozīmē samazināt jaudu — neatkarīgi no tā, ko rāda vati." },
      { k: "Izpildījuma kvalitāte", v: "VI", s: "Mērķis 1,02–1,05 līdzenās trasēs. Pārbaudi katrā aplī vai barošanās punktā." },
      { k: "Uzturs", v: "kJ", s: "Kopējais paveiktais darbs. Aptuveni 1 kJ ≈ 1 kcal, kas pārvērš uzturu no minēšanas par aritmētiku." },
    ],
    en: [
      { k: "Primary field", v: "30 s power", s: "The pacing number. Smooth enough to hold, responsive enough to catch a surge." },
      { k: "Ceiling", v: "HR cap", s: "A hard number, set in advance. Crossing it means back off the power, regardless of what the watts say." },
      { k: "Execution quality", v: "VI", s: "Target 1.02–1.05 on flat courses. Check it at each lap or feed zone." },
      { k: "Fuelling", v: "kJ", s: "Total work done. Roughly 1 kJ ≈ 1 kcal expended, which turns fuelling from guesswork into arithmetic." },
    ],
  },
  s7ReadH: { lv: "Kā lasīt abus kopā", en: "Reading the two together" },
  s7ReadP: {
    lv: "Informācija nav nevienā skaitlī atsevišķi — tā ir attiecībās starp tiem un tajā, kā šīs attiecības mainās stundu gaitā.",
    en: "The information is not in either number alone — it is in the relationship between them, and how that relationship changes over the hours.",
  },
  s7Flags: {
    lv: [
      { sig: "Augsts pulss pie mērķa jaudas, pirmajā stundā", mean: "Sākts pārāk smagi, jau ir karsti, vai trūkst miega.", rest: " Samazini jaudu tūlīt — šī ir lētākā korekcija, kas visu dienu ir pieejama, un tā, kuru visretāk izdara." },
      { sig: "Pulss kāpj pie nemainīgas jaudas, 3.–5. stundā", mean: "Sirdsdarbības dreifs.", rest: " Līdz zināmai robežai normāli. Ja tas paātrinās, parasti vainīgs ir karstums un šķidruma zudums, nevis sagatavotība — risini hidratāciju un nātriju, drīzāk nedaudz nogriez jaudu, nekā dzenies pakaļ pulsa skaitlim." },
      { sig: "Pulss vairs neceļas līdz mērķa jaudai, vēlīnā posmā", mean: "Nopietnākais gadījums.", rest: " Dreifs uz leju nozīmē dziļu nogurumu, glikogēna izsīkumu vai gremošanas/termoregulācijas atteices sākumu. Tā nav atļauja spiest stiprāk — tas ir signāls ēst un pasargāt skrējienu." },
      { sig: "VI kāpj virs 1,10", mean: "Trase vai satiksme brauc sportistu, nevis otrādi.", rest: " Parasti tā ir paātrināšanās izejot no pagriezieniem, pārāk smaga uzkalniņu pārvarēšana vai reaģēšana uz citiem braucējiem. Labojams reāllaikā, un ir vērts labot." },
    ],
    en: [
      { sig: "HR high at target power, hour 1", mean: "Started too hard, already hot, or under-slept.", rest: " Reduce power now — the cheapest correction available all day, and the least often made." },
      { sig: "HR climbing at constant power, h3–5", mean: "Cardiac drift.", rest: " Normal to a point. If it is accelerating, it is usually heat and fluid loss, not fitness — address hydration and sodium, trim power slightly rather than chasing the HR number down." },
      { sig: "HR won't rise to target power, late", mean: "The serious one.", rest: " Downward decoupling means deep fatigue, glycogen depletion, or the early stages of GI or thermal failure. Not a licence to push harder — a signal to fuel and protect the run." },
      { sig: "VI climbing above 1.10", mean: "The course or the traffic is riding you.", rest: " Usually accelerating out of turns, cresting rises too hard, or reacting to other riders. Fixable in real time, and worth fixing." },
    ],
  },
  s7AfterH: { lv: "Pēc tam", en: "Afterwards" },
  s7AfterP: {
    lv: "Četri skaitļi padara velo posmu izvērtējamu: NP un IF — cik tas maksāja, VI — cik labi tika noturēts temps, aerobā atsaiste (jaudas un pulsa attiecības izmaiņas starp pirmo un otro pusi — zem 5 % liecina, ka intensitāte bija aerobi noturama) un kJ pret apēstajiem ogļhidrātu gramiem — vienīgais godīgais veids, kā pārbaudīt uztura plānu.",
    en: "Four numbers make a bike leg reviewable: NP and IF (what it cost), VI (how well it was paced), aerobic decoupling (change in power:HR between first and second halves — under 5% means the intensity was aerobically sustainable), and kJ against grams of carbohydrate consumed — the only honest audit of a fuelling plan.",
  },
  close: {
    lv: "Jaudas mērītājs pasaka, ko tu izdarīji. Pulsometrs pasaka, vai tu vari to turpināt darīt. Ironman tiek zaudēts, ignorējot otro pirmajās četrās stundās.",
    en: "The power meter tells you what you did. The heart rate monitor tells you whether you can keep doing it. An Ironman is lost by ignoring the second one for the first four hours.",
  },
  sources: {
    lv: "Normalizētā jauda, IF un TSS: Coggan & Allen, Training and Racing with a Power Meter. xPower: Skiba.",
    en: "Normalized power, IF and TSS: Coggan & Allen, Training and Racing with a Power Meter. xPower: Skiba.",
  },
} as const;

function Instruments({ lang }: { lang: "lv" | "en" }) {
  return (
    <div className="ref-two">
      <div>
        <h4>{T.s1PowerTag[lang]}</h4>
        <p style={{ fontWeight: 700 }}>{T.s1PowerH[lang]}</p>
        <p>{T.s1PowerP[lang]}</p>
      </div>
      <div>
        <h4>{T.s1HrTag[lang]}</h4>
        <p style={{ fontWeight: 700 }}>{T.s1HrH[lang]}</p>
        <p>{T.s1HrP[lang]}</p>
      </div>
    </div>
  );
}

function ExampleSvg({ lang }: { lang: "lv" | "en" }) {
  return (
    <figure className="art-fig">
      <svg
        className="ref-svg"
        viewBox="0 0 700 250"
        role="img"
        aria-label={T.s3SvgCaption[lang]}
      >
        <text x="40" y="20" fontSize="12.5" fontWeight={600} fill="var(--ink)">{T.s3SvgLabelA[lang]}</text>
        <text x="390" y="20" fontSize="12.5" fontWeight={600} fill="var(--ink)">{T.s3SvgLabelB[lang]}</text>
        <line x1="40" y1="190" x2="330" y2="190" stroke="var(--hair)" />
        <line x1="40" y1="30" x2="330" y2="30" stroke="var(--hair)" />
        <line x1="390" y1="190" x2="680" y2="190" stroke="var(--hair)" />
        <line x1="390" y1="30" x2="680" y2="30" stroke="var(--hair)" />
        <line x1="40" y1="110" x2="330" y2="110" stroke="var(--ink-soft)" strokeWidth={1.5} strokeDasharray="5 4" />
        <line x1="390" y1="110" x2="680" y2="110" stroke="var(--ink-soft)" strokeWidth={1.5} strokeDasharray="5 4" />
        <line x1="390" y1="88.8" x2="680" y2="88.8" stroke="var(--w, #c8401f)" strokeWidth={1.5} strokeDasharray="2 3" />
        <path d="M40,110 H330" stroke="var(--w, #c8401f)" strokeWidth={2.5} fill="none" strokeLinejoin="round" />
        <path d="M390,150 H438 V70 H486 V150 H535 V70 H583 V150 H631 V70 H680" stroke="var(--w, #c8401f)" strokeWidth={2.5} fill="none" strokeLinejoin="round" />
        <text x="40" y="207" fontSize="11" fill="var(--ink-soft)">0 W</text>
        <text x="40" y="224" fontSize="11" fill="var(--ink-soft)">{T.s3SvgFootA[lang]}</text>
        <text x="390" y="207" fontSize="11" fill="var(--ink-soft)">0 W</text>
        <text x="390" y="224" fontSize="11" fill="var(--ink-soft)">
          {T.s3SvgFootB[lang].split("NP")[0]}
          <tspan fill="var(--w, #c8401f)">NP{T.s3SvgFootB[lang].split("NP")[1]}</tspan>
        </text>
        <text x="336" y="113" fontSize="11" fill="var(--ink-soft)">{T.s3SvgAp[lang]}</text>
        <text x="686" y="113" fontSize="11" fill="var(--ink-soft)">{T.s3SvgAp[lang]}</text>
        <text x="686" y="92" fontSize="11" fill="var(--w, #c8401f)">{T.s3SvgNp[lang]}</text>
      </svg>
      <figcaption><span>{T.s3SvgCaption[lang]}</span></figcaption>
    </figure>
  );
}

export default function WattsVsBeats() {
  const { lang } = useLang();

  return (
    <>
      <div className="art-crumb">
        <span>
          <Link href="/">{T.crumbAtlas[lang]}</Link> —{" "}
          <Link href="/triatlons">{T.crumbTerritory[lang]}</Link> — {T.crumbBack[lang]}
        </span>
      </div>

      <header className="art-head">
        <div className="art-sheetno">{T.sheetNo[lang]}</div>
        <h1 className="art-title">{T.title[lang]}</h1>
        <p className="art-title-en">{T.sub[lang]}</p>
        <p className="art-lede">{T.lede[lang]}</p>
      </header>

      <div className="art-body">
        <h2><span className="n">{T.s1Kicker[lang]}</span>{T.s1H[lang]}</h2>
        <p>{T.s1P[lang]}</p>
        <Instruments lang={lang} />
        <p style={{ marginTop: "22px" }}>{T.s1Close[lang]}</p>

        <h2><span className="n">{T.s2Kicker[lang]}</span>{T.s2H[lang]}</h2>
        <p>{T.s2P1[lang]}</p>
        <p>{T.s2P2[lang]}</p>
        <h3>{T.s2StepsH[lang]}</h3>
        <ol>
          {T.s2Steps[lang].map((s) => <li key={s}>{s}</li>)}
        </ol>
        <div className="ref-formula">
          <span className="cap">{T.s2FormulaCap[lang]}</span>
          NP = ( {lang === "lv" ? "vid." : "mean"}[ roll<sub>30s</sub>(P)<sup>4</sup> ] )<sup>1/4</sup>
        </div>
        <h3>{T.s2Why30H[lang]}</h3>
        <p>{T.s2Why30P[lang]}</p>
        <h3>{T.s2Why4H[lang]}</h3>
        <p>{T.s2Why4P1[lang]}</p>
        <p>{T.s2Why4P2[lang]}</p>

        <h2><span className="n">{T.s3Kicker[lang]}</span>{T.s3H[lang]}</h2>
        <p>{T.s3P[lang]}</p>
        <ExampleSvg lang={lang} />
        <div className="art-tw">
          <table className="art-t">
            <caption>{T.s3TCaption[lang]}</caption>
            <thead>
              <tr><th /><th>{T.s3TCols[lang][0]}</th><th>{T.s3TCols[lang][1]}</th></tr>
            </thead>
            <tbody>
              {T.s3TRows[lang].map((r) => (
                <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="art-note">
          <div className="lbl">{T.s3NoteH[lang]}</div>
          <p>{T.s3NoteP1[lang]}</p>
          <p>{T.s3NoteP2[lang]}</p>
        </div>

        <h3>{T.s3RealH[lang]}</h3>
        <p>{T.s3RealP[lang]}</p>
        <div className="art-tw">
          <table className="art-t">
            <caption>{T.s3RealCaption[lang]}</caption>
            <thead>
              <tr><th /><th>{T.s3RealCols[lang][0]}</th><th>{T.s3RealCols[lang][1]}</th></tr>
            </thead>
            <tbody>
              {T.s3RealRows[lang].map((r) => (
                <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          {T.s3RealClose[lang]}
          <br />
          <Link href="/triatlons/2026-08-22-nulle-decoupling-nulle-natrijs">{T.s3RealLink[lang]}</Link>
        </p>

        <h2><span className="n">{T.s4Kicker[lang]}</span>{T.s4H[lang]}</h2>
        <p>{T.s4P[lang]}</p>
        <div className="art-tw">
          <table className="art-t">
            <caption>{T.s4TCaption[lang]}</caption>
            <thead>
              <tr>
                <th>{T.s4TCols[lang][0]}</th><th>{T.s4TCols[lang][1]}</th><th>{T.s4TCols[lang][2]}</th>
              </tr>
            </thead>
            <tbody>
              {T.s4TRows[lang].map((r) => (
                <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>{T.s4Close[lang]}</p>

        <h2><span className="n">{T.s5Kicker[lang]}</span>{T.s5H[lang]}</h2>
        <ul>
          {T.s5Li[lang].map((li) => <li key={li}>{li}</li>)}
        </ul>
        <p>{T.s5P[lang]}</p>

        <h2><span className="n">{T.s6Kicker[lang]}</span>{T.s6H[lang]}</h2>
        <div className="art-tw">
          <table className="art-t">
            <caption>{lang === "lv" ? "Katra instrumenta īpašības" : "Properties of each instrument"}</caption>
            <thead>
              <tr><th /><th>{T.s6TCols[lang][0]}</th><th>{T.s6TCols[lang][1]}</th></tr>
            </thead>
            <tbody>
              {T.s6TRows[lang].map((r) => (
                <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="art-note">
          <div className="lbl">{T.s6DoctrineH[lang]}</div>
          <p style={{ fontWeight: 700 }}>{T.s6DoctrineQuote[lang]}</p>
          <p>{T.s6DoctrineP1[lang]}</p>
          <p>{T.s6DoctrineP2[lang]}</p>
        </div>

        <h2><span className="n">{T.s7Kicker[lang]}</span>{T.s7H[lang]}</h2>
        <p>{T.s7P[lang]}</p>
      </div>

      <div className="art-band">
        {T.s7Panel[lang].map((c) => (
          <div key={c.k}>
            <div className="k">{c.k}</div>
            <div className="v">{c.v}</div>
            <div className="s">{c.s}</div>
          </div>
        ))}
      </div>

      <div className="art-body" style={{ paddingTop: "40px" }}>
        <h3 style={{ marginTop: 0 }}>{T.s7ReadH[lang]}</h3>
        <p>{T.s7ReadP[lang]}</p>
        <div className="ref-flags">
          {T.s7Flags[lang].map((f) => (
            <div key={f.sig}>
              <span className="sig">{f.sig}</span>
              <span className="mean"><b>{f.mean}</b>{f.rest}</span>
            </div>
          ))}
        </div>
        <h3>{T.s7AfterH[lang]}</h3>
        <p>{T.s7AfterP[lang]}</p>
        <p className="ref-close">{T.close[lang]}</p>

        <div className="art-foot">
          <p>{T.sources[lang]}</p>
        </div>
      </div>
    </>
  );
}
