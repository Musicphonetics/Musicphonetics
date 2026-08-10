import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Trial Studio",
  description:
    "Your personal Musicphonetics Trial Studio — tell us the songs you dream of playing and get an instant, personalised plan: the chords, the classes, and the date you'll be playing them.",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink text-paper">{children}</div>;
}
