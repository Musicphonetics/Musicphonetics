import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "@/styles/globals.css";

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
    default: "Musicphonetics — Structured music education in Delhi NCR",
    template: "%s · Musicphonetics",
  },
  description:
    "Premium, director-led music education across Delhi NCR. Personal one-to-one home and online classes, with a structured method built for serious learners and families.",
  keywords: [
    "music classes Delhi NCR",
    "music education",
    "guitar lessons",
    "piano lessons",
    "Trinity preparation",
    "Musicphonetics",
  ],
  openGraph: {
    title: "Musicphonetics — Structured music education in Delhi NCR",
    description:
      "Personal, director-led music education. Home, online, and future academy pathways.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
