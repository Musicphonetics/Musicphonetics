"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadTeacherLeads, isNewLead, LEAD_STATUS_LABEL, LEAD_STATUS_TONE, type TeacherLead } from "@/lib/supabase/leads";
import { cn } from "@/lib/utils";

// Statuses a teacher can set on their own lead (never the commercial plan).
const TEACHER_STATUSES: { key: string; label: string }[] = [
  { key: "contacted", label: "Contacted" },
  { key: "trial_booked", label: "Trial booked" },
  { key: "trial_completed", label: "Trial done" },
  { key: "interested", label: "Interested" },
  { key: "payment_pending", label: "Payment pending" },
  { key: "not_interested", label: "Not interested" },
];
type FilterKey = "new" | "active" | "converted" | "all";

export default function TeacherLeads() {
  const [rows, setRows] = useState<TeacherLead[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("new");
  const [openId, setOpenId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { rows, error } = await loadTeacherLeads();
    setRows(rows); setErr(error);
  }, []);
  useEffect(() => {
    if (!isSupabaseConfigured()) { setErr("Portal not configured."); setRows([]); return; }
    refresh();
  }, [refresh]);

  const counts = useMemo(() => {
    const r = rows ?? [];
    return {
      new: r.filter(isNewLead).length,
      active: r.filter((l) => !l.converted_student_id && !["lost", "not_interested", "duplicate"].includes(l.status)).length,
      converted: r.filter((l) => l.converted_student_id).length,
      all: r.length,
    };
  }, [rows]);

  const shown = useMemo(() => {
    const r = rows ?? [];
    if (filter === "new") return r.filter(isNewLead);
    if (filter === "active") return r.filter((l) => !l.converted_student_id && !["lost", "not_interested", "duplicate"].includes(l.status));
    if (filter === "converted") return r.filter((l) => l.converted_student_id);
    return r;
  }, [rows, filter]);

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="My Leads" subtitle={counts.new > 0 ? `${counts.new} new` : undefined}>
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["new", "active", "converted", "all"] as FilterKey[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium", filter === f ? "bg-ink text-paper" : "border border-hairline bg-white text-ink/70")}>
            {f === "new" ? "New" : f === "active" ? "Active" : f === "converted" ? "Converted" : "All"}
            <span className={cn("ml-1.5 rounded-full px-1.5 text-[11px]", filter === f ? "bg-white/20" : "bg-ink/[0.06] text-ink/60")}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {rows === null ? <Loading /> : shown.length === 0 ? (
        <EmptyState title={filter === "new" ? "No new leads" : "No leads here"} hint="Assigned leads from the office appear here to contact and convert." />
      ) : (
        <div className="space-y-3">
          {shown.map((l) => (
            <LeadCard key={l.id} lead={l} open={openId === l.id} onToggle={() => setOpenId(openId === l.id ? null : l.id)} onChanged={refresh} />
          ))}
        </div>
      )}
    </PortalShell>
  );
}

