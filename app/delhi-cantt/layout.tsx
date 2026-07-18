import type { Metadata } from "next";

// Rich WhatsApp / Open Graph preview when the link is pasted into a group.
export const metadata: Metadata = {
  title: "Delhi Cantt Music Lessons Offer | Musicphonetics",
  description:
    "Save ₹2,000 on the Musicphonetics Main Pathway for new learners in Delhi Cantt. Get 8 structured music classes every month.",
  alternates: { canonical: "/delhi-cantt" },
  openGraph: {
    type: "website",
    url: "https://musicphonetics.com/delhi-cantt",
    title: "Delhi Cantt Music Lessons Offer | Musicphonetics",
    description:
      "Save ₹2,000 on the Musicphonetics Main Pathway for new learners in Delhi Cantt. 8 structured classes every month.",
    images: [{ url: "/og-delhi-cantt.png", width: 1200, height: 630, alt: "Musicphonetics — Delhi Cantt launch benefit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delhi Cantt Music Lessons Offer | Musicphonetics",
    description:
      "Save ₹2,000 on the Musicphonetics Main Pathway for new learners in Delhi Cantt. 8 structured classes every month.",
    images: ["/og-delhi-cantt.png"],
  },
};

export default function DelhiCanttLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink">{children}</div>;
}
