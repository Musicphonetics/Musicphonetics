"use client";

import { printDoc } from "@/lib/print";
import { feeBreakdown, inr } from "@/lib/money";
import type { Payment } from "@/lib/supabase/types";

// A printable A4 invoice or receipt. `showSplit` reveals the internal
// gateway-charge → 70/30 breakdown (owner/teacher only — never on a family copy).

const d = (iso?: string | null) =>
  iso ? new Date(iso + (iso.length <= 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

export function PaymentDoc({
  payment: p, kind, studentName, studentCode, planName, teacherName, showSplit = false, onClose,
}: {
  payment: Payment; kind: "invoice" | "receipt"; studentName: string; studentCode?: string | null;
  planName?: string | null; teacherName?: string | null; showSplit?: boolean; onClose?: () => void;
}) {
  const f = feeBreakdown(p);
  const paid = /received/i.test(p.payment_status);
  const docNo = kind === "receipt"
    ? (p.receipt_number || `MP-RCPT-${p.id.slice(0, 8).toUpperCase()}`)
    : (p.invoice_number || `MP-INV-${p.id.slice(0, 8).toUpperCase()}`);
  const domId = `pay-doc-${p.id}`;

  return (
    <div className="mx-auto max-w-2xl">
      <div id={domId} className="rounded-2xl border border-hairline bg-white p-7 shadow-card sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-5">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-ink">MUSICPHONETICS</p>
            <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A5E0F]">{kind === "receipt" ? "Payment Receipt" : "Invoice"}</p>
            <p className="mt-1 text-xs text-ink/65">Structured Music Education · Delhi NCR + Online</p>
          </div>
          <div className="text-right text-[11px] leading-relaxed text-ink/70">
            <p>{kind === "receipt" ? "Receipt" : "Invoice"} No: <span className="font-semibold text-ink">{docNo}</span></p>
            <p>Date: <span className="font-semibold text-ink">{d(p.payment_date)}</span></p>
            <p>Status: <span className={paid ? "font-semibold text-emerald-600" : "font-semibold text-[#7A5E0F]"}>{paid ? "PAID" : p.payment_status}</span></p>
          </div>
        </div>

        <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <Field label="Billed to" value={studentName} />
          <Field label="Student code" value={studentCode || "—"} />
          <Field label="Programme" value={planName || "Musicphonetics classes"} />
          <Field label="Billing cycle" value={p.payment_cycle || p.billing_cycle || "Monthly"} />
          <Field label="Classes included" value={p.classes_included != null ? String(p.classes_included) : "8 classes / month"} />
          {p.renewal_due_date && <Field label="Renewal due" value={d(p.renewal_due_date)} />}
          {teacherName && <Field label="Teacher" value={teacherName} />}
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-wide text-ink/55">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-ink/85">
            <tr className="border-b border-hairline/70">
              <td className="py-2.5">{planName || "Music classes"} — {p.payment_cycle || p.billing_cycle || "monthly fee"}</td>
              <td className="py-2.5 text-right">{inr(f.gross)}</td>
            </tr>
            {(p.discount ?? 0) > 0 && (
              <tr className="border-b border-hairline/70">
                <td className="py-2.5">Discount</td>
                <td className="py-2.5 text-right">− {inr(p.discount as number)}</td>
              </tr>
            )}
            <tr className="border-t border-ink/70 font-semibold text-ink">
              <td className="py-3">{kind === "receipt" ? "Amount paid" : "Amount due"}</td>
              <td className="py-3 text-right font-display text-lg">{inr(f.gross - (p.discount ?? 0))}</td>
            </tr>
            {(p.outstanding_amount ?? 0) > 0 && (
              <tr className="text-[#7A5E0F]">
                <td className="py-1.5">Outstanding</td>
                <td className="py-1.5 text-right font-semibold">{inr(p.outstanding_amount as number)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {showSplit && (
          <div className="mt-5 overflow-hidden rounded-xl border border-hairline">
            <div className="bg-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gold">Internal settlement</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 p-4 text-sm text-ink/80 sm:grid-cols-4">
              <Field label="Gross" value={inr(f.gross)} />
              <Field label={`Gateway charge${f.gatewayEstimated ? " (est.)" : ""}`} value={inr(f.gatewayCharge)} />
              <Field label="Net settled" value={inr(f.net)} />
              <Field label="Teacher 70%" value={inr(f.teacherShare)} />
              <Field label="Company 30%" value={inr(f.companyShare)} />
              {p.settlement_status && <Field label="Settlement" value={p.settlement_status} />}
              {p.razorpay_payment_id && <Field label="Razorpay id" value={p.razorpay_payment_id} />}
            </div>
            {f.gatewayEstimated && <p className="border-t border-hairline px-4 py-2 text-[11px] text-ink/60">Gateway charge is estimated (~3%) until the settlement report confirms the actual amount.</p>}
          </div>
        )}

        <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-mist px-4 py-3 text-xs text-ink/65">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-[#7A5E0F]"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          All fees are billed only in the Musicphonetics name through a secure payment gateway. This is a
          computer-generated document.
        </div>
      </div>

      <div className="no-print mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button onClick={() => printDoc(domId)} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-[#0f131c]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Print / Save as PDF
        </button>
        {onClose && <button onClick={onClose} className="text-sm font-semibold text-ink/70 hover:text-ink">Close</button>}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/55">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
