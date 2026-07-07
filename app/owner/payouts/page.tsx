"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, formatMoney, Toast } from "@/components/portal/kit";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadOwnerData, rollupTeachers, type OwnerData } from "@/lib/supabase/owner";
import type { Payout } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const STATUSES = ["pending", "advance_paid", "settled", "on_hold"];
const period = () => new Date().toLocaleString("en-IN", { month: "short", year: "numeric" });

export default function OwnerPayouts() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const reload = () => loadOwnerData().then(setData);
  useEffect(() => { if (isSupabaseConfigured()) reload(); }, []);

  const earnedByTeacher = useMemo(() => {
    const m = new Map<string, number>();
    if (data) for (const t of rollupTeachers(data)) m.set(t.id, t.teacherShare);
    return m;
  }, [data]);

  if (!data) return <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Payouts"><Loading /></PortalShell>;

  const advancesByTeacher = new Map<string, number>();
  for (const p of data.payouts) advancesByTeacher.set(p.teacher_id, (advancesByTeacher.get(p.teacher_id) ?? 0) + (p.advance_paid ?? 0));

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Payouts">
      <p className="mb-4 text-sm text-ink/60">Teacher payout is advance-based on the 70% share. This is the only place payout status is managed - teachers never see it.</p>
      <div className="space-y-3">
        {data.teachers.map((t) => {
          const earned = earnedByTeacher.get(t.id) ?? 0;
          const advanced = advancesByTeacher.get(t.id) ?? 0;
          const balance = earned - advanced;
          const rows = data.payouts.filter((p) => p.teacher_id === t.id).sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
          return (
            <div key={t.id} className="overflow-hidden rounded-2xl border border-hairline bg-white">
              <button onClick={() => setOpenId(openId === t.id ? null : t.id)} className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left">
                <span className="font-semibold text-ink">{t.full_name || "(unnamed)"}</span>
                <span className="flex flex-wrap gap-4 text-sm">
                  <Metric label="Earned 70%" value={formatMoney(earned)} />
                  <Metric label="Advanced" value={formatMoney(advanced)} />
                  <Metric label="Balance" value={formatMoney(balance)} tone={balance > 0 ? "green" : "ink"} />
                </span>
              </button>
              {openId === t.id && (
                <PayoutPanel teacherId={t.id} earned={earned} rows={rows}
                  onSaved={(msg, ok) => { setToast({ kind: ok ? "success" : "error", message: msg }); if (ok) reload(); }} />
              )}
            </div>
          );
        })}
        {data.teachers.length === 0 && <p className="text-sm text-ink/50">No teachers yet.</p>}
      </div>
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </PortalShell>
  );
}

function PayoutPanel({ teacherId, earned, rows, onSaved }: {
  teacherId: string; earned: number; rows: Payout[]; onSaved: (msg: string, ok: boolean) => void;
}) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("advance_paid");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function record() {
    const amt = Number(amount);
    if (!amt || amt <= 0) { onSaved("Enter an amount.", false); return; }
    setBusy(true);
    const { error } = await getSupabase().from("payouts").insert({
      teacher_id: teacherId, period: period(), total_earned: Math.round(earned),
      advance_paid: amt, status, last_paid: new Date().toISOString().slice(0, 10), notes: notes || null,
    });
    setBusy(false);
    onSaved(error ? error.message : "Payout recorded.", !error);
    if (!error) { setAmount(""); setNotes(""); }
  }

  return (
    <div className="border-t border-hairline bg-paper p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink">Advance / settlement (₹)</span>
          <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" placeholder="0" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink">Note</span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" placeholder="Optional" />
        </label>
        <button onClick={record} disabled={busy} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-60">
          {busy ? "Saving…" : "Record"}
        </button>
      </div>

      {rows.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink/60">History</p>
          <ul className="space-y-1.5">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-2 text-xs text-ink/75">
                <span>{p.period} · {p.status}{p.notes ? ` · ${p.notes}` : ""}</span>
                <span className="font-semibold">{formatMoney(p.advance_paid)} <span className="text-ink/50">(bal {formatMoney(p.balance)})</span></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, tone = "ink" }: { label: string; value: string; tone?: "ink" | "green" }) {
  return (
    <span className="text-right">
      <span className={cn("block font-display text-base font-semibold", tone === "green" ? "text-feature-green" : "text-ink")}>{value}</span>
      <span className="block text-[10px] uppercase tracking-wide text-ink/55">{label}</span>
    </span>
  );
}
