"use client";

import { printDoc } from "@/lib/print";
import type { JoiningData } from "@/components/teach/OfferLetter";

// Musicphonetics - Teacher Joining Agreement (the binding contract issued and
// signed after the offer is accepted). This is the full legal document: it sets
// out liability, indemnity, confidentiality, safeguarding, non-solicitation and
// termination, and protects Musicphonetics from any independent wrongdoing by a
// teacher (theft, recording, misconduct) while making clear that verification is
// carried out in good faith but is not a guarantee.

const COMPANY = {
  name: "Musicphonetics",
  tagline: "Structured Music Education Network",
  area: "Delhi NCR + Online",
  web: "musicphonetics.pages.dev",
  whatsapp: "+91 87961 99188",
  jurisdiction: "Delhi NCR, India",
};

const TOTAL_PAGES = 6;
const dash = (v?: string) => (v && v.trim() ? v : "-");
const list = (a?: string[]) => (a && a.length ? a.join(", ") : "-");

// Numbered clauses. Each is [heading, paragraphs[]].
const CLAUSES: { h: string; p: string[] }[] = [
  {
    h: "Nature of engagement",
    p: [
      "The Teacher is engaged by Musicphonetics as an independent teaching partner and service provider, and not as an employee, agent, or partner in law, unless separately agreed in writing. Nothing in this Agreement creates an employment, partnership, or joint-venture relationship.",
      "The Teacher represents the Musicphonetics brand while delivering classes but acts on their own professional responsibility and is solely responsible for their own conduct, acts and omissions.",
    ],
  },
  {
    h: "Term, commencement & probation",
    p: [
      "This Agreement takes effect from the date of signature and continues until ended by either party under the Termination clause. The first 60 days are a review period during which either party may end the engagement with written notice and without cause.",
    ],
  },
  {
    h: "Duties & teaching standard",
    p: [
      "The Teacher shall conduct every class professionally, punctually and to the Musicphonetics teaching standard; update the portal after each class (what was taught, homework, student response, next-class plan, any parent concern); maintain accurate progress notes; and communicate respectfully with students, parents and Musicphonetics.",
      "The Teacher shall follow all reasonable instructions, teaching guidelines and the safeguarding code issued by Musicphonetics, and shall report any schedule change, complaint, concern or safety issue immediately.",
    ],
  },
  {
    h: "Fees, payment interface & revenue share",
    p: [
      "All student fees are billed and collected only through the official Musicphonetics payment account or approved payment interface/gateway. The Teacher shall not collect, request, or accept fees directly from any student or parent by cash, UPI, bank transfer, or any other means.",
      "From each fee received, the payment interface/gateway first deducts its processing charge of approximately 3%. From the net settled amount that remains, the Teacher's share is 70% and Musicphonetics retains 30%. Payouts are made only to the Teacher's registered account, after the payment is received, settled and verified.",
      "Any attempt to divert, privately collect, or retain student fees is a material breach and a ground for immediate termination and recovery of amounts due.",
    ],
  },
  {
    h: "Verification carried out in good faith (not a guarantee)",
    p: [
      "Musicphonetics selects and verifies teachers in good faith, to the best of its ability, using the information and documents provided by the Teacher and reasonable checks. The Teacher warrants that all information, qualifications, identity and bank details provided are true, complete and current, and undertakes to notify Musicphonetics of any change.",
      "The Teacher acknowledges that such verification is a reasonable, good-faith process and not a guarantee, and that Musicphonetics cannot and does not warrant the future conduct of any individual. The Teacher alone is responsible for their own actions.",
    ],
  },
  {
    h: "Liability & indemnity",
    p: [
      "The Teacher is solely and personally responsible for their own acts, omissions and conduct during and in connection with the engagement. Musicphonetics shall not be liable for any loss, theft, damage, injury, harassment, misconduct, unauthorised recording, data misuse, or any other wrongful or criminal act committed independently by the Teacher.",
      "The Teacher shall indemnify and hold harmless Musicphonetics, its founder, directors and staff against any claim, loss, damage, cost, penalty or legal expense arising out of or connected with the Teacher's breach of this Agreement, negligence, misconduct, or any unlawful act (including but not limited to theft, damage to property, unauthorised recording, or harm to a student).",
      "To the maximum extent permitted by law, Musicphonetics' total liability to the Teacher in connection with this Agreement is limited to any undisputed payout amount then due to the Teacher.",
    ],
  },
  {
    h: "Confidentiality & data protection",
    p: [
      "The Teacher shall keep all student, parent, payment, schedule and internal Musicphonetics information strictly confidential, and shall not share, copy, store elsewhere, or use it for any purpose outside Musicphonetics work, during or after the engagement. All student data must be handled only through approved Musicphonetics systems.",
    ],
  },
  {
    h: "Intellectual property & recordings",
    p: [
      "All curriculum, lesson structures, materials, methods and branding provided by Musicphonetics remain its property and may be used only to deliver Musicphonetics classes. The Teacher shall not reproduce or distribute them outside the engagement.",
      "The Teacher shall not photograph, audio- or video-record any student, class, or parent communication without the prior written consent of Musicphonetics and the parent/guardian. Any permitted recording remains confidential and the property of Musicphonetics.",
    ],
  },
  {
    h: "Safeguarding & child protection",
    p: [
      "The Teacher shall maintain the highest standards of child safety: no inappropriate language, contact, or behaviour; no private or late-night messaging with minor students; parent/guardian awareness for all minors; only respectful, minimal and appropriate physical guidance for posture; and immediate reporting of any safety or wellbeing concern.",
      "Any breach of safeguarding is a serious matter and a ground for immediate termination and, where applicable, referral to the authorities.",
    ],
  },
  {
    h: "Non-solicitation & non-circumvention",
    p: [
      "During the engagement and for 6 months after it ends, the Teacher shall not, directly or indirectly, solicit, approach, privately teach, accept payment from, or continue classes with any student or parent introduced through Musicphonetics, nor solicit other Musicphonetics teachers or staff, without prior written approval.",
    ],
  },
  {
    h: "Conduct & anti-fraud",
    p: [
      "The Teacher shall not misrepresent Musicphonetics, make unauthorised commitments to parents, offer side deals, or engage in any dishonest, fraudulent or unlawful activity in connection with the engagement.",
    ],
  },
  {
    h: "Termination",
    p: [
      "Either party may end this Agreement with 15 days' written notice. Musicphonetics may terminate immediately, without notice, for cause - including theft, fraud, a safeguarding breach, unauthorised recording, direct fee collection, serious misconduct, or any material breach of this Agreement.",
      "On termination the Teacher shall immediately stop representing Musicphonetics, return or delete all Musicphonetics materials and data, and hand over student progress records. The non-solicitation and confidentiality obligations survive termination.",
    ],
  },
  {
    h: "Governing law & disputes",
    p: [
      `This Agreement is governed by the laws of India. The parties shall first attempt to resolve any dispute amicably; failing which, the courts at ${COMPANY.jurisdiction} shall have jurisdiction.`,
      "If any clause is held unenforceable, the remaining clauses continue in full force. This document, together with the Offer & Engagement Letter, is the entire agreement between the parties and supersedes prior discussions. It may be amended only in writing.",
    ],
  },
];