function LeadCard({ lead, open, onToggle, onChanged }: { lead: TeacherLead; open: boolean; onToggle: () => void; onChanged: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [converting, setConverting] = useState(false);
  const isNew = isNewLead(lead);

  async function update(args: Record<string, unknown>) {
    setBusy(true);
    const { error } = await getSupabase().rpc("mp_lead_update", { p_lead: lead.id, p_status: null, p_note: null, p_follow_up: null, p_lost_reason: null, p_mark_contacted: false, ...args });
    setBusy(false);
    if (!error) onChanged();
  }
  const setStatus = (s: string) => update({ p_status: s, p_mark_contacted: s === "contacted" });
  const markContacted = () => update({ p_mark_contacted: true, p_status: "contacted" });
  const saveNote = async () => { if (!note.trim()) return; await update({ p_note: note.trim() }); setNote(""); };
  const saveFollowUp = async () => { if (!followUp) return; await update({ p_status: "follow_up", p_follow_up: new Date(followUp).toISOString() }); setFollowUp(""); };

  return (
    <div className={cn("rounded-2xl border bg-white p-4", isNew ? "border-gold/50" : "border-hairline")}>
      <button onClick={onToggle} className="flex w-full items-start justify-between gap-3 text-left">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-ink">
            {lead.student_name || lead.parent_name || "New enquiry"}
            {isNew && <span className="ml-2 rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold text-ink">NEW</span>}
          </p>
          <p className="mt-0.5 text-xs text-ink/60">{[lead.instrument_interest, lead.preferred_mode, lead.preferred_area].filter(Boolean).join(" · ") || "-"}</p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", LEAD_STATUS_TONE[lead.status] || "bg-ink/10 text-ink/60")}>{LEAD_STATUS_LABEL[lead.status] || lead.status}</span>
      </button>

      {/* Contact row (always visible) */}
      <div className="mt-3 flex gap-2">
        {lead.phone && <a href={`tel:${lead.phone}`} className="flex-1 rounded-full border border-hairline py-2 text-center text-sm font-semibold text-ink/80">Call</a>}
        {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-feature-green/15 py-2 text-center text-sm font-semibold text-feature-green">WhatsApp</a>}
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-hairline pt-4">
          {lead.email && <Detail label="Email">{lead.email}</Detail>}
          {lead.learning_goal && <Detail label="Goal">{lead.learning_goal}</Detail>}
          <Detail label="Received">{new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long" })} · <span className="font-mono text-[11px] text-ink/45">{lead.lead_code}</span></Detail>
          {lead.next_follow_up_at && <Detail label="Follow-up"><span className={cn(new Date(lead.next_follow_up_at) < new Date() && "font-semibold text-red-600")}>{new Date(lead.next_follow_up_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></Detail>}

          {lead.converted_student_id ? (
            <div className="rounded-xl border border-feature-green/40 bg-feature-green/[0.06] p-3 text-sm font-semibold text-feature-green">Converted to a student ✓</div>
          ) : converting ? (
            <ConvertForm lead={lead} busy={busy} onCancel={() => setConverting(false)}
              onDone={(studentId) => { onChanged(); if (studentId) router.push("/teacher/students"); }} />
          ) : (
            <>
              {!lead.first_contacted_at && (
                <button onClick={markContacted} disabled={busy} className="w-full rounded-full border border-hairline py-2.5 text-sm font-semibold text-ink/80 disabled:opacity-50">Mark contacted</button>
              )}
              <div>
                <p className="mb-1.5 text-xs font-medium text-ink/60">Update status</p>
                <div className="flex flex-wrap gap-1.5">
                  {TEACHER_STATUSES.map((s) => (
                    <button key={s.key} onClick={() => setStatus(s.key)} disabled={busy}
                      className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-50", lead.status === s.key ? "border-ink bg-ink text-paper" : "border-hairline text-ink/70")}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="flex-1 rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm focus:outline-none" />
                <button onClick={saveFollowUp} disabled={busy || !followUp} className="rounded-lg border border-hairline px-3 text-sm font-semibold text-ink/70 disabled:opacity-40">Follow-up</button>
              </div>
              <div className="flex gap-2">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="flex-1 rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm focus:outline-none" />
                <button onClick={saveNote} disabled={busy || !note.trim()} className="rounded-lg border border-hairline px-3 text-sm font-semibold text-ink/70 disabled:opacity-40">Add</button>
              </div>
              <button onClick={() => setConverting(true)} className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-paper">Convert to student</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ConvertForm({ lead, busy, onCancel, onDone }: { lead: TeacherLead; busy: boolean; onCancel: () => void; onDone: (studentId: string | null) => void }) {
  const [f, setF] = useState({
    name: lead.student_name || lead.parent_name || "",
    parent_name: lead.parent_name || "",
    parent_phone: lead.phone || "",
    parent_email: lead.email || "",
    instrument: lead.instrument_interest || "",
    class_mode: lead.preferred_mode || "",
    learning_goal: lead.learning_goal || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    if (!f.name.trim()) { setErr("Enter the student's name."); return; }
    setSaving(true); setErr(null);
    const { data, error } = await getSupabase().rpc("mp_convert_lead", { p_lead: lead.id, p_student: f });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onDone((data as string) ?? null);
  }

  return (
    <div className="rounded-xl border border-gold/40 bg-gold/[0.04] p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Convert to student · prefilled from the lead</p>
      <div className="space-y-2">
        {([["name", "Student name"], ["parent_name", "Parent name"], ["parent_phone", "Phone"], ["parent_email", "Email"], ["instrument", "Instrument"], ["class_mode", "Mode"], ["learning_goal", "Learning goal"]] as [keyof typeof f, string][]).map(([k, label]) => (
          <label key={k} className="block">
            <span className="text-[11px] text-ink/55">{label}</span>
            <input value={f[k]} onChange={(e) => set(k, e.target.value)} className="mt-0.5 w-full rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm focus:outline-none" />
          </label>
        ))}
      </div>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={onCancel} disabled={saving || busy} className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink/60">Cancel</button>
        <button onClick={save} disabled={saving || busy} className="flex-1 rounded-full bg-feature-green py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Creating…" : "Create student"}</button>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-[10px] uppercase tracking-wide text-ink/40">{label}</p><p className="text-sm text-ink/80">{children}</p></div>;
}
