"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MODES = ["", "At home", "Online", "At the centre"];

// Owner/staff create a lead by hand and (optionally) send it straight to a
// teacher's inbox. Uses mp_owner_create_lead (which assigns + notifies).
export function QuickLead({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [f, setF] = useState({ name: "", phone: "", area: "", mode: "", instrument: "", teacher: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => { setF((p) => ({ ...p, [k]: v })); setMsg(null); };

  useEffect(() => {
    if (!open || teachers.length) return;
    getSupabase().from("profiles").select("id,full_name").eq("role", "teacher").order("full_name")
      .then(({ data }) => setTeachers(((data as { id: string; full_name: string | null }[]) ?? []).map((t) => ({ id: t.id, name: t.full_name || "Teacher" }))));
  }, [open, teachers.length]);

  async function submit() {
    if (!f.name.trim() && !f.phone.trim()) { setErr("Add at least a name or a contact number."); return; }
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await getSupabase().rpc("mp_owner_create_lead", {
      p_name: f.name.trim(), p_phone: f.phone.trim(), p_area: f.area.trim(),
      p_mode: f.mode, p_instrument: f.instrument.trim(), p_teacher: f.teacher || null,
    });
    setBusy(false);
    if (error) {
      setErr(/function .*mp_owner_create_lead/i.test(error.message) ? "Run supabase/owner_leads_teacher_profiles.sql first." : error.message);
    } else {
      setMsg(f.teacher ? "Lead created and sent to the teacher." : "Lead created.");
      setF({ name: "", phone: "", area: "", mode: "", instrument: "", teacher: "" });
      onCreated?.();
    }
  }

  const fld = "w-full rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

  return (
    <div className="mb-4 rounded-2xl border border-hairline bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-ink">Quick lead</p>
          <p className="text-xs text-ink/60">Create a lead by hand and send it to a teacher.</p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className={cn("rounded-full px-4 py-2 text-sm font-semibold", open ? "border border-hairline text-ink/70" : "bg-ink text-paper")}>
          {open ? "Close" : "+ New lead"}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" className={fld} />
          <input value={f.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" placeholder="Contact number" className={fld} />
          <input value={f.area} onChange={(e) => set("area", e.target.value)} placeholder="Location / area" className={fld} />
          <select value={f.mode} onChange={(e) => set("mode", e.target.value)} className={fld}>
            {MODES.map((m) => <option key={m} value={m}>{m || "Mode (any)"}</option>)}
          </select>
          <input value={f.instrument} onChange={(e) => set("instrument", e.target.value)} placeholder="Instrument (optional)" className={fld} />
          <select value={f.teacher} onChange={(e) => set("teacher", e.target.value)} className={fld}>
            <option value="">Assign to teacher (optional)…</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {err && <p className="text-xs text-red-600 sm:col-span-2">{err}</p>}
          {msg && <p className="text-xs font-semibold text-feature-green sm:col-span-2">{msg}</p>}
          <button onClick={submit} disabled={busy}
            className="rounded-xl bg-gold py-2.5 text-sm font-semibold text-ink hover:bg-deep-gold disabled:opacity-50 sm:col-span-2">
            {busy ? "Creating…" : f.teacher ? "Create & send to teacher" : "Create lead"}
          </button>
        </div>
      )}
    </div>
  );
}
