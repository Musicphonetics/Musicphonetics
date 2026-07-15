"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState, formatMoney } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, studentView, type ParentData } from "@/lib/supabase/parent";
import { PaymentDoc } from "@/components/portal/PaymentDoc";
import { studentPlan, PLAN_LABEL } from "@/lib/plan";
import { whatsappLink } from "@/lib/data";
import type { Payment } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const pretty = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// The plans a parent can pay for, straight into the tested Razorpay flow (/pay).
const PLANS = [
  { key: "foundation", name: "Foundation", amount: 8000, cadence: "32-class beginner journey" },
  { key: "main", name: "Main Pathway", amount: 12000, cadence: "8 classes / month" },
];

export default function ParentPayments() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [planKey, setPlanKey] = useState<string>("");
  const [receipt, setReceipt] = useState<Payment | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadParentData().then((d) => { setErr(d.error); setData(d); });
  }, []);

  const student = data?.students[idx] ?? null;
  const view = useMemo(() => (data && student ? studentView(data, student) : null), [data, student]);
  const pays = useMemo(() => (data && student ? data.payments.filter((p) => p.student_id === student.id) : []), [data, student]);

  // Default the selected plan to the student's current plan.
  const currentPlanKey = student ? ((student.fee_quoted ?? 8000) < 12000 ? "foundation" : "main") : "";
  const chosen = planKey || currentPlanKey;
  const plan = PLANS.find((p) => p.key === chosen) ?? PLANS[0];
  const amount = student?.fee_quoted ?? plan.amount;
  const payHref = student
    ? `/pay?plan=${plan.key}&amt=${amount}&name=${encodeURIComponent(student.name)}${student.instrument ? `&instrument=${encodeURIComponent(student.instrument)}` : ""}`
    : "/pay";

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Musicphonetics" subtitle="Fees & Renewal">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp to link your child's profile." />
      ) : view && student ? (
        <div className="space-y-4">
          <h1 className="font-display text-[1.6rem] font-semibold leading-tight text-ink">Fees &amp; renewal</h1>

          {data.students.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.students.map((s, i) => (
                <button key={s.id} onClick={() => { setIdx(i); setPlanKey(""); }}
                  className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium", i === idx ? "bg-gold text-ink" : "border border-hairline text-ink/70")}>{s.name.split(" ")[0]}</button>
              ))}
            </div>
          )}

          {/* Current status */}
          <div className="rounded-3xl border border-hairline bg-white p-5 shadow-[0_12px_34px_-20px_rgba(22,27,38,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Current fee</p>
            <p className="mt-1 font-display text-3xl font-semibold text-ink">{student.fee_quoted ? formatMoney(student.fee_quoted) : "As confirmed"}<span className="text-base font-normal text-ink/70"> / month</span></p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ink/[0.05] px-3 py-1 text-xs font-medium text-ink/75">Status: {view.paymentStatus}</span>
              {view.renewalDue
                ? <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">Renewal due · {view.remaining} classes left</span>
                : <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>}
            </div>
          </div>

          {/* Choose plan + pay */}
          <div className="rounded-3xl border border-hairline bg-white p-5 shadow-[0_12px_34px_-20px_rgba(22,27,38,0.2)]">
            <p className="text-sm font-semibold text-ink">Renew or pay your fees</p>
            <p className="mt-1 text-xs text-ink/70">Choose the plan and pay securely online. You&apos;ll get a confirmation the moment it&apos;s done.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {PLANS.map((p) => {
                const active = chosen === p.key;
                return (
                  <button key={p.key} onClick={() => setPlanKey(p.key)}
                    className={cn("rounded-2xl border p-3 text-left transition-colors", active ? "border-gold bg-gold/10" : "border-hairline hover:border-ink/30")}>
                    <span className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">{p.name}</span>
                      <span className={cn("grid h-4 w-4 place-items-center rounded-full border", active ? "border-gold bg-gold" : "border-ink/30")}>
                        {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4 10-10" stroke="#161B26" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                    </span>
                    <span className="mt-1 block font-display text-lg font-semibold text-[#7A5E0F]">₹{p.amount.toLocaleString("en-IN")}</span>
                    <span className="block text-[11px] text-ink/65">{p.cadence}</span>
                  </button>
                );
              })}
            </div>
            <Link href={payHref}
              className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gold text-base font-semibold text-ink hover:bg-deep-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" /><path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" /></svg>
              Pay {formatMoney(amount)} securely
            </Link>
            <p className="mt-2.5 text-center text-[11px] text-ink/65">Billed only in the Musicphonetics name, through a secure payment link.</p>
          </div>

          <a href={whatsappLink(`Hi Musicphonetics, I have a question about ${student.name.split(" ")[0]}'s fees.`)}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-hairline py-3 text-sm font-semibold text-ink/80 hover:border-ink/40">
            Question about fees? Message us
          </a>

          {/* History */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/70">Payment history</p>
            {pays.length === 0 ? (
              <p className="rounded-2xl border border-hairline bg-white p-5 text-sm text-ink/70">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {pays.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-2xl border border-hairline bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{pretty(p.payment_date)}</p>
                      <p className="mt-0.5 text-xs text-ink/65">{p.billing_cycle || "Monthly"}</p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="font-semibold text-ink">{formatMoney(p.amount_paid)}</p>
                        <span className={cn("text-[11px] font-semibold", p.payment_status === "Received" ? "text-emerald-700" : "text-[#7A5E0F]")}>{p.payment_status}</span>
                      </div>
                      <button onClick={() => setReceipt(p)} className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink/70 hover:border-ink/40" aria-label="View receipt">Receipt</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : <Loading />}

      {receipt && student && (
        <div className="fixed inset-0 z-[70] grid place-items-start overflow-y-auto bg-charcoal/50 p-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-2xl py-6">
            <PaymentDoc
              payment={receipt}
              kind={/received/i.test(receipt.payment_status) ? "receipt" : "invoice"}
              studentName={student.name}
              studentCode={student.student_code}
              planName={PLAN_LABEL[studentPlan(student)]}
              onClose={() => setReceipt(null)}
            />
          </div>
        </div>
      )}
    </PortalShell>
  );
}
