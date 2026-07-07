"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SCHEDULE_POLICY, BILLING_POLICY, computeProrata } from "@/lib/policy";
import { loadEnrolment, type Enrolment } from "@/lib/enrolment";

const PLANS: Record<string, { name: string; amount: number | null }> = {
  foundation: { name: "Foundation", amount: 8000 },
  main: { name: "Main Musicphonetics Pathway", amount: 12000 },
  "directors-circle": { name: "Director's Circle", amount: null },
};

const prettyDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const TERMS_AGREED = [
  "Fees are paid only through the official Musicphonetics Cashfree link.",
  "8 classes per month, to be completed within 35 days of the cycle start.",
  "Unused classes lapse after 35 days; the cycle must be renewed to continue.",
  "Rescheduling is allowed with advance notice, subject to teacher availability.",
  "The final teacher, slot and start are confirmed by the Musicphonetics office.",
  "Refunds follow the published Refund & Payment Standard.",
  "Respectful conduct and a safe learning environment are expected at all times.",
];

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export function OnboardingDocument() {
  const params = useSearchParams();

  // The enrolment the family filled on /pay carries through Cashfree via
  // localStorage. That is the source of truth here - this document is never
  // pre-filled by the office. URL params remain a fallback for office links.
  const [en, setEn] = useState<Enrolment | null>(null);
  useEffect(() => setEn(loadEnrolment()), []);

  const planKey = (en?.planKey || params.get("plan") || "").toLowerCase();
  const plan = PLANS[planKey];
  const name = en?.name || params.get("name") || "";
  const days = (en?.days?.length ? en.days.join(", ") : "") || params.get("days") || "";
  const mode = en?.mode || params.get("mode") || "";
  const level = en?.level || "";
  const instrument = en?.instrument || params.get("instrument") || "";
  const teacher = params.get("teacher") || "";
  const startDate = en?.startDate || "";
  const amtParam = Math.round(Number(params.get("amt") || ""));
  const monthly = (en?.monthly && en.monthly > 0 ? en.monthly : (Number.isFinite(amtParam) && amtParam > 0 ? amtParam : plan?.amount)) ?? null;

  // Pro-rate from the family's chosen start date when we have it.
  const pr = monthly ? computeProrata(monthly, startDate ? new Date(startDate + "T00:00:00") : new Date()) : null;
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const ref = "MP-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

  return (
    <div className="mx-auto max-w-2xl">
      <div id="enrolment-doc" className="rounded-3xl border border-hairline bg-white p-7 shadow-card sm:p-10">
        {/* Letterhead */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <p className="font-display text-xl font-semibold text-ink">Musicphonetics</p>
            <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-[#7A5E0F]">Course Enrolment Confirmation</p>
          </div>
          <div className="text-right text-xs text-ink/60">
            <p>Date: {today}</p>
            <p>Ref: {ref}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field label="Student / Enrolee" value={name || "As provided at payment"} />
          <Field label="Programme" value={plan?.name || "Musicphonetics classes"} />
          <Field label="Instrument" value={instrument || "Confirmed on WhatsApp"} />
          <Field label="Current level" value={level || "Assessed in the first class"} />
          <Field label="Classes" value="8 classes per month · 1 hour each" />
          <Field label="Monthly fee" value={monthly ? `${inr(monthly)} / month` : "As confirmed by the office"} />
        </div>

        {/* Your setup */}
        <SectionTitle>Your class setup</SectionTitle>
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field label="Preferred days" value={days || "Confirmed on WhatsApp"} />
          <Field label="Mode of classes" value={mode || "Confirmed on WhatsApp"} />
          <Field label="Requested start date" value={startDate ? prettyDate(startDate) : "Confirmed on WhatsApp"} />
          <Field label="Assigned teacher" value={teacher || "Matched & confirmed on WhatsApp"} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink/60">
          Our team confirms your teacher, days and mode personally on WhatsApp, immediately after enrolment.
        </p>

        {/* Class schedule policy */}
        <SectionTitle>Class schedule</SectionTitle>
        <ul className="space-y-2">
          {SCHEDULE_POLICY.map((s) => <Bullet key={s}>{s}</Bullet>)}
        </ul>

        {/* Billing */}
        <SectionTitle>Fees &amp; billing</SectionTitle>
        <ul className="space-y-2">
          {BILLING_POLICY.map((s) => <Bullet key={s}>{s}</Bullet>)}
        </ul>
        {pr && pr.day > 2 && (
          <div className="mt-3 rounded-xl bg-paper p-4 text-sm text-ink/75">
            <b className="text-ink">Your first payment</b> is pro-rated to <b className="text-ink">{inr(pr.firstPayment)}</b> for the {pr.remainingDays} days left this month. Your next payment of <b className="text-ink">{inr(pr.monthly)}</b> is due on <b className="text-ink">{pr.nextDueLabel}</b>, and on the 1st of every month thereafter.
          </div>
        )}

        {/* Terms agreed */}
        <SectionTitle>Terms &amp; conditions agreed</SectionTitle>
        <ol className="space-y-2">
          {TERMS_AGREED.map((t, i) => (
            <li key={t} className="flex gap-3 text-sm leading-relaxed text-ink/80">
              <span className="font-semibold text-[#7A5E0F]">{i + 1}.</span> {t}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-ink/60">
          Full documents: <Link href="/standards/terms-conditions" className="font-semibold text-[#7A5E0F] underline underline-offset-2">Terms &amp; Conditions</Link> · <Link href="/standards/refund-payment" className="font-semibold text-[#7A5E0F] underline underline-offset-2">Refund &amp; Payment</Link>.
        </p>

        {/* Acknowledgement + signature */}
        <div className="mt-8 border-t border-hairline pt-6">
          <p className="text-sm leading-relaxed text-ink/75">
            By enrolling and completing payment, the student/parent confirms they have read and accepted the schedule, billing and terms set out above.
          </p>
          <div className="mt-6">
            <p className="font-display text-base font-semibold text-[#7A5E0F]">Abhishek Kumar</p>
            <p className="text-xs text-ink/60">Founder &amp; Director, Musicphonetics · Delhi NCR</p>
          </div>
        </div>
      </div>

      {/* Actions (not printed) */}
      <div className="no-print mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-[#0f131c]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Print / Save as PDF
        </button>
        <Link href="/support" className="text-sm font-semibold text-[#7A5E0F] underline underline-offset-2">Any questions? We reply immediately</Link>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-8 font-display text-lg font-semibold text-ink">{children}</h3>;
}
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/80">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-[#7A5E0F]"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {children}
    </li>
  );
}
