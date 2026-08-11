"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { offerIsLive, OFFER_FIRST_MONTH, OFFER_REGULAR } from "@/lib/delhi-cantt";

// Slim, dismissible Delhi Cantt flagship offer bar. Sits above the nav (it sets
// data-promo on <html> so the fixed navbar + main padding shift down; see
// globals.css). Only shows while the offer is live and not dismissed this device.
const KEY = "mp-promo-delhi-v1";

export function PromoBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!offerIsLive()) return;
    if (typeof window !== "undefined" && window.localStorage.getItem(KEY) === "1") return;
    setShow(true);
    document.documentElement.setAttribute("data-promo", "1");
    return () => document.documentElement.removeAttribute("data-promo");
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    document.documentElement.removeAttribute("data-promo");
    try { window.localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex h-9 items-center justify-center gap-3 bg-gradient-to-r from-[#E7CB6E] via-[#D9B24A] to-[#E7CB6E] px-4 text-[13px] font-semibold text-[#191400]">
      <Link href="/delhi-cantt" className="flex min-w-0 items-center gap-2 hover:underline">
        <span aria-hidden>🎖️</span>
        <span className="truncate">
          <b>Delhi Cantt exclusive</b> · Main Pathway first month <b>{OFFER_FIRST_MONTH}</b>, then {OFFER_REGULAR}
        </span>
        <span className="hidden shrink-0 rounded-full bg-[#191400] px-2.5 py-0.5 text-[11px] font-bold text-[#E7CB6E] sm:inline">Claim →</span>
      </Link>
      <button onClick={dismiss} aria-label="Dismiss offer" className="absolute right-3 text-[#191400]/70 hover:text-[#191400]">✕</button>
    </div>
  );
}
