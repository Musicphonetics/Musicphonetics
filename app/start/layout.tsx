import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find your teacher",
  description:
    "Find your perfect Musicphonetics music teacher in 30 seconds — a guided, one-question-at-a-time match for guitar, piano, keyboard, vocals, or ukulele.",
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-ink">{children}</div>;
}
