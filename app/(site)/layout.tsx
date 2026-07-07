import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Loader } from "@/components/ui/Loader";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { StickyTrialBar } from "@/components/layout/StickyTrialBar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Skip link - first focusable element for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Loader />
      <CursorGlow />
      <Navbar />
      <main id="main" className="pt-16">
        {children}
      </main>
      <Footer />
      <StickyTrialBar />
    </>
  );
}
