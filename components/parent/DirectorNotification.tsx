"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FOUNDER } from "@/lib/founder";
import type { DirectorCustom } from "@/components/portal/DirectorNote";

// The Director's message shown like a notification: an unread banner the parent
// can't miss, plus a forced pop-up the first time each new message appears.
export function DirectorNotification({ message }: { message: DirectorCustom }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(true);
  const stamp = message.date || message.body.slice(0, 40); // identity of this message

  useEffect(() => {
    const seen = localStorage.getItem("mp-director-read");
    const isRead = seen === stamp;
    setRead(isRead);
    if (!isRead) setOpen(true); // force it open on a new message
  }, [stamp]);

  function markRead() {
    localStorage.setItem("mp-director-read", stamp);
    setRead(true);
    setOpen(false);
  }

  const paras = message.body.split(/\n{1,}/).map((s) => s.trim()).filter(Boolean);
  const dateLabel = message.date
    ? new Date(message.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <>
      {/* Notification banner */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-gold/45 bg-gold/[0.08] p-3.5 text-left transition hover:bg-gold/[0.12]"
      >
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-white text-[#7A5E0F]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {!read && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#fdf6e6] bg-red-500" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{read ? "A note from your Director" : "New message from your Director"}</span>
          <span className="block truncate text-xs text-ink/65">{message.title?.trim() || "Tap to read"}</span>
        </span>
        <span className={read ? "text-xs font-semibold text-[#7A5E0F]" : "rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"}>{read ? "Open →" : "New"}</span>
      </button>

      {/* Forced pop-up */}
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-charcoal/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-hairline bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-hairline bg-gold/[0.06] px-5 py-4">
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gold/40">
                <Image src={FOUNDER.photo} alt={FOUNDER.photoAlt} fill sizes="44px" className="object-cover object-top" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A5E0F]">A note from your Director</p>
                <p className="font-display text-sm font-semibold text-ink">{FOUNDER.name}{dateLabel ? <span className="font-body text-xs font-normal text-ink/45"> · {dateLabel}</span> : null}</p>
              </div>
            </div>
            <div className="px-5 py-5">
              {message.title?.trim() && <h3 className="mb-2 font-display text-lg font-semibold text-ink">{message.title}</h3>}
              <div className="max-h-[50vh] space-y-2.5 overflow-y-auto text-sm leading-relaxed text-ink/80">
                {paras.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <button onClick={markRead} className="mt-5 w-full rounded-full bg-gold py-3 text-sm font-semibold text-charcoal transition hover:brightness-105">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
