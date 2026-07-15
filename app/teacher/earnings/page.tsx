"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { Payment, Payout, StudentStat } from "@/lib/supabase/types";
import { feeBreakdown, inr } from "@/lib/money";
import { cn } from "@/lib/utils";

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
const dd = (iso: string) => new Date(iso + (iso.length <= 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const isReceived = (p: Payment) => /received/i.test(p.payment_status);

export default function TeacherEarnings() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [students, setStudents] = useState<StudentStat[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setPayments([]); return; }
    const sb = getSupabase();
    sb.from("payments").select("*").order("payment_date", { ascending: false }).then(({ data }) => setPayments((data as Payment[]) ?? []));
    sb.from("payouts").select("*").then(({ data }) => setPayouts((data as Payout[]) ?? []));
    loadRoster().then(({ rows }) => setStudents(rows));
  }, []);

  const nameOf = useMemo(() => {
    const m: Record<string, { name: string; code: string | null }> = {};
    for (const s of students) m[s.student_id] = { name: s.name, code: s.student_code ?? null };
    return m;
  }, [students]);

  const summary = useMemo(() => {
    const now = monthKey(new Date());
    let month = 0, lifetime = 0;
    for (const p of payments ?? []) {
      if (!isReceived(p)) continue;
      const share = feeBreakdown(p).teacherShare;
      lifetime += share;
      if (monthKey(new Date(p.payment_date)) === now) month += share;
    }
    const pendingPayout = payouts.filter((p) => p.status === "pending" || p.status === "advance_paid").reduce((a, p) => a + (p.balance ?? 0), 0);
    return { month, lifetime, pendingPayout };
  }, [payments, payouts]);

  const grouped = useMemo(() => {
    const g = new Map<string, Payment[]>();
    for (const p of payments ?? []) {
      const arr = g.get(p.student_id) ?? [];
      arr.push(p); g.set(p.student_id, arr);
    }
    return [...g.entries()].sort((a, b) => (nameOf[a[0]]?.name || "").localeCompare(nameOf[b[0]]?.name || ""));
  }, [payments, nameOf]);

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Earnings">
      {!payments ? <Loading /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Sum label="Earned this month" value={inr(summary.month)} tone="green" />
            <Sum label="Pending payout" value={inr(summary.pendingPayout)} tone="gold" />
            <Sum label="Paid lifetime (70%)" value={inr(summary.lifetime)} />
          </div>

          <Link href="/teacher/payments" className="flex items-center justify-center gap-2 rounded-full border border-hairline bg-white py-3 text-sm font-semibold text-ink/80 hover:border-ink/40">
            + Record a payment
          </Link>

          <p className="text-xs leading-relaxed text-ink/60">
            Your share is <b>70% of the net settled amount</b> (after the payment-gateway charge, ~3% when the
            actual isn&apos;t known yet). Payouts are made after each payment settles and is verified.
          </p>

          {grouped.length === 0 ? (
            <EmptyState title="No earnings yet" hint="When payments are recorded for your students, your share appears here." />
          ) : grouped.map(([sid, rows]) => {
            const info = nameOf[sid];
            const total = rows.filter(isReceived).reduce((a, p) => a + feeBreakdown(p).teacherShare, 0);
            return (
              <div key={sid} className="overflow-hidden rounded-2xl border border-hairline bg-white">
                <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                  <div>
                    <p className="font-semibold text-ink">{info?.name || "Student"}</p>
                    {info?.code && <p className="text-xs font-mono text-ink/55">{info.code}</p>}
                  </div>
                  <p className="text-sm font-semibold text-[#7A5E0F]">{inr(total)}</p>
                </div>
                <div className="divide-y divide-hairline/70">
                  {rows.map((p) => {
                    const f = feeBreakdown(p);
                    return (
                      <div key={p.id} className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-ink/70">{dd(p.payment_date)}</span>
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", isReceived(p) ? "bg-feature-green/12 text-feature-green" : "bg-gold/15 text-[#7A5E0F]")}>{p.payment_status}</span>
                        </div>
                        <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink/70 sm:grid-cols-4">
                          <span>Gross <b className="text-ink">{inr(f.gross)}</b></span>
                          <span>Charge{f.gatewayEstimated ? " (est.)" : ""} <b className="text-ink">{inr(f.gatewayCharge)}</b></span>
                          <span>Net <b className="text-ink">{inr(f.net)}</b></span>
                          <span>Your 70% <b className="text-[#7A5E0F]">{inr(f.teacherShare)}</b></span>
                        </div>
                        {p.settlement_status && <p className="mt-1 text-[11px] text-ink/50">Settlement: {p.settlement_status}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PortalShell>
  );
}

function Sum({ label, value, tone = "ink" }: { label: string; value: string; tone?: "ink" | "gold" | "green" }) {
  const c = { ink: "text-ink", gold: "text-[#7A5E0F]", green: "text-feature-green" }[tone];
  return (
    <div className="rounded-2xl border border-hairline bg-white p-3.5 text-center">
      <p className={cn("font-display text-lg font-semibold", c)}>{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink/55">{label}</p>
    </div>
  );
}
