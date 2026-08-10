import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trial Portal",
  description: "Your Musicphonetics trial journey.",
  robots: { index: false, follow: false },
};

export default function TrialLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink text-paper">{children}</div>;
}
