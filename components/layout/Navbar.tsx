"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { NAV_LINKS, whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

const TRIAL = whatsappLink("Hi Musicphonetics, I'd like to book a free trial class.");

// Institution nav: transparent (dark ink) over the light home hero, solid
// charcoal on scroll. Right cluster is a quiet "Parent login" link + the action.
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Transparent only over the light home hero; solid charcoal elsewhere / on scroll.
  const light = usePathname() === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        light
          ? "border-b border-transparent bg-transparent"
          : "border-b border-white/10 bg-charcoal/95 backdrop-blur-md"
      )}
    >
      <nav className="container-mp flex h-16 items-center justify-between gap-4">
        <Logo invert={!light} />

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={cn("text-sm transition-colors hover:text-gold", light ? "text-ink/70" : "text-ivory/75")}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/parent/login" className={cn("text-sm transition-colors hover:text-gold", light ? "text-ink/70" : "text-ivory/75")}>Parent login</Link>
          <a href={TRIAL} target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-medium text-cream transition hover:brightness-125">
            Book a free trial
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden",
            light ? "bg-charcoal text-cream" : "border border-white/20 text-ivory"
          )}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          )}
        </button>
      </nav>

      {/* Mobile sheet */}
      <div className={cn(
        "overflow-hidden border-t border-white/10 bg-charcoal transition-[max-height] duration-300 lg:hidden",
        open ? "max-h-[85vh]" : "max-h-0 border-t-transparent"
      )}>
        <div className="container-mp flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-base text-ivory/85 hover:bg-white/5 hover:text-gold">
              {link.label}
            </Link>
          ))}
          <Link href="/parent/login" onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-3 text-base text-ivory/85 hover:bg-white/5 hover:text-gold">
            Parent login
          </Link>
          <div className="mt-3 px-1">
            <a href={TRIAL} target="_blank" rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-md bg-gold px-4 py-3.5 text-base font-medium text-charcoal">
              Book a free trial
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
