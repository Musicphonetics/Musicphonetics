import type { Metadata } from "next";
import { ActivationForm } from "@/components/activate/ActivationForm";
import { RAZORPAY_PAY_LINK, whatsappLink } from "@/lib/data";

export const metadata: Metadata = {
  title: "Student activation · Musicphonetics",
  description: "Activate your Musicphonetics student account and follow your classes, progress and fees in one place.",
  robots: { index: false, follow: false },
};

const WA = whatsappLink("Hi Abhishek, I have a question about activating my Musicphonetics account.");

function Chevron() {
  return (
    <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/15 transition-transform group-open:rotate-45">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </span>
  );
}

export default function ActivatePage() {
  return (
    <div className="bg-charcoal text-ivory">
      {/* Intro + form */}
      <section className="border-b border-white/10 bg-charcoal-2">
        <div className="container-mp grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Student activation</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.06] sm:text-5xl">Activate your account.</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ivory/80">
              Set it up once, then follow everything in one place: your classes, your progress and your fees.
              I look after this batch personally.
            </p>
            <p className="mt-4 text-sm font-medium text-ivory/60">Abhishek Kumar, your teacher and director.</p>

            <div className="mt-8 space-y-3">
              {[
                "See what was taught and your homework after every class.",
                "Track your progress through the curriculum.",
                "Fees and payments, clear and in one place.",
              ].map((x) => (
                <p key={x} className="flex items-start gap-3 text-sm text-ivory/75">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {x}
                </p>
              ))}
            </div>
          </div>

          <ActivationForm />
        </div>
      </section>

      {/* What's new */}
      <section className="py-16 sm:py-20">
        <div className="container-mp max-w-3xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">What&apos;s new</h2>
          <p className="mt-3 text-ivory/70">A few things worth knowing now that you are here.</p>

          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ivory [&::-webkit-details-marker]:hidden">
                Progress tracking <Chevron />
              </summary>
              <p className="mt-3 leading-relaxed text-ivory/75">
                After every class you will see what we covered, your homework and what comes next, right in your
                portal. No guessing how it is going.
              </p>
            </details>

            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ivory [&::-webkit-details-marker]:hidden">
                The system <Chevron />
              </summary>
              <p className="mt-3 leading-relaxed text-ivory/75">
                You are on a proper path now, a set curriculum with clear milestones, not random songs. I keep an
                eye on all of it so nothing slips.
              </p>
            </details>

            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ivory [&::-webkit-details-marker]:hidden">
                Events and stages <Chevron />
              </summary>
              <p className="mt-3 leading-relaxed text-ivory/75">
                Open Mic and Chai and student showcases, a few times a year. Real stages, not classroom corners.{" "}
                <a href="/open-mic" className="font-semibold text-gold underline underline-offset-4">See what is coming up</a>.
              </p>
            </details>

            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ivory [&::-webkit-details-marker]:hidden">
                Fees, and how pro rata works <Chevron />
              </summary>
              <div className="mt-3 space-y-3 leading-relaxed text-ivory/75">
                <p>
                  Fees are monthly and aligned to the calendar month, so the date never drifts. If you start in the
                  middle of a month, your first payment is pro rated, you only pay for the days left, never a random
                  amount. After that it is the same amount on the same date each month.
                </p>
                <p>Payments go through one secure link, in the school&apos;s name.</p>
                <a href={RAZORPAY_PAY_LINK} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold hover:text-charcoal">
                  Pay securely
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </div>
            </details>

            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ivory [&::-webkit-details-marker]:hidden">
                Missed classes and questions <Chevron />
              </summary>
              <p className="mt-3 leading-relaxed text-ivory/75">
                Miss a class? We reschedule where we can, with a little notice. Anything at all, message me directly on{" "}
                <a href={WA} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold underline underline-offset-4">WhatsApp</a>.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
