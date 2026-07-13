import type { Metadata } from "next";
import Link from "next/link";
import { RAZORPAY_PAY_LINK, whatsappLink } from "@/lib/data";

export const metadata: Metadata = {
  title: "Fees & renewals · Musicphonetics",
  description: "For existing Musicphonetics students: how fees and payments work now, and the secure link to pay or renew.",
  robots: { index: false, follow: false },
};

const WA = whatsappLink("Hi Musicphonetics, I'm an existing student and I'd like to confirm my fee amount for renewal.");

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold">
      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CHANGES = [
  { t: "One school, one system", d: "A structured curriculum, matched faculty, real stages, and progress tracked in your own parent portal." },
  { t: "A secure, unified payment", d: "Fees are now paid through one official, secure link in the Musicphonetics name, not a personal account." },
  { t: "Everything else stays", d: "The same teacher, the same slot, the same care. Just a cleaner, more professional experience around it." },
];

export default function RenewPage() {
  return (
    <div className="bg-charcoal text-ivory">
      {/* Hero */}
      <section className="border-b border-white/10 bg-charcoal-2">
        <div className="container-mp py-20 sm:py-24">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">For our existing students</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.06] sm:text-5xl">
            You started with one teacher. You are now part of an institution.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ivory/80">
            When you first joined, Musicphonetics was Abhishek and a guitar. Today it is a faculty, a
            real method, a parent portal and a stage. Your classes continue exactly as they are. What is
            changing is simply how fees are handled.
          </p>
        </div>
      </section>

      {/* What's changing */}
      <section className="py-16 sm:py-20">
        <div className="container-mp">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">What is new for you</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {CHANGES.map((c) => (
              <div key={c.t} className="rounded-2xl border border-white/10 bg-charcoal-2/60 p-6">
                <h3 className="font-display text-lg font-semibold text-ivory">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/70">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment card */}
      <section className="pb-20 sm:pb-24">
        <div className="container-mp">
          <div className="mx-auto max-w-2xl rounded-3xl border border-gold/40 bg-charcoal-2 p-7 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] sm:p-9">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Pay or renew</p>
            <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">Pay your fees securely</h2>
            <p className="mt-3 text-ivory/80">
              Use the official link below, enter the amount your teacher or the office has confirmed for
              your plan, and pay in seconds. It is one secure link for any amount.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Paid to Musicphonetics, in the school's name, never a personal account.",
                "Encrypted and secure. UPI, cards and netbanking.",
                "You receive an instant confirmation for every payment.",
              ].map((x) => (
                <li key={x} className="flex items-start gap-3 text-sm leading-relaxed text-ivory/80"><Check />{x}</li>
              ))}
            </ul>

            <a
              href={RAZORPAY_PAY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-gold px-7 text-base font-semibold text-charcoal shadow-[0_16px_40px_-14px_rgba(201,162,39,0.7)] transition hover:brightness-105"
            >
              Pay securely
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <p className="mt-3 text-center text-xs text-ivory/55">Opens the official Musicphonetics payment page.</p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl text-center text-sm text-ivory/70">
            <p>
              Not sure of your amount?{" "}
              <a href={WA} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold underline underline-offset-4">Message us on WhatsApp</a>
              {" "}and we will confirm right away.
            </p>
            <p className="mt-2">
              Want to see your child&apos;s progress?{" "}
              <Link href="/parent/login" className="font-semibold text-gold underline underline-offset-4">Open your parent portal</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
