"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadEnrolment, type Enrolment } from "@/lib/enrolment";
import { printDoc } from "@/lib/print";

const PLANS: Record<string, { name: string; amount: number | null }> = {
  foundation: { name: "Foundation", amount: 8000 },
  main: { name: "Main Musicphonetics Pathway", amount: 12000 },
  "directors-circle": { name: "Director's Circle", amount: null },
};

const prettyDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

// Post-payment confirmation. The schedule, fees and terms were shown and
// agreed BEFORE payment (on the pay page). This document confirms the enrolment,
// restates that the terms were agreed, and points the family to Student
// Activation - no login is issued at payment.
export function OnboardingDocument() {
  const params = useSearchParams();

  // The enrolment the family filled on /pay carries through the checkout via
  // localStorage - the source of truth here. URL params are an office fallback.
  const [en, setEn] = useState<Enrolment | null>(null);
  useEffect(() => setEn(loadEnrolment()), []);

  const planKey = (en?.planKey || params.get("plan") || "").toLowerCase();
  const plan = PLANS[planKey];
  const name = en?.name || params.get("name") || "";
  const days = (en?.days?.length ? en.days.join(", ") : "") || params.get("days") || "";
  const mode = en?.mode || params.get("mode") || "";
  const level = en?.level || "";
  const instrument = en?.instrument || params.get("instrument") || "";
  const teacher = params.get("teacher") || ""; // office assigns after enrolment
  const startDate = en?.startDate || "";
  const amtParam = Math.round(Number(params.get("amt") || ""));
  const monthly = (en?.monthly && en.monthly > 0 ? en.monthly : (Number.isFinite(amtParam) && amtParam > 0 ? amtParam : plan?.amount)) ?? null;

  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const ref = "MP-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
  const agreedLabel = en?.agreedAt
    ? new Date(en.agreedAt).toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "";

  return (
    <div className="mx-auto max-w-2xl">
      <div id="enrolment-doc" className="rounded-3xl border border-hairline bg-white p-7 shadow-card sm:p-10">
        {/* Letterhead */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <p className="font-display text-xl font-semibold text-ink">Musicphonetics</p>
            <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-[#7A5E0F]">Enrolment Confirmation</p>
          </div>
          <div className="text-right text-xs text-ink/60">
            <p>Date: {today}</p>
            <p>Ref: {ref}</p>
          </div>
        </div>

        {/* Payment received line */}
        <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-feature-green/10 px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-emerald-600"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <p className="text-sm font-medium text-ink">Payment received. Your place is confirmed{name ? `, ${name.split(" ")[0]}` : ""}.</p>
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

        {/* Your schedule */}
        <SectionTitle>Your schedule</SectionTitle>
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field label="Preferred days" value={days || "Confirmed on WhatsApp"} />
          <Field label="Mode of classes" value={mode || "Confirmed on WhatsApp"} />
          <Field label="Start date" value={startDate ? prettyDate(startDate) : "Confirmed on WhatsApp"} />
          <Field label="Cycle" value="8 classes, to be completed within 35 days of your start" />
        </div>

        {/* Your teacher */}
        <SectionTitle>Your teacher</SectionTitle>
        <div className="rounded-2xl border border-hairline bg-paper p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">Assigned teacher</p>
          <p className="mt-1 font-display text-lg font-semibold text-ink">
            {teacher || "Being matched to you now"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
            {teacher
              ? "Your teacher will message you on WhatsApp to fix your first class."
              : "We are matching a teacher to your instrument, level and preferred days. You will get their name and your first class time on WhatsApp, immediately."}
          </p>
        </div>

        {/* Terms restated - agreed before payment, confirmed here */}
        <SectionTitle>Terms you agreed to</SectionTitle>
        <div className="rounded-2xl border border-hairline bg-paper p-5">
          <div className="flex items-start gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-600"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <p className="text-sm leading-relaxed text-ink/80">
              Before paying, you read and <b>agreed</b> to the class schedule, fees, refund policy and the
              Enrolment Agreement &amp; Parent Acknowledgement{agreedLabel ? <> on <b>{agreedLabel}</b></> : null}. By
              completing payment you confirmed that agreement. This document records it.
            </p>
          </div>
          <p className="mt-3 text-xs text-ink/65">
            Read again in full:{" "}
            <Link href="/enrolment-agreement" className="font-semibold text-[#7A5E0F] underline underline-offset-2">Enrolment Agreement</Link>{" · "}
            <Link href="/standards/terms-conditions" className="font-semibold text-[#7A5E0F] underline underline-offset-2">Terms &amp; Conditions</Link>{" · "}
            <Link href="/standards/refund-payment" className="font-semibold text-[#7A5E0F] underline underline-offset-2">Refund &amp; Payment</Link>.
          </p>
        </div>

        {/* Access - no login issued here; activate via /activate */}
        <SectionTitle>Getting your portal login</SectionTitle>
        <div className="rounded-2xl border border-gold/35 bg-gold/[0.06] p-5">
          <p className="text-sm leading-relaxed text-ink/80">
            A login is <b>not</b> issued at payment — not even a temporary one. To access your Student Portal and
            follow progress, activate your own login on the{" "}
            <Link href="/activate" className="font-semibold text-[#7A5E0F] underline underline-offset-2">Student Activation</Link>{" "}
            page using your batch access code.
          </p>
        </div>

        <div className="mt-8 border-t border-hairline pt-6">
          <p className="font-display text-base font-semibold text-[#7A5E0F]">Abhishek Kumar</p>
          <p className="text-xs text-ink/60">Founder &amp; Director, Musicphonetics · Delhi NCR</p>
        </div>
      </div>

      {/* Actions (not printed) */}
      <div className="no-print mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button onClick={() => printDoc("enrolment-doc")} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-[#0f131c]">
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
