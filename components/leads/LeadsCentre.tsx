"use client";

// Shared lead operating-system UI used by BOTH the owner and the sales
// workspace (they are equally "lead staff", RLS is what actually gates access,
// so this component holds no owner-only controls). Server-paginated, filterable,
// with bulk actions and a full lead detail drawer.
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Loading } from "@/components/portal/kit";
import {
  loadLeads, loadLeadStats, LEAD_STATUSES, LEAD_STATUS_LABEL, LEAD_STATUS_TONE, type LeadListRow,
} from "@/lib/supabase/leads";
import { LeadDetailPanel } from "@/components/owner/LeadDetailPanel";
import { LeadAnalytics } from "@/components/leads/LeadAnalytics";
import { cn } from "@/lib/utils";

const SOURCES = ["all", "website", "delhi_cantt", "stage", "instagram", "google", "whatsapp", "referral", "event", "organic"];
const PAGE_SIZE = 50;

export function LeadsCentre() {
  const [rows, setRows] = useState<LeadListRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [status, setStatus] = useState("all");
  const [assigned, setAssigned] = useState("all");
  const [source, setSource] = useState("all");
  const [followUpDue, setFollowUpDue] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [sel, setSel] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const teacherName = useMemo(() => Object.fromEntries(teachers.map((t) => [t.id, t.name])), [teachers]);

  const refresh = useCallback(async () => {
    const [res, s] = await Promise.all([
      loadLeads({ page, pageSize: PAGE_SIZE, status, assigned, source, followUpDue, search }),
      loadLeadStats().catch(() => ({})),
    ]);
    setErr(res.error); setRows(res.rows); setTotal(res.total); setStats(s); setSel(new Set());
  }, [page, status, assigned, source, followUpDue, search]);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setErr("Portal not configured."); setRows([]); return; }
    getSupabase().from("profiles").select("id,full_name").eq("role", "teacher").order("full_name")
      .then(({ data }) => setTeachers(((data as { id: string; full_name: string | null }[]) ?? []).map((t) => ({ id: t.id, name: t.full_name || "Unnamed" }))));
  }, []);
  useEffect(() => { setRows(null); refresh(); }, [refresh]);
  useEffect(() => { setPage(0); }, [status, assigned, source, followUpDue, search]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allChecked = !!rows && rows.length > 0 && rows.every((r) => sel.has(r.id));
  const toggleAll = () => setSel(allChecked ? new Set() : new Set((rows ?? []).map((r) => r.id)));
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  async function bulkAssign(teacherId: string) {
    if (!teacherId || sel.size === 0) return;
    setBusy(true);
    const sb = getSupabase();
    await Promise.all([...sel].map((id) => sb.rpc("mp_assign_lead", { p_lead: id, p_teacher: teacherId })));
    setBusy(false); refresh();
  }
  async function bulkStatus(newStatus: string) {
    if (!newStatus || sel.size === 0) return;
    setBusy(true);
    const sb = getSupabase();
    await Promise.all([...sel].map((id) => sb.rpc("mp_lead_update", { p_lead: id, p_status: newStatus, p_note: null, p_follow_up: null, p_lost_reason: null, p_mark_contacted: false })));
    setBusy(false); refresh();
  }

  return (
    <>
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="mb-3 flex justify-end">
        <button onClick={() => setShowAnalytics((v) => !v)} className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-ink/70 hover:border-ink/30">
          {showAnalytics ? "Hide analytics" : "Show analytics"}
        </button>
      </div>
      {showAnalytics && <div className="mb-5"><LeadAnalytics /></div>}

      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {([
          { label: "Total", val: stats?.total, onClick: () => { setStatus("all"); setAssigned("all"); setFollowUpDue(false); } },
          { label: "New today", val: stats?.today },
          { label: "Unassigned", val: stats?.unassigned, onClick: () => { setAssigned("unassigned"); setStatus("all"); } },
          { label: "Follow-up due", val: stats?.dueFollow, onClick: () => setFollowUpDue(true) },
          { label: "Converted", val: stats?.converted, onClick: () => setStatus("converted") },
          { label: "Lost", val: stats?.lost, onClick: () => setStatus("lost") },
        ] as { label: string; val?: number; onClick?: () => void }[]).map((k) => (
          <button key={k.label} onClick={k.onClick} disabled={!k.onClick}
            className="rounded-xl border border-hairline bg-white p-3 text-left transition enabled:hover:border-ink/30">
            <p className="font-display text-xl font-semibold text-ink">{k.val ?? "-"}</p>
            <p className="text-[11px] text-ink/55">{k.label}</p>
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code, name, phone, email…"
          className="min-w-[220px] flex-1 rounded-lg border border-hairline bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
        <Sel value={status} onChange={setStatus} label="Status" options={[["all", "All statuses"], ...LEAD_STATUSES.map((s) => [s, LEAD_STATUS_LABEL[s]] as [string, string])]} />
        <Sel value={assigned} onChange={setAssigned} label="Assigned" options={[["all", "Anyone"], ["unassigned", "Unassigned"], ...teachers.map((t) => [t.id, t.name] as [string, string])]} />
        <Sel value={source} onChange={setSource} label="Source" options={SOURCES.map((s) => [s, s === "all" ? "All sources" : s] as [string, string])} />
        <button onClick={() => setFollowUpDue((v) => !v)}
          className={cn("rounded-lg border px-3 py-2 text-sm font-medium", followUpDue ? "border-gold bg-gold/15 text-[#7A5E0F]" : "border-hairline text-ink/70")}>
          Follow-up due
        </button>
      </div>

      {sel.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-gold/40 bg-gold/[0.06] p-2.5">
          <span className="text-sm font-semibold text-ink">{sel.size} selected</span>
          <Sel value="" onChange={(v) => bulkAssign(v)} label="Assign to…" options={[["", "Assign to teacher…"], ...teachers.map((t) => [t.id, t.name] as [string, string])]} disabled={busy} />
          <Sel value="" onChange={(v) => bulkStatus(v)} label="Set status…" options={[["", "Set status…"], ...LEAD_STATUSES.map((s) => [s, LEAD_STATUS_LABEL[s]] as [string, string])]} disabled={busy} />
          <button onClick={() => setSel(new Set())} className="text-sm text-ink/60 hover:text-ink">Clear</button>
        </div>
      )}

      {rows === null ? <Loading /> : rows.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-white p-8 text-center text-sm text-ink/60">No leads match these filters.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-hairline bg-white">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-wide text-ink/50">
                <th className="w-8 p-3"><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
                <th className="p-3">Lead</th><th className="p-3">Contact</th><th className="p-3">Instrument</th>
                <th className="p-3">Area</th><th className="p-3">Source</th><th className="p-3">Status</th>
                <th className="p-3">Assigned</th><th className="p-3">Created</th><th className="p-3">Follow-up</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-hairline last:border-0 hover:bg-mist/40">
                  <td className="p-3"><input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} /></td>
                  <td className="p-3">
                    <p className="font-medium text-ink">{r.student_name || r.parent_name || "-"}{r.enquiry_count > 1 && <span className="ml-1.5 rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#7A5E0F]">×{r.enquiry_count}</span>}</p>
                    <p className="font-mono text-[11px] text-ink/45">{r.lead_code}</p>
                  </td>
                  <td className="p-3 text-ink/70"><p>{r.phone || "-"}</p><p className="text-[11px] text-ink/45">{r.email || ""}</p></td>
                  <td className="p-3 text-ink/70">{r.instrument_interest || "-"}</td>
                  <td className="p-3 text-ink/70">{r.preferred_area || "-"}</td>
                  <td className="p-3 text-ink/60">{r.source || "-"}</td>
                  <td className="p-3"><span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", LEAD_STATUS_TONE[r.status] || "bg-ink/10 text-ink/60")}>{LEAD_STATUS_LABEL[r.status] || r.status}</span></td>
                  <td className="p-3 text-ink/70">{r.assigned_teacher_id ? (teacherName[r.assigned_teacher_id] || "-") : <span className="text-ink/40">, </span>}</td>
                  <td className="p-3 text-[11px] text-ink/55">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td className="p-3 text-[11px]">{r.next_follow_up_at ? <span className={cn(new Date(r.next_follow_up_at) < new Date() ? "font-semibold text-red-600" : "text-ink/60")}>{new Date(r.next_follow_up_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span> : <span className="text-ink/35">, </span>}</td>
                  <td className="p-3"><button onClick={() => setOpenId(r.id)} className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper">Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows && total > PAGE_SIZE && (
        <div className="mt-3 flex items-center justify-between text-sm text-ink/60">
          <span>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="rounded-lg border border-hairline px-3 py-1.5 disabled:opacity-40">Prev</button>
            <span className="px-2 py-1.5">Page {page + 1} / {pages}</span>
            <button disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-hairline px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {openId && <LeadDetailPanel leadId={openId} teachers={teachers} onClose={() => setOpenId(null)} onChanged={refresh} />}
    </>
  );
}

function Sel({ value, onChange, label, options, disabled }: { value: string; onChange: (v: string) => void; label: string; options: [string, string][]; disabled?: boolean }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
      className="rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none disabled:opacity-50">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
