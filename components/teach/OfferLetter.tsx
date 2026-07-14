"use client";

import { printDoc } from "@/lib/print";

// Musicphonetics - Teacher Offer & Engagement Letter (owner-issued after approval).
// A professional, A4, multi-page company agreement. The temporary password is
// NEVER shown here (it is surfaced once on-screen elsewhere, and never printed).

export interface JoiningData {
  fullName: string; dob: string; gender: string; city: string; address: string;
  phone: string; email: string; languages: string;
  instruments: string[]; yearsTeaching: string; yearsPerforming: string;
  qualification: string; grade: string;
  commitment: string; days: string[]; timeBands: string[]; modes: string[]; areas: string[]; transport: string;
  bankHolder: string; bankName: string; bankAccount: string; bankIfsc: string; bankUpi: string;
}

const COMPANY = {
  name: "Musicphonetics",
  tagline: "Structured Music Education Network",
  area: "Delhi NCR + Online",
  web: "musicphonetics.pages.dev",
  whatsapp: "+91 87961 99188",
};

const TOTAL_PAGES = 5;
const dash = (v?: string) => (v && v.trim() ? v : "-");
const list = (a?: string[]) => (a && a.length ? a.join(", ") : "-");

const RESPONSIBILITIES = [
  "Conduct every class professionally, punctually and to the Musicphonetics teaching standard.",
  "Update the teacher portal after every class - what was taught, homework, student response and the next-class plan.",
  "Maintain accurate student progress notes for each learner.",
  "Share homework and a clear next-class plan with the student/parent.",
  "Maintain respectful, professional communication with parents and guardians.",
  "Report any schedule change, concern, complaint or safety issue immediately.",
  "Follow the Musicphonetics teaching standard and safeguarding code at all times.",
  "Keep all student and parent information strictly confidential.",
];

const SAFEGUARDING = [
  "No inappropriate language, contact or behaviour of any kind.",
  "No private or late-night messaging with minor students; keep the parent/guardian informed.",
  "Parent or guardian awareness must be maintained for all minor students.",
  "Any physical guidance for instrument posture must be respectful, minimal and appropriate.",
  "Any concern about a student's safety or wellbeing must be reported to Musicphonetics immediately.",
];

const ACK = [
  "I confirm the details above are correct.",
  "I agree to the Musicphonetics teacher engagement terms.",
  "I agree not to collect or accept fees directly from students or parents.",
  "I agree to update the teacher portal after every class.",
];

