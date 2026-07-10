"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS, whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // The homepage is a dark, cinematic experience - the nav floats transparently
  // over the hero and turns into a solid onyx bar once you scroll (or open the
  // menu). Chrome stays light-on-dark throughout on home.
  const isHome = usePathname() === "/";
  const solid = scrolled || open;

  // Sticky nav changes background on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll + close on Escape when the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isHome
          ? solid
            ? "border-b border-white/10 bg-onyx/95 shadow-lg backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
          : scrolled
          ? "border-b border-hairline bg-paper/90 shadow-card backdrop-blur-md"
          : "border-b border-transparent bg-paper/60 backdrop-blur-sm"
      )}
    >
      <nav className="container-mp flex h-16 items-center justify-between gap-4">
        <Logo invert={isHome} />

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isHome ? "text-paper/75 hover:text-paper" : "text-ink/75 hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Button href={whatsappLink("Hi Musicphonetics, I'd like to book a free trial class.")} external size="md" variant="primary">
            Book a free trial
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full border lg:hidden",
            isHome ? "border-white/20 text-paper" : "border-hairline text-ink"
          )}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile slide-down sheet */}
      <div
        className={cn(
          "overflow-hidden border-t transition-[max-height] duration-300 lg:hidden",
          isHome ? "border-white/10 bg-onyx" : "border-hairline bg-paper",
          open ? "max-h-[80vh]" : "max-h-0 border-t-transparent"
        )}
      >
        <div className="container-mp flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-xl px-3 py-3 text-base font-medium",
                isHome ? "text-paper/80 hover:bg-white/5 hover:text-paper" : "text-ink/80 hover:bg-mist hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 px-1">
            <Button href={whatsappLink("Hi Musicphonetics, I'd like to book a free trial class.")} external fullWidth size="lg" variant="primary">
              Book a free trial
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
