import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { whatsappLink, phoneLink, PHONE_DISPLAY } from "@/lib/data";

export const metadata: Metadata = {
  title: "Support - we reply immediately",
  description:
    "Help with payments, refunds, rescheduling, and classes at Musicphonetics. WhatsApp, phone, and email support - we reply immediately.",
};

const SUPPORT_EMAIL = "adm.musicphonetics@gmail.com";

const FAQ = [
  {
    q: "I paid - what happens now?",
    a: "You'll get a WhatsApp from us immediately to schedule your first class. Payments are processed through a secure, encrypted payment gateway; if anything looks off, message us and we'll verify it on the spot.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds follow our published Refund & Payment Standard (linked below). Start with a WhatsApp message - most issues are resolved the same day.",
  },
  {
    q: "Can I reschedule a class?",
    a: "Yes - plans include flexible rescheduling. Message us on WhatsApp and we'll move your slot.",
  },
  {
    q: "How do classes work?",
    a: "One-to-one, 8 classes a month, at home, online, or at our South Delhi centre - with monthly progress reports. Everything starts with a free trial.",
  },
];

export default function SupportPage() {
  return (
    <>
      {/* Hero + contact */}
      <section className="relative overflow-hidden bg-ink py-16 text-paper sm:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-25%] h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-deep-gold/10 blur-[130px]" />
        <div className="container-mp relative">
          <Reveal>
            <p className="eyebrow text-gold">Support</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-[1.08] sm:text-5xl">
              We&apos;re here to help.
            </h1>
            <p className="mt-3 text-lg text-paper/75">We reply immediately.</p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={whatsappLink("Hi Musicphonetics, I need help with something.")} external variant="light" size="lg">
                WhatsApp us
              </Button>
              <Button href={phoneLink} variant="secondary" size="lg" className="border-white/25 text-paper hover:border-white">
                Call {PHONE_DISPLAY}
              </Button>
              <Button href={`mailto:${SUPPORT_EMAIL}`} external variant="secondary" size="lg" className="border-white/25 text-paper hover:border-white">
                Email us
              </Button>
            </div>
            <p className="mt-5 text-sm text-paper/60">
              Every day of the week · WhatsApp is fastest - we reply immediately.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <Section background="paper" spacing="lg">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            eyebrow="Quick answers"
            title="Payments, refunds & classes."
            intro="Can't find it here? Message us - a person replies, not a bot."
          />
          <div className="divide-y divide-hairline border-y border-hairline">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline text-ink transition-transform group-open:rotate-45">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </span>
                </summary>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* Refund & payment policy - required visible for the payment gateway */}
      <Section background="white" spacing="md">
        <Reveal>
          <div className="rounded-3xl border border-hairline bg-paper p-8 sm:p-10">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="eyebrow">Refund &amp; payment policy</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                  Written down, published, and honoured.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
                  Payments are processed through a secure, encrypted gateway (UPI, cards, netbanking).
                  Refunds and payment terms follow our published standard in the
                  Standards Library - the same document for every family.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button href="/standards/refund-payment" variant="primary" size="lg">
                  Read the policy
                </Button>
                <Button href="/standards/terms-conditions" variant="secondary" size="lg">
                  Terms &amp; conditions
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
        <p className="mt-10 text-center text-sm text-ink/60">
          Musicphonetics · Delhi NCR ·{" "}
          <Link href="/" className="font-semibold text-[#7A5E0F] underline underline-offset-2">musicphonetics.com</Link>
        </p>
      </Section>
    </>
  );
}
