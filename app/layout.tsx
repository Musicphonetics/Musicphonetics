import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd, OG_ORIGIN } from "@/lib/seo";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const OG_IMAGE = `${OG_ORIGIN}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL("https://musicphonetics.com"),
  title: {
    default:
      "Musicphonetics - Structured, faculty-led music classes in Delhi NCR (home & online)",
    template: "%s · Musicphonetics",
  },
  description:
    "Structured, faculty-led music classes across Delhi NCR - guitar, piano, keyboard, vocals & more, at home or online. Book a free trial; we reply immediately.",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Teacher OS" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  openGraph: {
    title: "Music education, built like an institution.",
    description:
      "Structured, faculty-led music classes across Delhi NCR - at home and online. Book a free trial, no commitment.",
    type: "website",
    siteName: "Musicphonetics",
    locale: "en_IN",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Musicphonetics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Music education, built like an institution.",
    description:
      "Structured, faculty-led music classes across Delhi NCR - at home and online.",
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#161B26",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {/* Preload the first hero image so it's ready the instant the intro
            flash lifts - critical for the reel-first opening. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preload" as="image" href="/images/hero/slide-1.webp" fetchPriority="high" />
        {/* Mark that JS is available so scroll-reveal styles apply; without this
            (JS disabled/blocked) content renders fully visible, never blank. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {/* Register the Teacher OS service worker (PWA offline shell). */}
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}" }} />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
