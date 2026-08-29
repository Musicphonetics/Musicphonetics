"use client";

import { useEffect, useState } from "react";
import type { Student } from "@/lib/supabase/types";
import { INSTRUMENTS } from "@/lib/onboarding";
import { linkChild } from "@/lib/family";
import { signOut } from "@/lib/supabase/auth";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

const first = (n: string) => n.split(" ")[0] || n;
const initial = (n: string) => (first(n).charAt(0) || "?").toUpperCase();

// The family switcher: pick which child you're viewing, and add another child to
// the same login. Shows even for a single child (so "Add a child" is available).
export function FamilySwitcher({
  students, selectedId, onSelect, onAdded,
}: { students: Student[]; selectedId: string | null; onSelect: (id: string) => void; onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const current = students.find((s) => s.id === selectedId) ?? students[0];

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-hairline bg-white py-1 pl-1 pr-2.5 transition-colors hover:border-ink/30"
        aria-haspopup="true" aria-expanded={open}>
        <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/40 bg-gold/15 font-display text-sm font-bold text-[#7A5E0F]">{current ? initial(current.name) : "👤"}</span>
        <span className="max-w-[7rem] truncate text-sm font-semibold text-ink">{current ? first(current.name) : "Account"}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-ink/50"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      {open && (
        <>
          <button type="button" aria-hidden="true" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-40 w-60 overflow-hidden rounded-2xl border border-hairline bg-white shadow-xl">
            {students.length > 0 && <p className="px-3 pt-3 text-[10px] font-semibold uppercase tracking-wide text-ink/45">Your children</p>}
            <div className="mt-1 max-h-72 overflow-y-auto p-1.5">
              {students.map((s) => (
                <button key={s.id} onClick={() => { onSelect(s.id); setOpen(false); }}
                  className={cn("flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm",
                    s.id === current.id ? "bg-gold/10 text-[#7A5E0F]" : "text-ink/80 hover:bg-paper")}>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/15 text-xs font-bold text-[#7A5E0F]">{initial(s.name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{s.name}</span>
                    {s.instrument && <span className="block truncate text-[11px] text-ink/50">{s.instrument}</span>}
                  </span>
                  {s.id === current.id && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
              ))}
            </div>
            <div className="border-t border-hairline p-1.5">
              <button onClick={() => { setAdding(true); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-semibold text-ink/80 hover:bg-paper">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-dashed border-ink/30 text-ink/60">+</span>
                Add a child
              </button>
              <button onClick={() => signOut()}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-medium text-ink/70 hover:bg-paper">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink/[0.06] text-ink/60">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                Sign out
              </button>
            </div>
          </div>
        </>
      )}

      {adding && <AddChildModal onClose={() => setAdding(false)} onAdded={() => { setAdding(false); onAdded?.(); }} />}
    </div>
  );
}

function AddChildModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [instrument, setInstrument] = useState("");
  const [relation, setRelation] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (name.trim().length < 2 || busy) return;
    setBusy(true); setErr(null);
    const r = await linkChild({ name: name.trim(), instrument: instrument || undefined, relation: relation || undefined });
    setBusy(false);
    if (r.ok) setDone(true);
    else setErr(r.error || "Couldn't add the child.");
  }

  // Lock the page behind the sheet so only the sheet scrolls.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const fld = "w-full rounded-xl border border-hairline bg-white px-3.5 py-3 text-base text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

  return (
    // Full-screen scroll container: a bottom sheet on phones (never clipped, easy
    // to reach), a centred card on larger screens. The inner panel caps its own
    // height and scrolls, so the keyboard can never push the button off-screen.
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto overscroll-contain bg-charcoal/50 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog" aria-modal="true" aria-label="Add a child"
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-hairline bg-white shadow-2xl sm:max-h-[88vh] sm:max-w-md sm:rounded-3xl">
        {/* grab handle (mobile sheet affordance) */}
        <div className="flex justify-center pt-2.5 sm:hidden"><span className="h-1 w-10 rounded-full bg-ink/15" /></div>

        {done ? (
          <div className="overflow-y-auto px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-feature-green/15 text-feature-green">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">{first(name)} has been added</h3>
            <p className="mt-1.5 text-sm text-ink/65">Our team will assign a teacher, plan and fees shortly. You&apos;ll see {first(name)} in your child switcher now.</p>
            <button onClick={onAdded} className="mt-5 w-full rounded-full bg-gold py-3.5 text-sm font-semibold text-ink hover:bg-deep-gold">Done</button>
          </div>
        ) : (
          <>
            {/* Sticky header so the title + close stay put while the body scrolls */}
            <div className="flex items-start justify-between gap-3 border-b border-hairline px-5 pb-3 pt-3 sm:pt-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">Add a child</h3>
                <p className="mt-0.5 text-[13px] leading-snug text-ink/60">Same login, separate progress. The office confirms their teacher and fees.</p>
              </div>
              <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/45 transition hover:bg-paper hover:text-ink" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4">
              <label className="block"><span className="text-xs font-semibold text-ink/70">Child&apos;s full name</span>
                <input value={name} onChange={(e) => { setName(e.target.value); setErr(null); }} placeholder="e.g. Aarav Sharma" className={cn(fld, "mt-1.5")} autoFocus /></label>

              <div className="mt-4">
                <span className="text-xs font-semibold text-ink/70">Instrument <span className="font-normal text-ink/45">(optional)</span></span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INSTRUMENTS.map((o) => (
                    <button key={o.value} type="button" onClick={() => setInstrument(instrument === o.value ? "" : o.value)}
                      className={cn("rounded-full border px-3.5 py-2 text-sm transition-colors",
                        instrument === o.value ? "border-gold bg-gold/10 text-[#7A5E0F]" : "border-hairline text-ink/70 hover:border-ink/30")}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="mt-4 block"><span className="text-xs font-semibold text-ink/70">Relation <span className="font-normal text-ink/45">(optional)</span></span>
                <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="e.g. younger son, daughter" className={cn(fld, "mt-1.5")} /></label>

              {err && (
                <div className="mt-4 rounded-xl bg-red-500/[0.07] px-3.5 py-3 text-sm text-red-700">
                  <p>{err}</p>
                  <a href={whatsappLink(`Hi Musicphonetics, I'd like to add another child to my family account${name.trim() ? ` (${name.trim()})` : ""}.`)}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 font-semibold text-red-800 underline underline-offset-2">
                    Add via WhatsApp instead →
                  </a>
                </div>
              )}
            </div>

            {/* Sticky footer action, always reachable, above the home indicator */}
            <div className="border-t border-hairline px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <button onClick={submit} disabled={busy || name.trim().length < 2}
                className="w-full rounded-full bg-gold py-3.5 text-sm font-semibold text-ink transition hover:bg-deep-gold disabled:opacity-50">
                {busy ? "Adding…" : "Add child"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
