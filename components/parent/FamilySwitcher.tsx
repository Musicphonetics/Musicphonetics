"use client";

import { useState } from "react";
import type { Student } from "@/lib/supabase/types";
import { INSTRUMENTS } from "@/lib/onboarding";
import { linkChild } from "@/lib/family";
import { signOut } from "@/lib/supabase/auth";
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

  const fld = "w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-charcoal/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-hairline bg-white shadow-2xl">
        {done ? (
          <div className="p-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-feature-green/15 text-feature-green">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">{first(name)} has been added</h3>
            <p className="mt-1.5 text-sm text-ink/65">Our team will assign a teacher, plan and fees shortly. You&apos;ll see {first(name)} in your child switcher now.</p>
            <button onClick={onAdded} className="mt-5 w-full rounded-full bg-gold py-2.5 text-sm font-semibold text-ink hover:bg-deep-gold">Done</button>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink">Add a child</h3>
              <button onClick={onClose} className="text-ink/40 hover:text-ink" aria-label="Close">✕</button>
            </div>
            <p className="mt-1 text-sm text-ink/60">Add another child to your family — same login, separate progress. The office will confirm their teacher and fees.</p>

            <label className="mt-4 block"><span className="text-xs font-semibold text-ink/70">Child&apos;s full name</span>
              <input value={name} onChange={(e) => { setName(e.target.value); setErr(null); }} placeholder="e.g. Aarav Sharma" className={cn(fld, "mt-1")} autoFocus /></label>

            <div className="mt-3">
              <span className="text-xs font-semibold text-ink/70">Instrument <span className="font-normal text-ink/45">(optional)</span></span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {INSTRUMENTS.map((o) => (
                  <button key={o.value} type="button" onClick={() => setInstrument(instrument === o.value ? "" : o.value)}
                    className={cn("rounded-full border px-3 py-1.5 text-xs transition-colors",
                      instrument === o.value ? "border-gold bg-gold/10 text-[#7A5E0F]" : "border-hairline text-ink/70 hover:border-ink/30")}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-3 block"><span className="text-xs font-semibold text-ink/70">Relation <span className="font-normal text-ink/45">(optional)</span></span>
              <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="e.g. younger son, daughter" className={cn(fld, "mt-1")} /></label>

            {err && <p className="mt-3 text-xs text-red-600">{err}</p>}
            <button onClick={submit} disabled={busy || name.trim().length < 2}
              className="mt-4 w-full rounded-full bg-gold py-2.5 text-sm font-semibold text-ink hover:bg-deep-gold disabled:opacity-50">
              {busy ? "Adding…" : "Add child"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
