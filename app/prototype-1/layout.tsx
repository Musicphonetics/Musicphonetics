import type { Metadata } from "next";

// Prototype 1 is an internal investor-demo surface: keep it out of search
// indexes and sitemaps. It touches no production data.
export const metadata: Metadata = {
  title: "Prototype 1 — Ecosystem demo",
  robots: { index: false, follow: false },
};

export default function Prototype1Layout({ children }: { children: React.ReactNode }) {
  return children;
}
