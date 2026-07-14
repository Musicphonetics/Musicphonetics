import type { Metadata } from "next";
import Link from "next/link";
import { PrintDocButton } from "@/components/legal/PrintDocButton";

export const metadata: Metadata = {
  title: "Enrolment Agreement & Parent Acknowledgement",
  description:
    "The Musicphonetics parent enrolment agreement - fees and payments, teacher verification, safety, liability, media consent and the acknowledgement every parent confirms before classes begin.",
};

const UPDATED = "July 2026";

// Each section is a numbered clause with paragraphs and optional bullet points.
const SECTIONS: { h: string; p?: string[]; li?: string[] }[] = [
  {
    h: "About this agreement",
    p: [
      "This Enrolment Agreement is between Musicphonetics (“the Company”, “we”) and the parent or guardian enrolling a student (“you”). It explains how classes, fees and safety work, and what you are acknowledging when you enrol. Please read every section carefully before you activate an account or begin classes.",
      "By enrolling, activating a login, or continuing classes, you confirm that you have read, understood and agree to this Agreement on behalf of yourself and your child.",
    ],
  },
  {
    h: "Classes & scheduling",
    li: [
      "Classes are delivered one-to-one, at home or online, on a schedule agreed with you.",
      "You will be told what your child is learning through the student portal after classes, including homework and the next-class plan.",
      "If you need to reschedule or pause, please give us reasonable notice through the official Musicphonetics contact. Repeated no-shows may affect scheduling.",
    ],
  },
  {
    h: "Fees, payments & pro-rata",
    li: [
      "All fees are paid only through the official Musicphonetics payment link or account. Never pay a teacher directly in cash, UPI or any private transfer.",
      "Fees are billed per cycle (typically monthly). When you join mid-cycle, the first payment may be pro-rated for the classes remaining in that period.",
      "A paid cycle covers the agreed number of classes. Classes missed by the student are not automatically refunded, but we will always try to reschedule fairly where notice is given.",
      "Any refund, where applicable, is made only to the original payer through the official payment channel.",
    ],
  },
  {
    h: "Teacher verification is done in good faith - not a guarantee",
    p: [
      "We select and verify teachers carefully and in good faith - checking the information, identity and documents they provide, and matching them to our teaching standard. We do this to the best of our ability.",
      "However, you acknowledge that this verification is a reasonable, good-faith process and not a guarantee of any individual’s future conduct. No organisation can guarantee how a person will behave at all times. Each teacher is an independent teaching partner who is personally responsible for their own actions.",
    ],
  },
  {
    h: "Liability - independent acts of a teacher",
    p: [
      "Musicphonetics is not responsible or liable for any independent wrongful or criminal act of a teacher that is outside the scope of our engagement - including, for example, theft, damage to property, unauthorised photography or recording, harassment, or other misconduct.",
      "Such acts are the sole responsibility of the individual who commits them, and any claim in respect of them lies against that individual. Musicphonetics will co-operate reasonably with you and, where appropriate, with the authorities, and will act on our side (including ending a teacher’s engagement) - but we cannot accept liability for conduct we did not authorise and could not reasonably prevent.",
      "To the maximum extent permitted by law, our total liability to you in connection with classes is limited to the fees you have paid for the affected period.",
    ],
  },
  {
    h: "Your part in keeping classes safe",
    li: [
      "For a minor student, a parent or guardian should remain aware of, and reachably present during, classes - at home or online.",
      "Please hold classes in an appropriate, open family setting, not a closed private space.",
      "Keep communication with the teacher through channels you are aware of; avoid private or late-night one-to-one messaging with a minor.",
      "Report any concern about your child’s safety, comfort or wellbeing to Musicphonetics immediately so we can act.",
    ],
  },
  {
    h: "No private or side arrangements",
    p: [
      "To protect both you and the teacher, classes and payments must stay within Musicphonetics. You agree not to arrange private paid classes, side payments, or off-platform engagements with a Musicphonetics teacher during the engagement and for 6 months after it ends. This keeps your child’s learning documented, supported and accountable.",
    ],
  },
  {
    h: "Photos, video & media consent",
    p: [
      "From time to time we may capture class moments, progress clips or event photos. We will only feature your child publicly with your consent, and you can withdraw that consent at any time by telling us. Teachers may not record your child without both your consent and ours.",
    ],
  },
  {
    h: "Privacy & data",
    p: [
      "We collect only what we need to run classes and the portal - contact details, class notes and payment records - and handle them through approved Musicphonetics systems. We do not sell your data. Teachers are bound to keep your information confidential.",
    ],
  },
  {
    h: "Changes & governing law",
    p: [
      "We may update this Agreement as the service grows; the current version always lives on this page. This Agreement is governed by the laws of India, and the courts at Delhi NCR have jurisdiction over any dispute, which we will always first try to resolve with you directly.",
    ],
  },
];

