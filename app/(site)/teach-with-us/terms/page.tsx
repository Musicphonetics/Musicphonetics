import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { BREACH_DAMAGES } from "@/lib/teach-config";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Faculty Terms & Conditions — Teach With Musicphonetics",
  description:
    "The engagement terms for Musicphonetics faculty: 70/30 payout, daily reporting, confidentiality, a 6-month non-solicitation on exit, and safeguarding.",
  robots: { index: false, follow: true },
};

const damages = BREACH_DAMAGES ? formatINR(BREACH_DAMAGES) : "a defined liquidated sum (set on the signed agreement)";

const CLAUSES: { n: number; title: string; body: React.ReactNode }[] = [
  {
    n: 1,
    title: "Engagement & payout",
    body: (
      <>This is an independent teaching engagement. The teacher receives 70% and Musicphonetics 30% of collected
      fees. Fees vary by student and arrangement; the split does not. Payouts are made monthly against confirmed,
      sheet-logged classes.</>
    ),
  },
  {
    n: 2,
    title: "Daily reporting",
    body: (
      <>The teacher must update the class sheet daily — attendance, content taught, homework and the next class.
      Non-compliance may pause payouts and, if persistent, end the engagement.</>
    ),
  },
  {
    n: 3,
    title: "No fee handling",
    body: (
      <>The teacher never collects money, quotes fees, or offers discounts or refunds. All fee matters are handled
      by the Musicphonetics office.</>
    ),
  },
  {
    n: 4,
    title: "Confidentiality",
    body: (
      <>Student and parent contacts, curriculum, materials and business information are confidential and remain the
      property of Musicphonetics during and after the engagement.</>
    ),
  },
  {
    n: 5,
    title: "Non-solicitation (6 months post-exit)",
    body: (
      <>For six months after the engagement ends, the teacher shall not, directly or indirectly, solicit, approach,
      teach or accept any Musicphonetics student or parent they were introduced to through Musicphonetics, nor use
      its materials, brand, or contacts. This does not restrict the teacher&apos;s right to teach their own separate
      students or to work in music generally.</>
    ),
  },
  {
    n: 6,
    title: "Liquidated damages",
    body: (
      <>Breach of the confidentiality or non-solicitation clauses entitles Musicphonetics to {damages} per breach as
      a genuine pre-estimate of loss, together with any other remedy available in law.</>
    ),
  },
  {
    n: 7,
    title: "Safeguarding & code of conduct",
    body: (
      <>The teacher agrees to background verification, child-safety norms, no-unsupervised-contact rules as
      applicable, and professional conduct at all times. Breach is immediate cause for termination and possible
      legal action.</>
    ),
  },
  {
    n: 8,
    title: "Termination",
    body: (
      <>Either party may end the engagement on reasonable notice. On termination, the teacher hands over all records,
      materials and student information, and completes any classes in progress in good faith.</>
    ),
  },
];

export default function TeachTermsPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5 bg-ink py-16 text-paper sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-deep-gold/12 blur-3xl" />
        <div className="container-mp relative">
          <p className="eyebrow text-gold">Faculty agreement</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Teacher Terms &amp; Conditions
          </h1>
          <p className="mt-4 max-w-2xl text-paper/75">
            The engagement terms every Musicphonetics teacher accepts. Written plainly, applied to everyone the same way.
          </p>
        </div>
      </section>

      <Section background="paper" spacing="lg">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-hairline bg-white p-5 text-sm leading-relaxed text-ink/70">
            <p><span className="font-semibold text-ink">Note:</span> this is a plain-language summary provided for
            transparency. It is not legal advice. The signed agreement, reviewed by a qualified Indian lawyer, governs
            the engagement. The non-solicitation approach here focuses on Musicphonetics&apos; own students, parents
            and materials — consistent with Section 27 of the Indian Contract Act, under which blanket bans on
            practising one&apos;s profession after leaving are generally void.</p>
          </div>

          <ol className="mt-10 space-y-8">
            {CLAUSES.map((c) => (
              <li key={c.n} className="border-t border-hairline pt-6 first:border-t-0 first:pt-0">
                <h2 className="flex items-baseline gap-3 font-display text-lg font-semibold text-ink">
                  <span className="text-[#7A5E0F]">{c.n}.</span> {c.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{c.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 rounded-2xl border border-hairline bg-white p-6 text-center">
            <p className="text-sm text-ink/70">Ready to join the faculty?</p>
            <div className="mt-4 flex justify-center">
              <Button href="/teach-with-us#apply" variant="primary" size="lg">Apply to Teach</Button>
            </div>
            <p className="mt-4 text-xs text-ink/70">
              Questions first? <Link href="/support" className="font-semibold text-[#7A5E0F] underline underline-offset-2">We reply immediately</Link>.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
