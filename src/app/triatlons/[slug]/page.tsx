import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SheetHead from "@/components/SheetHead";
import SheetBody from "@/components/sheet/SheetBody";
import { getSheet, getSlugs } from "@/lib/sheets";

const INK = "#C8401F";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = getSheet(slug);
  if (!s) return {};
  const cover = s.cover ? `${s.mediaBase}/${s.cover}` : undefined;
  return {
    title: `${s.titleLv} — ${s.subtitleLv}`,
    description: s.description,
    openGraph: {
      title: s.titleLv,
      description: s.ogDescription,
      url: `https://pugulis.com/triatlons/${s.slug}`,
      siteName: "Personīgais Atlants",
      locale: "lv_LV",
      type: "article",
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
  };
}

export default async function SheetPage({ params }: Params) {
  const { slug } = await params;
  const s = getSheet(slug);
  if (!s) notFound();

  return (
    <>
      <Nav sub />
      <article className="art-wrap" style={{ "--w": INK } as React.CSSProperties}>
        <SheetHead
          sheet={s.sheet}
          crumbNote={s.crumbNote}
          titleLv={s.titleLv}
          subtitleLv={s.subtitleLv}
          subtitleEn={s.subtitleEn}
          lede={s.lede}
        />

        {s.band.length > 0 && (
          <div className="art-band">
            {s.band.map((b) => (
              <div key={b.k}>
                <div className="k">{b.k}</div>
                <div className="v">{b.v}</div>
                <div className="s">{b.s}</div>
              </div>
            ))}
          </div>
        )}

        <div className="art-body">
          <SheetBody body={s.body} base={s.mediaBase} />
        </div>
      </article>
      <Footer />
    </>
  );
}
