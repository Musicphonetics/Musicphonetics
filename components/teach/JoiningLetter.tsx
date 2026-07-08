"use client";

// The printable Teacher Joining Letter & Engagement Agreement. Generated from
// the application form the teacher just filled. They print it / save it as PDF,
// sign it and send it back. Their portal login (if created) is shown here too.

export interface JoiningData {
  fullName: string; dob: string; gender: string; city: string; address: string;
  phone: string; email: string; languages: string;
  instruments: string[]; yearsTeaching: string; yearsPerforming: string;
  qualification: string; grade: string;
  commitment: string; days: string[]; timeBands: string[]; modes: string[]; areas: string[]; transport: string;
  bankHolder: string; bankName: string; bankAccount: string; bankIfsc: string; bankUpi: string;
}

export interface JoiningCreds { login_email: string; temp_password: string }

const dash = (v?: string) => (v && v.trim() ? v : "-");
const list = (a?: string[]) => (a && a.length ? a.join(", ") : "-");

const TERMS: string[] = [
  "This is an engagement to teach students of Musicphonetics under the Musicphonetics name and standards.",
  "Teaching fees are settled to the teacher's registered bank account within T+2 business days of the company receiving the student's cleared payment.",
  "All student fees are billed and collected solely in the name of Musicphonetics. Teachers must not collect or accept fees directly from students or parents.",
  "Class updates must be recorded in the teacher portal after every class - what was taught, homework and progress.",
  "The teacher follows the Musicphonetics safeguarding code of conduct and consents to valid ID and background verification.",
  "For 6 months after leaving, the teacher will not privately solicit or teach Musicphonetics students or parents.",
  "Payouts are made only to the registered bank account above; the teacher will keep these details current.",
];

export function JoiningLetter({ data: d, creds }: { data: JoiningData; creds: JoiningCreds | null }) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const ref = "MP-T-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

  return (
    <div className="mx-auto max-w-2xl">
      <div id="joining-doc" className="rounded-3xl border border-hairline bg-white p-7 shadow-card sm:p-10">
        {/* Letterhead */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <p className="font-display text-xl font-semibold text-ink">Musicphonetics</p>
            <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-[#7A5E0F]">Teacher Joining Letter &amp; Engagement Agreement</p>
          </div>
          <div className="text-right text-xs text-ink/60">
            <p>Date: {today}</p>
            <p>Ref: {ref}</p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink/75">
          This letter records the details you submitted and the terms of your engagement as a
          teacher with Musicphonetics. Please review it, sign at the bottom, and send us a scan or PDF.
        </p>

        {/* Personal */}
        <SectionTitle>Teacher details</SectionTitle>
        <Grid>
          <Field label="Full name" value={dash(d.fullName)} />
          <Field label="Date of birth" value={dash(d.dob)} />
          <Field label="Gender" value={dash(d.gender)} />
          <Field label="City" value={dash(d.city)} />
          <Field label="Phone / WhatsApp" value={dash(d.phone)} />
          <Field label="Email" value={dash(d.email)} />
          <div className="sm:col-span-2"><Field label="Full address" value={dash(d.address)} /></div>
          <Field label="Languages" value={dash(d.languages)} />
        </Grid>

        {/* Professional */}
        <SectionTitle>Professional profile</SectionTitle>
        <Grid>
          <div className="sm:col-span-2"><Field label="Instruments" value={list(d.instruments)} /></div>
          <Field label="Years teaching" value={dash(d.yearsTeaching)} />
          <Field label="Years performing" value={dash(d.yearsPerforming)} />
          <Field label="Qualification" value={dash(d.qualification)} />
          <Field label="Grade" value={dash(d.grade)} />
        </Grid>

        {/* Availability */}
        <SectionTitle>Availability</SectionTitle>
        <Grid>
          <Field label="Commitment" value={dash(d.commitment)} />
          <Field label="Own transport" value={dash(d.transport)} />
          <div className="sm:col-span-2"><Field label="Days" value={list(d.days)} /></div>
          <div className="sm:col-span-2"><Field label="Time bands" value={list(d.timeBands)} /></div>
          <Field label="Teaching modes" value={list(d.modes)} />
          <Field label="Areas covered" value={list(d.areas)} />
        </Grid>

        {/* Bank */}
        <SectionTitle>Bank &amp; payout details</SectionTitle>
        <Grid>
          <Field label="Account holder" value={dash(d.bankHolder)} />
          <Field label="Bank name" value={dash(d.bankName)} />
          <Field label="Account number" value={dash(d.bankAccount)} />
          <Field label="IFSC" value={dash(d.bankIfsc ? d.bankIfsc.toUpperCase() : "")} />
          <Field label="UPI ID" value={dash(d.bankUpi)} />
        </Grid>
        <p className="mt-2 text-xs text-ink/55">Payouts are made only to these details. Tell us in writing before you change them.</p>

        {/* Terms */}
        <SectionTitle>Engagement &amp; payment terms</SectionTitle>
        <ol className="space-y-2">
          {TERMS.map((t, i) => (
            <li key={t} className="flex gap-3 text-sm leading-relaxed text-ink/80">
              <span className="font-semibold text-[#7A5E0F]">{i + 1}.</span> {t}
            </li>
          ))}
        </ol>

        {/* Login */}
        {creds && (
          <>
            <SectionTitle>Your portal login</SectionTitle>
            <div className="rounded-2xl border border-hairline bg-paper p-5">
              <Grid>
                <Field label="Portal" value="musicphonetics.pages.dev/teacher/login" />
                <Field label="Login email" value={creds.login_email} />
                <Field label="Temporary password" value={creds.temp_password} />
                <Field label="First step" value="Change your password after first login" />
              </Grid>
              <p className="mt-2 text-xs text-ink/55">Keep these private. This is where you record your class updates after every class.</p>
            </div>
          </>
        )}

        {/* Acknowledgement + signatures */}
        <div className="mt-8 border-t border-hairline pt-6">
          <p className="text-sm leading-relaxed text-ink/75">
            I confirm the details above are correct and I accept the engagement and payment terms,
            including that fees are settled within T+2 business days and that all student fees are
            billed and collected only in the name of Musicphonetics.
          </p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <div className="h-10 border-b border-ink/40" />
              <p className="mt-2 text-xs text-ink/60">Teacher signature &amp; date</p>
              <p className="mt-1 text-sm font-semibold text-ink">{dash(d.fullName)}</p>
            </div>
            <div>
              <div className="h-10 border-b border-ink/40" />
              <p className="mt-2 text-xs text-ink/60">For Musicphonetics</p>
              <p className="mt-1 font-display text-sm font-semibold text-[#7A5E0F]">Abhishek Kumar</p>
              <p className="text-xs text-ink/60">Founder &amp; Director</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions (not printed) */}
      <div className="no-print mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-[#0f131c]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Print / Save as PDF
        </button>
        <p className="text-xs text-ink/55">Sign it and send us the PDF on WhatsApp.</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-8 font-display text-lg font-semibold text-ink">{children}</h3>;
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{children}</div>;
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