const ACK = [
  "I have read and understood this Enrolment Agreement.",
  "I agree to pay fees only through the official Musicphonetics payment channel, and not directly to any teacher.",
  "I understand teachers are verified in good faith but their future conduct is not guaranteed, and that each teacher is personally responsible for their own acts.",
  "I understand Musicphonetics is not liable for a teacher’s independent wrongful acts (such as theft or misconduct), and that any such claim lies against that individual.",
  "I will keep guardian awareness for my minor child and report any safety concern immediately.",
];

export default function EnrolmentAgreementPage() {
  return (
    <div className="bg-mist">
      <div className="container-mp py-14 sm:py-20">
        <div id="parent-agreement" className="mx-auto max-w-3xl rounded-2xl border border-hairline bg-white p-6 shadow-card sm:p-10">
          {/* Header */}
          <div className="border-b-2 border-ink pb-5">
            <p className="font-display text-2xl font-bold tracking-tight text-ink">MUSICPHONETICS</p>
            <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A5E0F]">Enrolment Agreement &amp; Parent Acknowledgement</p>
            <p className="mt-1 text-xs text-ink/65">Please read in detail before enrolling · Last updated {UPDATED}</p>
          </div>

          {/* Sections */}
          {SECTIONS.map((s, i) => (
            <section key={s.h} className="mt-7">
              <h2 className="mb-2.5 flex items-center gap-2 font-display text-base font-semibold text-ink sm:text-lg">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-ink text-[11px] font-bold text-gold">{i + 1}</span>
                {s.h}
              </h2>
              {s.p?.map((para, pi) => (
                <p key={pi} className={pi === 0 ? "text-sm leading-relaxed text-ink/80" : "mt-2 text-sm leading-relaxed text-ink/80"}>{para}</p>
              ))}
              {s.li && (
                <ul className="space-y-1.5">
                  {s.li.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/80">
                      <span className="mt-0.5 text-[#7A5E0F]">•</span> {t}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Acknowledgement */}
          <section className="mt-9 rounded-xl border border-gold/40 bg-gold/[0.06] p-5">
            <h2 className="font-display text-base font-semibold text-ink sm:text-lg">What every parent acknowledges</h2>
            <ul className="mt-3 space-y-2">
              {ACK.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/80">
                  <span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-[3px] border border-ink/50" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-ink/65">
              When you activate your account or begin classes, you confirm the acknowledgements above on behalf of
              yourself and your child.
            </p>
          </section>

          <div className="mt-8 flex flex-col items-start gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink/65">Questions? WhatsApp us at +91 87961 99188.</p>
            <PrintDocButton targetId="parent-agreement" />
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-ink/65">
          Ready to begin?{" "}
          <Link href="/activate" className="font-semibold text-[#7A5E0F] underline underline-offset-4">Activate your student account</Link>{" "}
          or{" "}
          <Link href="/programmes" className="font-semibold text-[#7A5E0F] underline underline-offset-4">explore programmes</Link>.
        </p>
      </div>
    </div>
  );
}
