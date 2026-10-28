import type { Metadata } from "next";

// Standalone practice app — a separate build, independent of the main site and
// the existing portals. Kept out of search indexes while it's being trialled.
export const metadata: Metadata = {
  title: "Musicphonetics — Practice",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
