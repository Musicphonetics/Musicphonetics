"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState, formatMoney } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, studentView, type ParentData } from "@/lib/supabase/parent";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

const pretty = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function ParentPayments() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadParentData().then((d) => { setErr(d.error); setData(d); });
  }, []);

  const student = data?.students[idx] ?? null;
  const view = useMemo(() => (data && student ? studentView(data, student) : null), [data, student]);
  const pays = useMemo(() => (data && student ? data.payments.filter((p) => p.student_id === student.id) : []), [data, student]);
  // Parents never see teacher share / company share - only what they paid.

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Fees & renewal">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp to link your child's profile." />
      ) : view && student ? (
        <div className="space-y-4">
          {data.students.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.students.map((s, i) => (
                <button key={s.id} onClick={() => setIdx(i)}
                  className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium", i === idx ? "bg-ink text-paper" : "border border-hairline bg-white text-ink/70")}>{s.name}</button>
              ))}
            </div>
          )}

          {/* Current status */}
          <div className="rounded-2xl border border-hairline bg-ink p-5 text-paper">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">Current fee</p>
            <p className="mt-1 font-display text-3xl font-semibold">{student.fee_quoted ? formatMoney(student.fee_quoted) : "As confirmed"}<span className="text-base font-normal text-paper/60"> / month</span></p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">Status: {view.paymentStatus}</span>
              {view.renewalDue
                ? <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">Renewal due · {view.remaining} classes left</span>
                : <span className="rounded-full bg-feature-green/25 px-3 py-1 text-xs font-semibold text-emerald-200">Active</span>}
            </div>
          </div>

          {/* Renew */}
          <a href={whatsappLink(`Hi Musicphonetics, I'd like to renew ${student.name}'s classes.`)}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-ink hover:bg-deep-gold">
            Renew / pay fees
          </a>
          <p className="text-center text-xs text-ink/55">All fees are billed only in the Musicphonetics name, through a secure payment link.</p>

          {/* History */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">Payment history</p>
            {pays.length === 0 ? (
              <p className="rounded-2xl border border-hairline bg-white p-5 text-sm text-ink/55">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {pays.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-2xl border border-hairline bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{pretty(p.payment_date)}</p>
                      <p className="mt-0.5 text-xs text-ink/55">
                        {p.billing_cycle || "Monthly"}{p.cashfree_bill_no ? ` · Ref ${p.cashfree_bill_no}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ink">{formatMoney(p.amount_paid)}</p>
                      <span className={cn("text-[11px] font-semibold",
                        p.payment_status === "Received" ? "text-feature-green" : "text-[#7A5E0F]")}>{p.payment_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : <Loading />}
    </PortalShell>
  );
}
