"use client";

// Lead detail drawer, full info, activity timeline, and every pipeline action.
// Used by the owner Leads centre (and reusable by the sales workspace). All
// writes go through the SECURITY DEFINER RPCs so RLS + activity + notifications
// stay authoritative.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import { loadLeadDetail, LEAD_STATUSES, LEAD_STATUS_LABEL, LEAD_STATUS_TONE, type LeadDetail, type LeadActivity } from "@/lib/supabase/leads";
import { cn } from "@/lib/utils";

export function LeadDetailPanel({ leadId, teachers, onClose, onChanged }: {
  leadId: string; teachers: { id: string; name: string }[]; onClose: () => void; onChanged: () => void;
}) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [activity, setActivity] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { lead, activity } = await loadLeadDetail(leadId);
    setLead(lead); setActivity(activity); setLoading(false);
  }, [leadId]);
  useEffect(() => { load(); }, [load]);

  const teacherName = (id: string | null) => (id ? teachers.find((t) => t.id === id)?.name ?? "-" : "-");

  async function run(rpc: string, args: Record<string, unknown>, okMsg?: string) {
    setBusy(true); setMsg(null);
    const { error } = await getSupabase().rpc(rpc, args);
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    if (okMsg) setMsg(okMsg);
    await load(); onChanged();
  }

  const assign = (teacherId: string) => run("mp_assign_lead", { p_lead: leadId, p_teacher: teacherId || null });
  const setStatus = (status: string) => run("mp_lead_update", { p_lead: leadId, p_status: status, p_note: null, p_follow_up: null, p_lost_reason: null, p_mark_contacted: false });
  const markContacted = () => run("mp_lead_update", { p_lead: leadId, p_status: "contacted", p_note: null, p_follow_up: null, p_lost_reason: null, p_mark_contacted: true }, "Marked contacted.");
  const addNote = async () => { if (!note.trim()) return; await run("mp_lead_update", { p_lead: leadId, p_status: null, p_note: note.trim(), p_follow_up: null, p_lost_reason: null, p_mark_contacted: false }, "Note added."); setNote(""); };
  const saveFollowUp = async () => { if (!followUp) return; await run("mp_lead_update", { p_lead: leadId, p_status: "follow_up", p_note: null, p_follow_up: new Date(followUp).toISOString(), p_lost_reason: null, p_mark_contacted: false }, "Follow-up set."); setFollowUp(""); };
  const markLost = () => { const reason = window.prompt("Reason (optional):") ?? ""; run("mp_lead_update", { p_lead: leadId, p_status: "lost", p_note: null, p_follow_up: null, p_lost_reason: reason || null, p_mark_contacted: false }, "Marked lost."); };
  async function convert() {
    if (!lead) return;
    if (!window.confirm("Create a student from this lead?")) return;
    setBusy(true); setMsg(null);
    const { data, error } = await getSupabase().rpc("mp_convert_lead", {
      p_lead: leadId,
      p_student: { name: lead.student_name || lead.parent_name || "New student", parent_name: lead.parent_name, parent_phone: lead.phone, parent_email: lead.email, instrument: lead.instrument_interest, class_mode: lead.preferred_mode, learning_goal: lead.learning_goal },
    });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setMsg(`Converted → student created${data ? "" : ""}.`); await load(); onChanged();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-paper shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {loading || !lead ? (
          <div className="p-6 text-sm text-ink/50">Loading…</div>
        ) : (
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] text-ink/45">{lead.lead_code}{lead.enquiry_count > 1 && <span className="ml-2 rounded-full bg-gold/15 px-1.5 py-0.5 font-sans font-semibold text-[#7A5E0F]">enquired ×{lead.enquiry_count}</span>}</p>
                <h2 className="font-display text-xl font-semibold text-ink">{lead.student_name || lead.parent_name || "Lead"}</h2>
                <span className={cn("mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold", LEAD_STATUS_TONE[lead.status])}>{LEAD_STATUS_LABEL[lead.status] || lead.status}</span>
              </div>
              <button onClick={onClose} className="rounded-full border border-hairline px-3 py-1.5 text-sm text-ink/60">Close</button>
            </div>

            {msg && <p className="mt-3 rounded-lg bg-mist px-3 py-2 text-xs text-ink/70">{msg}</p>}

            {/* Contact + interest */}
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-hairline bg-white p-4 text-sm">
              <Info label="Phone">{lead.phone ? <a href={`tel:${lead.phone}`} className="text-[#7A5E0F]">{lead.phone}</a> : "-"}</Info>
              <Info label="WhatsApp">{lead.phone ? <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-[#7A5E0F]">Message</a> : "-"}</Info>
              <Info label="Email">{lead.email || "-"}</Info>
              <Info label="Parent">{lead.parent_name || "-"}</Info>
              <Info label="Instrument">{lead.instrument_interest || "-"}</Info>
              <Info label="Mode">{lead.preferred_mode || "-"}</Info>
              <Info label="Area">{lead.preferred_area || "-"}</Info>
              <Info label="Age">{lead.student_age || "-"}</Info>
              <Info label="Experience">{lead.experience_level || "-"}</Info>
              <Info label="Preferred time">{lead.preferred_time || "-"}</Info>
              {lead.learning_goal && <div className="col-span-2"><Info label="Goal">{lead.learning_goal}</Info></div>}
              {lead.message && <div className="col-span-2"><Info label="Message">{lead.message}</Info></div>}
            </div>

            {/* Attribution */}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink/55">
              {lead.source && <span className="rounded-full bg-ink/[0.05] px-2 py-1">source: {lead.source}</span>}
              {lead.campaign && <span className="rounded-full bg-ink/[0.05] px-2 py-1">campaign: {lead.campaign}</span>}
              {lead.utm_source && <span className="rounded-full bg-ink/[0.05] px-2 py-1">utm: {lead.utm_source}/{lead.utm_medium}</span>}
              {lead.landing_page && <span className="rounded-full bg-ink/[0.05] px-2 py-1">page: {lead.landing_page}</span>}
            </div>

            {/* Actions */}
            {lead.converted_student_id ? (
              <div className="mt-4 rounded-xl border border-feature-green/40 bg-feature-green/[0.06] p-3 text-sm text-feature-green">
                Converted to a student. <Link href="/owner/students" className="font-semibold underline">View students →</Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3 rounded-xl border border-hairline bg-white p-4">
                <Row label="Assign to teacher">
                  <select value={lead.assigned_teacher_id ?? ""} disabled={busy} onChange={(e) => assign(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm focus:outline-none">
                    <option value="">Unassigned</option>
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </Row>
                <Row label="Status">
                  <select value={lead.status} disabled={busy} onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm focus:outline-none">
                    {LEAD_STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>)}
                  </select>
                </Row>
                <Row label="Next follow-up">
                  <div className="flex gap-2">
                    <input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="flex-1 rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm focus:outline-none" />
                    <button onClick={saveFollowUp} disabled={busy || !followUp} className="rounded-lg border border-hairline px-3 text-sm font-semibold text-ink/70 disabled:opacity-40">Set</button>
                  </div>
                </Row>
                <Row label="Add note">
                  <div className="flex gap-2">
                    <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Conversation note…" className="flex-1 rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm focus:outline-none" />
                    <button onClick={addNote} disabled={busy || !note.trim()} className="rounded-lg border border-hairline px-3 text-sm font-semibold text-ink/70 disabled:opacity-40">Add</button>
                  </div>
                </Row>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button onClick={markContacted} disabled={busy} className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink/70 disabled:opacity-50">Mark contacted</button>
                  <button onClick={convert} disabled={busy} className="rounded-full bg-feature-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Convert to student</button>
                  <button onClick={markLost} disabled={busy} className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50">Mark lost</button>
                </div>
              </div>
            )}

            {lead.internal_notes && (
              <div className="mt-4 rounded-xl border border-hairline bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Notes</p>
                <p className="mt-1 whitespace-pre-line text-sm text-ink/75">{lead.internal_notes}</p>
              </div>
            )}

            {/* Activity timeline */}
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink/45">Activity</p>
              <ul className="space-y-2">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-2 text-xs">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <div>
                      <span className="font-medium text-ink">{prettyEvent(a.event_type)}</span>
                      {a.actor_role && <span className="text-ink/45"> · {a.actor_role}</span>}
                      <span className="ml-1.5 text-ink/45">{new Date(a.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function prettyEvent(e: string) {
  return ({ submitted: "Lead submitted", repeat_enquiry: "Enquired again", assigned: "Assigned to teacher", reassigned: "Reassigned", contacted: "Contacted", follow_up_set: "Follow-up scheduled", status_changed: "Status changed", note_added: "Note added", converted: "Converted to student", lost: "Marked lost" } as Record<string, string>)[e] || e;
}
function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-[10px] uppercase tracking-wide text-ink/40">{label}</p><p className="text-ink/80">{children}</p></div>;
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1 text-[11px] font-medium text-ink/60">{label}</p>{children}</div>;
}