const DECLARATIONS = [
  "All information, documents, qualifications, identity and bank details I have provided are true, complete and current.",
  "I understand I am an independent teaching partner and am solely responsible for my own conduct and acts.",
  "I understand that Musicphonetics verifies teachers in good faith but does not guarantee any individual's conduct.",
  "I agree to collect no fees directly from students or parents, and to use only the official payment interface.",
  "I agree to the confidentiality, safeguarding, intellectual-property and non-solicitation obligations above.",
  "I agree to indemnify Musicphonetics against any loss arising from my breach, negligence, misconduct or unlawful act.",
];

export function JoiningLetter({ data: d, loginEmail, agreementId }: {
  data: JoiningData; loginEmail: string | null; agreementId?: string | null;
}) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const id = agreementId
    ? `MP-JA-${agreementId.slice(0, 8).toUpperCase()}`
    : "MP-JA-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

  // Split the clause list across pages 2-5 (leave page 1 for parties/identity,
  // page 6 for declarations/signatures).
  const perPage = 4;
  const pages: (typeof CLAUSES)[] = [];
  for (let i = 0; i < CLAUSES.length; i += perPage) pages.push(CLAUSES.slice(i, i + perPage));

  let clauseNo = 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div id="joining-doc" className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-card">

        {/* ===== PAGE 1 - Header, parties, identity ===== */}
        <DocPage n={1} pages={TOTAL_PAGES}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-5">
            <div>
              <p className="font-display text-2xl font-bold tracking-tight text-ink">MUSICPHONETICS</p>
              <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A5E0F]">Teacher Joining Agreement</p>
              <p className="mt-1 text-xs text-ink/60">{COMPANY.tagline} · {COMPANY.area}</p>
            </div>
            <div className="text-right text-[11px] leading-relaxed text-ink/70">
              <span className="inline-block rounded bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper">Private &amp; Confidential</span>
              <p className="mt-2">Agreement ID: <span className="font-semibold text-ink">{id}</span></p>
              <p>Date: <span className="font-semibold text-ink">{today}</span></p>
              <p>Status: <span className="font-semibold text-[#7A5E0F]">Pending Signature</span></p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink/80">
            This Teacher Joining Agreement (&ldquo;Agreement&rdquo;) is made between <b>Musicphonetics</b> (the
            &ldquo;Company&rdquo;), represented by its Founder &amp; Director, and the teacher named below (the
            &ldquo;Teacher&rdquo;). It sets out the binding terms of the Teacher&apos;s engagement. It is read together
            with, and in addition to, the Offer &amp; Engagement Letter already issued to the Teacher.
          </p>

          <SectionHead n="A">The parties</SectionHead>
          <InfoGrid>
            <F label="Teacher name" value={dash(d.fullName)} />
            <F label="Date of birth" value={dash(d.dob)} />
            <F label="Phone / WhatsApp" value={dash(d.phone)} />
            <F label="Email / login" value={dash(loginEmail || d.email)} />
            <F label="City" value={dash(d.city)} />
            <F label="Instruments" value={list(d.instruments)} />
            <div className="sm:col-span-2"><F label="Full address" value={dash(d.address)} /></div>
            <F label="Company" value="Musicphonetics" />
            <F label="Represented by" value="Abhishek Kumar, Founder & Director" />
          </InfoGrid>

          <p className="mt-5 text-xs leading-relaxed text-ink/60">
            By signing this Agreement, the Teacher confirms they have read and understood every clause on the
            following pages and agree to be legally bound by them.
          </p>
        </DocPage>

        {/* ===== PAGES 2-5 - Clauses ===== */}
        {pages.map((group, gi) => (
          <DocPage key={gi} n={gi + 2} pages={TOTAL_PAGES}>
            {group.map((c) => {
              clauseNo += 1;
              return (
                <div key={c.h} className="avoid-break">
                  <SectionHead n={String(clauseNo)}>{c.h}</SectionHead>
                  {c.p.map((para, pi) => (
                    <p key={pi} className={pi === 0 ? "text-sm leading-relaxed text-ink/80" : "mt-2 text-sm leading-relaxed text-ink/80"}>{para}</p>
                  ))}
                </div>
              );
            })}
          </DocPage>
        ))}

        {/* ===== PAGE 6 - Declarations & signatures ===== */}
        <DocPage n={TOTAL_PAGES} pages={TOTAL_PAGES} last>
          <SectionHead n="Dec">Teacher declaration</SectionHead>
          <ul className="space-y-2">
            {DECLARATIONS.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/80">
                <span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-[3px] border border-ink/50" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>

          <div className="avoid-break mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/60">Signed by the Teacher</p>
              <div className="mt-8 border-b border-ink/50" />
              <p className="mt-1.5 text-xs text-ink/60">Teacher signature</p>
              <p className="mt-3 text-sm text-ink"><span className="text-ink/55">Name:</span> {dash(d.fullName)}</p>
              <p className="mt-1 text-sm text-ink"><span className="text-ink/55">Place:</span> {dash(d.city)}</p>
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

          <p className="mt-8 rounded-xl border border-hairline bg-paper p-4 text-xs leading-relaxed text-ink/65">
            Please sign every page, save the document as a PDF, and send it to Musicphonetics on WhatsApp
            ({COMPANY.whatsapp}) along with a copy of your photo ID. A countersigned copy will be returned for your
            records.
          </p>
        </DocPage>
      </div>

      {/* Actions (not printed) */}
      <div className="no-print mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button onClick={() => printDoc("joining-doc")} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-[#0f131c]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Print / Save as PDF
        </button>
        <p className="text-xs text-ink/55">Teacher signs every page and returns the PDF on WhatsApp.</p>
      </div>
    </div>
  );
}

/* ---------- building blocks ---------- */

function DocPage({ n, pages, last, children }: { n: number; pages: number; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={last ? "doc-page p-7 sm:p-10" : "doc-page border-b border-hairline p-7 sm:p-10"}>
      {children}
      <div className="mt-8 flex items-center justify-between border-t border-hairline pt-3 text-[10px] uppercase tracking-wider text-ink/45">
        <span>Musicphonetics · Teacher Joining Agreement</span>
        <span>Confidential · Page {n} of {pages}</span>
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
