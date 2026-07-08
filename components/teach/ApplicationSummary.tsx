"use client";

import { printDoc } from "@/lib/print";

// A confirmation copy of the details the applicant submitted. This is NOT an
// offer and NOT a joining letter - it simply acknowledges the application. The
// Offer Letter is issued later, only after the owner reviews and approves.

export interface ApplicationData {
  fullName: string; dob: string; gender: string; city: string; address: string;
  phone: string; email: string; languages: string;
  instruments: string[]; yearsTeaching: string; yearsPerforming: string; qualification: string; grade: string;
  commitment: string; days: string[]; timeBands: string[]; modes: string[]; areas: string[]; transport: string;
  bankHolder: string; bankName: string; bankAccount: string; bankIfsc: string; bankUpi: string;
}

const dash = (v?: string) => (v && v.trim() ? v : "-");
const list = (a?: string[]) => (a && a.length ? a.join(", ") : "-");

const ACCEPTED = [
  "My agreed fee share, settled T+2 business days via the company account.",
  "Mandatory class-sheet updates after every class.",
  "The Musicphonetics safeguarding code of conduct.",
  "6-month non-solicitation of Musicphonetics students/parents on exit.",
  "Government ID and background verification for student safeguarding.",
];

export function ApplicationSummary({ data: d, reference }: { data: ApplicationData; reference: string | null }) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const ref = reference || "MP-APP-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

  return (
    <div className="mx-auto max-w-2xl">
      <div id="application-doc" className="rounded-2xl border border-hairline bg-white p-7 shadow-card sm:p-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-ink pb-5">
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-ink">MUSICPHONETICS</p>
            <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A5E0F]">Application Received · Confirmation Copy</p>
            <p className="mt-1 text-xs text-ink/60">Structured Music Education Network · Delhi NCR + Online</p>
          </div>
          <div className="text-right text-[11px] leading-relaxed text-ink/70">
            <span className="inline-block rounded bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper">Private &amp; Confidential</span>
            <p className="mt-2">Reference: <span className="font-semibold text-ink">{ref}</span></p>
            <p>Date: <span className="font-semibold text-ink">{today}</span></p>
            <p>Status: <span className="font-semibold text-[#7A5E0F]">Under review</span></p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-ink/80">
          Thank you{d.fullName ? `, ${d.fullName.split(" ")[0]}` : ""}. We have received your application to teach with
          Musicphonetics. This is a copy of the details you submitted, for your records. Our team reviews every
          application personally. <b>If you are selected, we will send you your Offer Letter and portal login.</b>{" "}
          Nothing here confirms a role or a login yet.
        </p>

        <Title>Your details</Title>
        <Grid>
          <F label="Full name" value={dash(d.fullName)} />
          <F label="Date of birth" value={dash(d.dob)} />
          <F label="Phone / WhatsApp" value={dash(d.phone)} />
          <F label="Email" value={dash(d.email)} />
          <F label="City" value={dash(d.city)} />
          <F label="Languages" value={dash(d.languages)} />
          <div className="sm:col-span-2"><F label="Address" value={dash(d.address)} /></div>
        </Grid>

        <Title>Professional &amp; availability</Title>
        <Grid>
          <div className="sm:col-span-2"><F label="Instruments" value={list(d.instruments)} /></div>
          <F label="Years teaching" value={dash(d.yearsTeaching)} />
          <F label="Years performing" value={dash(d.yearsPerforming)} />
          <F label="Qualification" value={dash(d.qualification)} />
          <F label="Grade" value={dash(d.grade)} />
          <F label="Commitment" value={dash(d.commitment)} />
          <F label="Own transport" value={dash(d.transport)} />
          <div className="sm:col-span-2"><F label="Days" value={list(d.days)} /></div>
          <div className="sm:col-span-2"><F label="Time bands" value={list(d.timeBands)} /></div>
          <F label="Modes" value={list(d.modes)} />
          <F label="Areas" value={list(d.areas)} />
        </Grid>

        <Title>Payout details you provided</Title>
        <div className="rounded-xl border border-hairline bg-paper p-4">
          <Grid>
            <F label="Account holder" value={dash(d.bankHolder)} />
            <F label="Bank name" value={dash(d.bankName)} />
            <F label="Account number" value={dash(d.bankAccount)} />
            <F label="IFSC" value={dash(d.bankIfsc ? d.bankIfsc.toUpperCase() : "")} />
            <F label="UPI ID" value={dash(d.bankUpi)} />
          </Grid>
        </div>

        <Title>Terms you accepted</Title>
        <ul className="space-y-1.5">
          {ACCEPTED.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/80">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-[#7A5E0F]"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-7 border-t border-hairline pt-4 text-[10px] uppercase tracking-wider text-ink/45">
          Musicphonetics · Application Confirmation · Private &amp; Confidential
        </div>
      </div>

      <div className="no-print mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button onClick={() => printDoc("application-doc")} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-[#0f131c]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Print / Save your copy
        </button>
      </div>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2.5 mt-7 font-display text-base font-semibold text-ink">{children}</h3>;
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">{children}</div>;
}
function F({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
