export default function Footer() {
  return (
    <footer className="site-footer" id="kontakti">
      <div className="foot-grid">
        <div>
          <div className="h">Teritorijas tīklā</div>
          <a href="https://jptravel.pugulis.com/" target="_blank" rel="noopener">
            jptravel.pugulis.com ↗
          </a>
          <br />
          <a href="https://skr.lv/" target="_blank" rel="noopener">
            skr.lv ↗
          </a>
          <br />
          <a
            href="https://jpsnowboard.vercel.app/"
            target="_blank"
            rel="noopener"
          >
            jpsnowboard ↗
          </a>
          <br />
          <a
            href="https://www.baltaiskalns.lv/"
            target="_blank"
            rel="noopener"
          >
            baltaiskalns.lv ↗
          </a>
          <br />
          <a
            href="https://v0-ski-and-snowboard-landing-page.vercel.app/"
            target="_blank"
            rel="noopener"
          >
            Inventāra serviss ↗
          </a>
        </div>
        <div>
          <div className="h">Atlants</div>
          <a href="#saturs">Saturs</a>
          <br />
          <a href="#jaunakais">Jaunākie maršruti</a>
          <br />
          <span className="muted">Par atlantu (izstrādē)</span>
        </div>
        <div>
          <div className="h">Kontakti</div>
          <a href="mailto:pugulis@gmail.com">pugulis@gmail.com</a>
        </div>
        <div>
          <div className="h">Kolofons</div>
          <span>Salikts ar Archivo un IBM Plex Mono</span>
          <br />
          <span>Maršruti — Strava GPX arhīvs</span>
          <br />
          <span>© Jānis Pūgulis, 2026</span>
        </div>
      </div>
      <div className="colophon">
        <span>Personīgais Atlants — v1.1</span>
        <span>
          <sup>*</sup> Paraugdati — tiks aizstāti ar reāliem
        </span>
      </div>
    </footer>
  );
}