export function OfferLetter({ data: d, loginEmail, agreementId }: {
  data: JoiningData; loginEmail: string | null; agreementId?: string | null;
}) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const id = agreementId
    ? `MP-T-${agreementId.slice(0, 8).toUpperCase()}`
    : "MP-T-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

  return (
    <div className="mx-auto max-w-3xl">
      <div id="offer-doc" className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-card">

        {/* ===== PAGE 1 - Header, opening, identity ===== */}
        <DocPage n={1} id={id}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-5">
            <div>
              <p className="font-display text-2xl font-bold tracking-tight text-ink">MUSICPHONETICS</p>
              <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A5E0F]">
                Teacher Offer &amp; Engagement Letter
              </p>
              <p className="mt-1 text-xs text-ink/60">{COMPANY.tagline} · {COMPANY.area}</p>
            </div>
            <div className="text-right text-[11px] leading-relaxed text-ink/70">
              <span className="inline-block rounded bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper">Private &amp; Confidential</span>
              <p className="mt-2">Agreement ID: <span className="font-semibold text-ink">{id}</span></p>
              <p>Date of Issue: <span className="font-semibold text-ink">{today}</span></p>
              <p>Status: <span className="font-semibold text-[#7A5E0F]">Pending Signature</span></p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink/80">
            This Teacher Engagement Letter confirms your onboarding as a <b>Musicphonetics teacher partner</b>.
            Your engagement is subject to the terms, teaching standards, payment process, student-safety
            guidelines and reporting requirements set out in this document. Musicphonetics operates as a
            structured music-education network; every teacher represents the brand, the student experience,
            parent trust and the learning quality of Musicphonetics.
          </p>

          <SectionHead n="1">Teacher identity</SectionHead>
          <InfoGrid>
            <F label="Full name" value={dash(d.fullName)} />
            <F label="Date of birth" value={dash(d.dob)} />
            <F label="Phone / WhatsApp" value={dash(d.phone)} />
            <F label="Email" value={dash(d.email)} />
            <F label="City" value={dash(d.city)} />
            <F label="ID verification" value="Pending (collected securely)" />
            <div className="sm:col-span-2"><F label="Full address" value={dash(d.address)} /></div>
          </InfoGrid>
        </DocPage>

        {/* ===== PAGE 2 - Profile, scope, engagement model ===== */}
        <DocPage n={2} id={id}>
          <SectionHead n="2">Professional profile</SectionHead>
          <InfoGrid>
            <div className="sm:col-span-2"><F label="Instruments" value={list(d.instruments)} /></div>
            <F label="Years teaching" value={dash(d.yearsTeaching)} />
            <F label="Years performing" value={dash(d.yearsPerforming)} />
            <F label="Qualification" value={dash(d.qualification)} />
            <F label="Grade" value={dash(d.grade)} />
            <F label="Languages" value={dash(d.languages)} />
          </InfoGrid>

          <SectionHead n="3">Teaching scope &amp; availability</SectionHead>
          <InfoGrid>
            <F label="Commitment" value={dash(d.commitment)} />
            <F label="Own transport" value={dash(d.transport)} />
            <F label="Max student capacity" value="Up to 20 active students" />
            <F label="Teaching modes" value={list(d.modes)} />
            <div className="sm:col-span-2"><F label="Days available" value={list(d.days)} /></div>
            <div className="sm:col-span-2"><F label="Time bands" value={list(d.timeBands)} /></div>
            <div className="sm:col-span-2"><F label="Areas covered" value={list(d.areas)} /></div>
          </InfoGrid>

          <SectionHead n="4">Engagement model</SectionHead>
          <p className="text-sm leading-relaxed text-ink/80">
            The teacher is engaged as an <b>independent teaching partner / service provider</b> and <b>not</b> as a
            permanent employee of Musicphonetics, unless separately confirmed in writing. This is a
            revenue-share engagement, not a salaried role.
          </p>
        </DocPage>

        {/* ===== PAGE 3 - Fee model + payout ===== */}
        <DocPage n={3} id={id}>
          <SectionHead n="5">Fee collection &amp; revenue share</SectionHead>
          <p className="text-sm leading-relaxed text-ink/80">
            All student fees are billed and collected <b>only</b> through the official Musicphonetics payment
            account or approved payment gateway/interface. Teachers must not collect, request or accept fees
            directly from students or parents by cash, UPI, bank transfer or any other means.
          </p>

          {/* How the share is calculated: gross -> minus ~3% interface -> net -> 70/30 */}
          <div className="avoid-break mt-4 overflow-hidden rounded-xl border border-gold/40">
            <div className="bg-ink px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold">How your share is calculated</div>
            <div className="divide-y divide-hairline">
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-ink/70">Fee paid by the student/parent</span>
                <span className="font-semibold text-ink">Gross amount (100%)</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-ink/70">Less: payment interface / gateway charge</span>
                <span className="font-semibold text-[#7A5E0F]">approx. 3% deducted</span>
              </div>
              <div className="flex items-center justify-between bg-paper px-4 py-2.5 text-sm">
                <span className="font-semibold text-ink">= Net settled amount</span>
                <span className="font-semibold text-ink">shared 70 / 30</span>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-hairline border-t border-hairline">
              <div className="p-4 text-center">
                <p className="font-display text-4xl font-bold text-ink">70%</p>
                <p className="mt-1 text-xs font-semibold text-ink/70">Teacher share</p>
                <p className="mt-1 text-[11px] leading-snug text-ink/65">of the net settled amount (after the ~3% interface charge)</p>
              </div>
              <div className="p-4 text-center">
                <p className="font-display text-4xl font-bold text-[#7A5E0F]">30%</p>
                <p className="mt-1 text-xs font-semibold text-ink/70">Musicphonetics</p>
                <p className="mt-1 text-[11px] leading-snug text-ink/65">brand, leads, student management, operations, support &amp; platform</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/80">
            For every confirmed student payment, the payment interface / gateway first deducts its processing
            charge of <b>approximately 3%</b> of the fee. From the <b>net settled amount</b> that remains, the
            teacher&apos;s share is <b>70%</b> and Musicphonetics retains <b>30%</b>. The exact interface charge is
            whatever the payment provider actually applies to that transaction; the 70/30 split is always
            calculated on the net amount received in the Musicphonetics account.
          </p>

          {/* Worked example so the math is unambiguous */}
          <div className="avoid-break mt-3 rounded-xl border border-hairline bg-paper p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink/65">Worked example (illustration only)</p>
            <ul className="space-y-1 text-sm leading-relaxed text-ink/80">
              <li>• Student pays a monthly fee of <b>₹4,000</b>.</li>
              <li>• Payment interface charge (~3%) = <b>₹120</b> → net settled = <b>₹3,880</b>.</li>
              <li>• Teacher share (70% of ₹3,880) = <b>₹2,716</b>.</li>
              <li>• Musicphonetics share (30% of ₹3,880) = <b>₹1,164</b>.</li>
            </ul>
            <p className="mt-2 text-[11px] leading-snug text-ink/65">Figures are for illustration; actual amounts depend on the fee and the exact charge applied by the provider.</p>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/80">
            Teacher payouts are processed <b>only after</b> the payment is successfully received and settled in the
            Musicphonetics account and verified by the owner/admin.
          </p>

          <SectionHead n="6">Payout details</SectionHead>
          <div className="avoid-break rounded-xl border border-hairline bg-paper p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink/60">Registered payout account</p>
            <InfoGrid>
              <F label="Account holder" value={dash(d.bankHolder)} />
              <F label="Bank name" value={dash(d.bankName)} />
              <F label="Account number" value={dash(d.bankAccount)} />
              <F label="IFSC" value={dash(d.bankIfsc ? d.bankIfsc.toUpperCase() : "")} />
              <F label="UPI ID" value={dash(d.bankUpi)} />
            </InfoGrid>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-ink/80">
            <li>• Payouts are made <b>only</b> to the registered account above; changes must be notified in writing in advance.</li>
            <li>• Payouts are normally processed within <b>T+2 business days</b> after successful settlement and verification, subject to bank / payment-gateway settlement timelines and internal approval.</li>
            <li>• Missing or delayed portal updates may delay payout processing.</li>
          </ul>
        </DocPage>

        {/* ===== PAGE 4 - Responsibilities, safeguarding, confidentiality ===== */}
        <DocPage n={4} id={id}>
          <SectionHead n="7">Teacher responsibilities</SectionHead>
          <ol className="space-y-1.5">
            {RESPONSIBILITIES.map((t, i) => (
              <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-ink/80">
                <span className="font-semibold text-[#7A5E0F]">{i + 1}.</span> {t}
              </li>
            ))}
          </ol>

          <SectionHead n="8">Student safety &amp; professional conduct</SectionHead>
          <ul className="space-y-1.5">
            {SAFEGUARDING.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/80">
                <span className="mt-0.5 text-[#7A5E0F]">•</span> {t}
              </li>
            ))}
          </ul>

          <SectionHead n="9">Confidentiality &amp; data protection</SectionHead>
          <p className="text-sm leading-relaxed text-ink/80">
            The teacher must keep all student, parent, payment, schedule and internal Musicphonetics
            information strictly confidential. This information must not be shared, copied, stored elsewhere,
            or used for any purpose outside Musicphonetics work, during or after the engagement.
          </p>
        </DocPage>

        {/* ===== PAGE 5 - Non-solicit, portal, acknowledgement, signatures ===== */}
        <DocPage n={5} id={id} last>
          <SectionHead n="10">Non-solicitation</SectionHead>
          <p className="text-sm leading-relaxed text-ink/80">
            During the engagement and for <b>6 months</b> after leaving Musicphonetics, the teacher shall not,
            directly or indirectly, solicit, approach, privately teach, accept payment from, or continue
            classes with any student or parent introduced through Musicphonetics, without written approval.
          </p>

          <SectionHead n="11">Portal access</SectionHead>
          <div className="avoid-break rounded-xl border border-hairline bg-paper p-4">
            <InfoGrid>
              <F label="Portal" value={`${COMPANY.web}/teacher/login`} />
              <F label="Login email" value={dash(loginEmail || d.email)} />
              <div className="sm:col-span-2">
                <F label="Password" value="Shared separately through a secure channel. Change it after first login." />
              </div>
            </InfoGrid>
            <p className="mt-2 text-xs text-ink/55">
              Class updates must include what was taught, homework given, student response, the next-class plan and any parent concern.
            </p>
          </div>

          <SectionHead n="12">Acknowledgement</SectionHead>
          <ul className="space-y-2">
            {ACK.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/80">
                <span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-[3px] border border-ink/50" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>

          <div className="avoid-break mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/60">Accepted and agreed</p>
              <div className="mt-8 border-b border-ink/50" />
              <p className="mt-1.5 text-xs text-ink/60">Teacher signature</p>
              <p className="mt-3 text-sm text-ink"><span className="text-ink/55">Name:</span> {dash(d.fullName)}</p>
              <p className="mt-1 text-sm text-ink"><span className="text-ink/55">Date:</span> ____________________</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/60">For Musicphonetics</p>
              <div className="mt-8 border-b border-ink/50" />
              <p className="mt-1.5 text-xs text-ink/60">Authorised signatory</p>
              <p className="mt-3 font-display text-sm font-semibold text-[#7A5E0F]">Abhishek Kumar</p>
              <p className="text-xs text-ink/60">Founder &amp; Director</p>
              <p className="mt-1 text-sm text-ink"><span className="text-ink/55">Date:</span> ____________________</p>
            </div>
          </div>
        </DocPage>
      </div>

      {/* Actions (not printed) */}
      <div className="no-print mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button onClick={() => printDoc("offer-doc")} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-[#0f131c]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Print / Save as PDF
        </button>
        <p className="text-xs text-ink/55">Sign it and send us the PDF on WhatsApp.</p>
      </div>
    </div>
  );
}

/* ---------- building blocks ---------- */

function DocPage({ n, id, last, children }: { n: number; id: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={last ? "doc-page p-7 sm:p-10" : "doc-page border-b border-hairline p-7 sm:p-10"}>
      {children}
      <div className="mt-8 flex items-center justify-between border-t border-hairline pt-3 text-[10px] uppercase tracking-wider text-ink/45">
        <span>Musicphonetics · Teacher Offer & Engagement Letter</span>
        <span>Confidential · Page {n} of {TOTAL_PAGES}</span>
      </div>
    </div>
  );
}

function SectionHead({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 mt-7 flex items-center gap-2 font-display text-base font-semibold text-ink">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-ink text-[11px] font-bold text-gold">{n}</span>
      {children}
    </h3>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
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
