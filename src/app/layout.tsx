import type { Metadata, Viewport } from "next";
/* self-hosted fonts (no runtime Google Fonts dependency) */
import "@fontsource-variable/archivo/index.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pugulis.com"),
  title: "Jānis Pūgulis — Personīgais Atlants",
  description:
    "Viena dzīve · daudzas teritorijas. Jāņa Pūguļa personīgais atlants — ceļojumi, triatlons, velo ekspedīcijas, snovbords, Baltais Kalns, SK Rajons un tehnoloģijas vienā kartē.",
  openGraph: {
    title: "Jānis Pūgulis — Personīgais Atlants",
    description:
      "Viena dzīve · daudzas teritorijas — one life, many territories.",
    url: "https://pugulis.com",
    siteName: "Personīgais Atlants",
    locale: "lv_LV",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4EFE6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="lv">
      <head>
        {/* gate reveal-on-scroll styles so content is visible without JS */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
