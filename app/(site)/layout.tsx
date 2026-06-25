import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileWhatsAppButton } from "@/components/layout/MobileWhatsAppButton";
import { Loader } from "@/components/ui/Loader";
import { CursorGlow } from "@/components/ui/CursorGlow";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Loader />
      <CursorGlow />
      <Navbar />
      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <main id="main" className="pt-16">
        {children}
      </main>
      <Footer />
      <MobileWhatsAppButton />
    </>
  );
}
