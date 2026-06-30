import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://musicphonetics.com"),
  title: {
    default:
      "Musicphonetics — Structured music classes in India, online & home",
    template: "%s · Musicphonetics",
  },
  description:
    "An education-first music company founded in India. Structured, director-led guitar, piano, keyboard, vocal and music-theory classes — home and online — across Delhi NCR and beyond, with Trinity, ABRSM and Rockschool exam preparation.",
  keywords: [
    "music classes in India",
    "online music classes",
    "home music classes",
    "guitar classes",
    "piano classes",
    "keyboard classes",
    "vocal classes",
    "music classes for kids",
    "music classes for adults",
    "Trinity music exam preparation",
    "ABRSM preparation",
    "Rockschool preparation",
    "music classes in Delhi NCR",
    "global online music lessons",
    "Musicphonetics",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Musicphonetics — Building the future of music education",
    description:
      "Founded in India. Teaching across cities. Expanding globally. Structured, director-led music classes — home and online.",
    type: "website",
    siteName: "Musicphonetics",
    locale: "en_IN",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Musicphonetics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Musicphonetics — Building the future of music education",
    description:
      "Founded in India. Teaching across cities. Expanding globally.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
