"use client";

import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "mp-install-dismissed";
const DISMISS_DAYS = 14;

// A gentle "Install app" banner. On Android/Chrome it triggers the real one-tap
// install prompt; on iPhone/iPad (no prompt API) it shows the Share → Add to
// Home Screen steps. Hidden once installed or recently dismissed.
export function InstallPWA() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return; // already installed

    // Respect a recent dismissal.
    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 864e5) return;

    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /^((?!chrome|crios|android|fxios).)*safari/i.test(ua);

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", () => setShow(false));

    // iOS never fires beforeinstallprompt — show the manual hint after a moment.
    if (isIos && isSafari) {
      setIos(true);
      const t = setTimeout(() => setShow(true), 2500);
      return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", onBIP); };
    }
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  function dismiss() {
    setShow(false);
    try { window.localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    setShow(false);
    if (outcome !== "accepted") dismiss();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-white/12 bg-ink/95 p-3 text-paper shadow-2xl backdrop-blur">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/10">
          <img src="/icons/icon-192.png" alt="" className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install the Musicphonetics app</p>
          {ios ? (
            <p className="text-xs text-paper/70">Tap <b>Share</b> <span aria-hidden>⎋</span> then <b>“Add to Home Screen”</b>.</p>
          ) : (
            <p className="text-xs text-paper/70">One tap — full screen, fast, on your home screen.</p>
          )}
        </div>
        {!ios && (
          <button onClick={install} className="shrink-0 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-deep-gold">
            Install
          </button>
        )}
        <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 rounded-full p-1.5 text-paper/50 hover:text-paper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
}
