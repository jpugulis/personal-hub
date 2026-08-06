"use client";

import LangSwitch from "@/components/LangSwitch";
import { useLang } from "@/components/LangProvider";
import { ui } from "@/lib/i18n";

export default function Footer() {
  const { lang } = useLang();

  return (
    <footer className="site-footer" id="kontakti">
      <div className="foot-grid">
        <div>
          <div className="h">{ui.footNetwork[lang]}</div>
          <a href="https://jptravel.pugulis.com/" target="_blank" rel="noopener">
            jptravel.pugulis.com ↗
          </a>
          <br />
          <a href="https://cycling.pugulis.com/" target="_blank" rel="noopener">
            cycling.pugulis.com ↗
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
            {ui.footServiceLink[lang]}
          </a>
        </div>
        <div>
          <div className="h">{ui.footAtlas[lang]}</div>
          <a href="#saturs">{ui.navContents[lang]}</a>
          <br />
          <a href="#jaunakais">{ui.footLatest[lang]}</a>
          <br />
          <span className="muted">{ui.footAbout[lang]}</span>
        </div>
        <div>
          <div className="h">{ui.footContact[lang]}</div>
          <a href="mailto:pugulis@gmail.com">pugulis@gmail.com</a>
        </div>
        <div>
          <div className="h">{ui.footColophon[lang]}</div>
          <span>{ui.footSetIn[lang]}</span>
          <br />
          <span>{ui.footRoutes[lang]}</span>
          <br />
          <span>{ui.footRights[lang]}</span>
        </div>
      </div>
      <div className="colophon">
        <span>{ui.colophonVersion[lang]}</span>
        <LangSwitch place="foot" />
        <span>{ui.colophonMapped[lang]}</span>
      </div>
    </footer>
  );
}
