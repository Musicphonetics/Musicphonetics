import type { Metadata } from "next";

// The new authenticated application (Phase 1 shell). Kept out of search indexes
// while in preview. Coexists with the existing portals; does not replace them.
export const metadata: Metadata = {
  title: "Musicphonetics — App",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
