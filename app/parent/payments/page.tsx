"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState, formatMoney } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, studentView, type ParentData } from "@/lib/supabase/parent";
import { isValidCompleted } from "@/lib/attendance";
import { PaymentDoc } from "@/components/portal/PaymentDoc";
import { studentPlan, PLAN_LABEL } from "@/lib/plan";
import { whatsappLink } from "@/lib/data";
import type { Payment } from "@/lib/supabase/types";
import { useSelectedStudent } from "@/lib/family";
import { FamilySwitcher } from "@/components/parent/FamilySwitcher";
import { AdvanceFeeCard } from "@/components/parent/AdvanceFeeCard";
import { cn } from "@/lib/utils";

const pretty = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Already-enrolled families renew here — the monthly fee is paid on the single
// official Musicphonetics monthly payment page (NOT the new-enrolment form).
const RENEWAL_LINK = "https://rzp.io/rzp/mpmonthly";

export default function ParentPayments() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const reload = () => loadParentData().then((d) => { setErr(d.error); setData(d); });
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    reload();
  }, []);

  const { student, select } = useSelectedStudent(data?.students);
  const view = useMemo(() => (data && student ? studentView(data, student) : null), [data, student]);
  const pays = useMemo(() => (data && student ? data.payments.filter((p) => p.student_id === student.id) : []), [data, student]);
  const completedDates = useMemo(
    () => (data && student
      ? data.classes.filter((c) => c.student_id === student.id && isValidCompleted(c)).map((c) => c.class_date)
      : []),
    [data, student],
  );
  const switcher = data
    ? <FamilySwitcher students={data.students} selectedId={student?.id ?? null} onSelect={select} onAdded={reload} />
    : null;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Musicphonetics" subtitle="Fees & Renewal" headerRight={switcher}>
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp to link your child's profile." />
      ) : view && student ? (
        <div className="space-y-4">
          <h1 className="font-display text-[1.6rem] font-semibold leading-tight text-ink">Fees &amp; renewal</h1>

          {/* Family fees — tick children, adjust the amount, pay in one go */}
          {data.students.length > 1 && <FamilyPay data={data} onFocus={select} focusedId={student.id} link={RENEWAL_LINK} />}

          {/* Current status (selected child) */}
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

          {/* Classes & fees — progress bar of classes used vs paid-for */}
          <AdvanceFeeCard student={student} payments={pays} completed={view.completed} completedDates={completedDates} />

          {/* Renew — pay the monthly fee on the official payment page */}
          <div className="rounded-3xl border border-hairline bg-white p-5 shadow-[0_12px_34px_-20px_rgba(22,27,38,0.2)]">
            <p className="text-sm font-semibold text-ink">Renew {student.name.split(" ")[0]}&apos;s monthly fee</p>
            <p className="mt-1 text-xs text-ink/70">
              Pay your monthly fee securely on the official Musicphonetics payment page. Your classes continue without a break.
            </p>
            {student.fee_quoted ? (
              <div className="mt-4 flex items-baseline justify-between rounded-2xl border border-hairline bg-mist/50 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wide text-ink/60">{PLAN_LABEL[studentPlan(student)]} · monthly</span>
                <span className="font-display text-xl font-semibold text-[#7A5E0F]">{formatMoney(student.fee_quoted)}</span>
              </div>
            ) : null}
            <a href={RENEWAL_LINK} target="_blank" rel="noopener noreferrer"
              className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gold text-base font-semibold text-ink hover:bg-deep-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" /><path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" /></svg>
              Pay monthly fee securely
            </a>
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
                      <p className="mt-0.5 text-xs text-ink/65">
                        {p.billing_cycle || "Monthly"}
                        {/received/i.test(p.payment_status) && p.payment_mode && <span> · paid via {p.payment_mode}</span>}
                      </p>
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

// Family fees: tick which children to pay for, adjust the amount if needed, then
// pay in one go on the official page. The payment link is the same — the amount
// shown is what to enter there; the office reconciles it to the ticked children.
function FamilyPay({ data, onFocus, focusedId, link }: { data: ParentData; onFocus: (id: string) => void; focusedId?: string; link: string }) {
  const students = data.students;
  const sumOf = (ids: Set<string>) => students.reduce((t, s) => t + (ids.has(s.id) ? (s.fee_quoted ?? 0) : 0), 0);
  const [sel, setSel] = useState<Set<string>>(() => new Set(students.map((s) => s.id)));
  const [amount, setAmount] = useState<string>(() => String(sumOf(new Set(students.map((s) => s.id)))));

  function toggle(id: string) {
    const n = new Set(sel);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSel(n);
    setAmount(String(sumOf(n)));
  }

  return (
    <div className="rounded-3xl border border-gold/40 bg-white p-5 shadow-[0_12px_34px_-20px_rgba(22,27,38,0.2)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Family fees · {students.length} children</p>
      <p className="mt-0.5 text-xs text-ink/60">Tick who you&apos;re paying for, then pay in one go.</p>

      <div className="mt-3 divide-y divide-hairline">
        {students.map((s) => {
          const sv = studentView(data, s);
          const paid = /received/i.test(sv.paymentStatus);
          const checked = sel.has(s.id);
          return (
            <div key={s.id} className="flex items-center gap-3 py-3">
              <input type="checkbox" checked={checked} onChange={() => toggle(s.id)} className="h-5 w-5 shrink-0 accent-gold" aria-label={`Include ${s.name}`} />
              <button onClick={() => onFocus(s.id)} className="min-w-0 flex-1 text-left">
                <p className={cn("truncate text-sm font-semibold", s.id === focusedId ? "text-[#7A5E0F]" : "text-ink")}>{s.name}</p>
                <p className="text-[11px] text-ink/55">{PLAN_LABEL[studentPlan(s)]} · {s.fee_quoted ? `${formatMoney(s.fee_quoted)}/mo` : "fee as confirmed"}</p>
              </button>
              <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", paid ? "bg-emerald-500/12 text-emerald-700" : "bg-gold/15 text-[#7A5E0F]")}>{paid ? "Paid" : sv.paymentStatus}</span>
            </div>
          );
        })}
      </div>

      {/* Amount to pay — auto-summed from ticked children, editable */}
      <label className="mt-3 flex items-center justify-between gap-3 border-t border-hairline pt-3">
        <span className="text-sm font-semibold text-ink">Amount to pay</span>
        <span className="flex items-center rounded-xl border border-hairline bg-white px-3 py-2">
          <span className="text-ink/50">₹</span>
          <input value={amount} inputMode="numeric" onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            className="w-24 bg-transparent text-right font-display text-lg font-semibold text-[#7A5E0F] focus:outline-none" aria-label="Amount to pay" />
        </span>
      </label>

      <a href={link} target="_blank" rel="noopener noreferrer"
        className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gold text-base font-semibold text-ink hover:bg-deep-gold">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" /><path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" /></svg>
        Pay {amount ? `₹${Number(amount).toLocaleString("en-IN")}` : ""} securely
      </a>
      <p className="mt-2.5 text-center text-[11px] leading-relaxed text-ink/60">
        On the secure page, enter <b className="text-ink/75">₹{amount ? Number(amount).toLocaleString("en-IN") : "0"}</b>. Billed only in the Musicphonetics name; the office reconciles it to the ticked children.
      </p>
    </div>
  );
}
