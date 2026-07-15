"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import type { AuditLog } from "@/lib/supabase/types";

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const pretty = (a: string) => a.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function OwnerAudit() {
  const [rows, setRows] = useState<AuditLog[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) { setRows([]); return; }
    getSupabase().from("audit_logs").select("*").order("created_at", { ascending: false }).limit(400)
      .then(({ data, error }) => { if (error) setErr(error.message); setRows((data as AuditLog[]) ?? []); });
  }, []);

  const actions = useMemo(() => [...new Set((rows ?? []).map((r) => r.action))].sort(), [rows]);
  const filtered = useMemo(() => (rows ?? []).filter((r) => {
    if (action && r.action !== action) return false;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return [r.action, r.summary, r.actor_role, r.entity_type, r.entity_id].filter(Boolean).join(" ").toLowerCase().includes(needle);
  }), [rows, q, action]);

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Audit log">
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-ink/60">An append-only record of important operational activity. Read-only; never editable. Sensitive data (passwords, tokens, full bank/ID details) is never stored here.</p>
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err} — have you run the operations upgrade migration?</div>}

      <div className="mb-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
          className="min-w-[200px] flex-1 rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
        <select value={action} onChange={(e) => setAction(e.target.value)}
          className="rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none">
          <option value="">All actions</option>
          {actions.map((a) => <option key={a} value={a}>{pretty(a)}</option>)}
        </select>
      </div>

      {!rows ? <Loading /> : filtered.length === 0 ? (
        <EmptyState title="No activity yet" hint="Approvals, assignments, class logs, payments, reports and documents will appear here." />
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-white p-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{pretty(r.action)}</p>
                <p className="text-xs text-ink/60">{r.summary || r.entity_type || "—"}{r.actor_role ? ` · by ${r.actor_role}` : ""}</p>
              </div>
              <span className="shrink-0 text-xs text-ink/45">{when(r.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
