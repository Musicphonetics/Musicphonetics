"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { whatsappLink } from "@/lib/data";

// Dedicated landing the printed-flyer QR codes lead to. It records the scan
// (best effort, no personal data) and then sends the parent straight into the
// free-trial experience. `ref` marks which QR / placement was scanned so the
// office can see the data per code.
function StartInner() {
  const params = useSearchParams();
  const ref = params.get("ref") || "flyer";
  const logged = useRef(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    const { client } = getSupabaseSafe();
    if (!client) return;
    client
      .from("qr_scans")
      .insert({
        ref,
        path: "/start",
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      })
      .then(() => setSaved(true), () => {});
  }, [ref]);

  const trialHref = `/studio?ref=${encodeURIComponent(ref)}`;

  return (
    <main className="min-h-screen bg-charcoal-2 text-ivory">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        {/* Brand */}
        <div className="flex justify-center">
          <Image src="/logo-wordmark-light.webp" alt="Musicphonetics" width={230} height={54}
            priority className="h-9 w-auto" />
        </div>

        <div className="mt-12 flex-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-soft">
            Online &amp; In-Person &middot; Across India
          </p>
          <h1 className="mt-3 font-display text-[2.1rem] font-semibold leading-[1.1]">
            Start your free trial.
          </h1>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-ivory/70">
            A structured music education with a system behind it. See your child&rsquo;s progress after
            every class, and give them a real stage to grow on.
          </p>

          <ul className="mt-7 space-y-3">
            {[
              "A teacher matched to your child, online or in person",
              "Every class tracked in your Parent Portal",
              "Quarterly performance opportunities",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[0.92rem] text-ivory/85">
                <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-soft">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="mt-8 space-y-3">
          <Link href={trialHref}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-base font-semibold text-charcoal transition hover:brightness-105">
            Book my free trial
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <a href={whatsappLink("Hi Musicphonetics, I scanned your flyer and would like to book a free trial.")}
            target="_blank" rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-ivory/80 transition hover:text-ivory">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.9-1.2-4.7-4.2-4.9-4.4-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.8.9.8 1.7 1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.5.3.1.3.1.7-.1 1.3Z" /></svg>
            Chat with us on WhatsApp
          </a>
          <p className="pt-1 text-center text-[0.72rem] text-ivory/45">
            Musicphonetics &middot; 10+ years of music education &middot; Teaching across cities
          </p>
        </div>
      </div>
      <span className="sr-only">{saved ? "logged" : ""}</span>
    </main>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-charcoal-2" />}>
      <StartInner />
    </Suspense>
  );
}
