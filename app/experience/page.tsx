import type { Metadata } from "next";
import { ExperienceDeck } from "@/components/deck/ExperienceDeck";

export const metadata: Metadata = { title: "Musicphonetics · The Experience", robots: { index: false } };

export default function ExperiencePage() {
  return <ExperienceDeck />;
}
