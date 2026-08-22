/**
 * Evergreen knowledge articles under /triatlons/atsauces/<slug> — background
 * reading, not dated training-day sheets (see content/README.md for those).
 * Each entry needs a matching route at src/app/triatlons/atsauces/<slug>/.
 */
export interface ReferenceArticle {
  slug: string;
  titleLv: string;
  titleEn: string;
  subtitleLv: string;
  subtitleEn: string;
}

export const REFERENCES: ReferenceArticle[] = [
  {
    slug: "jauda-pret-pulsu",
    titleLv: "Jauda pret pulsu",
    titleEn: "Watts vs beats",
    subtitleLv: "Garās distances tempa atsauce",
    subtitleEn: "Long-course pacing reference",
  },
];
