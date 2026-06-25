import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Portal",
  description: "Musicphonetics operating dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-mist">{children}</div>;
}
