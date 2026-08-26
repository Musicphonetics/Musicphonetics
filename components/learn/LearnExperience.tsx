"use client";

import { useState } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InstrumentIcon, type InstrumentKey } from "@/components/ui/InstrumentIcon";
import { track } from "@/lib/track";

// ---------------------------------------------------------------------------
// A shareable, interactive "how it works + fees" page. Drop the link in any
// WhatsApp chat: the visitor picks an instrument, sees exactly how classes
// work and what they cost, and books a free 1-to-1 trial (pre-set to their
// instrument) via the existing /start onboarding flow.
// ---------------------------------------------------------------------------

interface Inst {
  value: string; // must match lib/onboarding.ts INSTRUMENTS values so /start pre-fills
  label: string;
  icon: InstrumentKey;
  tagline: string;
  learn: string[];
}

const INSTRUMENTS: Inst[] = [
  {
    value: "Guitar",
    label: "Guitar",
    icon: "guitar",
    tagline: "Acoustic or electric, for kids (6+) and adults.",
    learn: [
      "Correct posture and hand position from day one",
      "Your first chords and clean, smooth chord changes",
      "Strumming patterns, rhythm and timing",
      "Reading tabs and the basics of notation",
      "Playing full songs you actually want to play",
      "Fingerstyle and lead basics as you grow",
    ],
  },
  {
    value: "Piano",
    label: "Piano",
    icon: "piano",
    tagline: "Classical or modern, on acoustic piano or keyboard.",
    learn: [
      "Correct hand position and finger technique",
      "Notes, scales and playing with both hands",
      "Reading sheet music with confidence",
      "Chords and simple accompaniment",
      "Playing complete pieces start to finish",
      "The theory that makes everything click",
    ],
  },
  {
    value: "Keyboard",
    label: "Keyboard",
    icon: "keyboard",
    tagline: "A perfect, friendly first instrument for children.",
    learn: [
      "Getting comfortable with the keys and sounds",
      "Notes, chords and rhythm patterns",
      "Playing melodies with both hands",
      "Using tones, styles and auto-accompaniment",
      "Popular songs and film tunes",
      "A clear path into full piano when you want it",
    ],
  },
  {
    value: "Vocals",
    label: "Vocals",
    icon: "vocals",
    tagline: "Bollywood, Western or classical, for all ages.",
    learn: [
      "Breathing and safe voice warm-ups",
      "Pitch, tone and staying in tune",
      "Rhythm, timing and phrasing",
      "Song interpretation and expression",
      "Building range and control the healthy way",
      "Performing with real confidence",
    ],
  },
  {
    value: "Ukulele",
    label: "Ukulele",
    icon: "ukulele",
    tagline: "The easiest, most fun way to begin music.",
    learn: [
      "Your first chords within days",
      "Simple strumming and steady rhythm",
      "Playing sing-along songs quickly",
      "Switching between chords smoothly",
      "A joyful, low-pressure start to music",
      "A natural bridge to guitar later, if you like",
    ],
  },
  {
    value: "Drums",
    label: "Drums",
    icon: "drums",
    tagline: "High energy, great for focus and rhythm.",
    learn: [
      "Grip, posture and the parts of the kit",
      "Keeping steady, reliable time",
      "Core beats and your first fills",
      "Reading simple drum notation",
      "Playing along to real songs",
      "Coordination across hands and feet",
    ],
  },
];

const STEPS: { t: string; d: string }[] = [
  { t: "Book a free trial", d: "Tell us the instrument, age and goal. Your first class is free, with no obligation to continue." },
  { t: "We match your teacher", d: "You get a teacher chosen for the student's instrument, level and personality, not whoever is free." },
  { t: "One-to-one classes, your way", d: "At your home across Delhi NCR, live online, or at our South Delhi centre. A fixed weekly time that suits you." },
  { t: "A personal lesson plan", d: "Every student gets a plan built only for them, so each class has a clear purpose and direction." },
  { t: "Tracked every week", d: "Practice, homework and progress are logged after each class. Parents see it all in the portal, any time." },
  { t: "Stage and exams", d: "Quarterly stage performances and a Trinity, Rockschool or ABRSM exam pathway when the student is ready." },
];

interface Fee {
  name: string;
  price: string;
  unit: string;
  tone: "green" | "gold" | "neutral";
  tag?: string;
  best?: boolean;
  points: string[];
}

const FEES: Fee[] = [
  {
    name: "The Foundation",
    price: "₹10,000",
    unit: "per month",
    tone: "gold",
    tag: "Beginners only",
    points: ["8 one-hour classes a month", "Only for complete beginners", "Valid up to 4 months, then a clearance check"],
  },
  {
    name: "The Main Pathway",
    price: "₹12,000",
    unit: "per month",
    tone: "gold",
    tag: "Offer, till seats last",
    best: true,
    points: ["Was ₹15,000, now ₹12,000", "Theory, performance & exam pathway", "Full tracking + quarterly stage"],
  },
  {
    name: "The Director's Circle",
    price: "By consultation",
    unit: "",
    tone: "neutral",
    points: ["A dedicated, always-available teacher", "No cancellations · priority booking", "Weekly updates & exclusive events"],
  },
  {
    name: "Learn with Abhishek",
    price: "By application",
    unit: "",
    tone: "neutral",
    points: ["One-to-one with the Founder", "Highly limited · discretionary", "Founder-led mentorship"],
  },
];

const FAQS: { q: string; a: string }[] = [
  { q: "How long is each class, and how often?", a: "Each class is one hour. Most students take 8 classes a month, usually two a week, at a fixed time that suits your family." },
  { q: "Does the teacher come to our home?", a: "Yes. We teach at your home across Delhi NCR, live online, or at our South Delhi centre. You choose whatever is most convenient." },
  { q: "What age can start?", a: "Children from around 6 years, and adults of any age. It is never too early or too late to begin properly." },
  { q: "Do you prepare students for exams?", a: "Yes, where the student wants it. Our curriculum follows the Trinity, Rockschool and ABRSM pathways for graded exams." },
  { q: "How much do classes cost?", a: "The Foundation (for complete beginners) is ₹10,000 a month. The Main Pathway is ₹12,000 a month, currently on offer, down from ₹15,000, while seats last. Premium options (the Director's Circle, and learning directly with Abhishek) are by consultation. The trial is always free." },
  { q: "What is the Foundation, exactly?", a: "It is our beginner module, only for people starting from absolute zero. It runs up to 4 months; moving on to the Main Pathway is subject to a short clearance assessment. If you already know a few chords or your string names, you skip Foundation and begin on the Main Pathway." },
  { q: "Is the trial really free?", a: "Yes. Your first one-to-one class is completely free, with no card and no obligation to continue. It is the easiest way to see if it is right for you." },
];

export function LearnExperience() {
  const [sel, setSel] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const inst = INSTRUMENTS[sel];

  const startHref = `/studio?instrument=${encodeURIComponent(inst.value)}`;
  const waHref =
    "https://wa.me/918796199188?text=" +
    encodeURIComponent(`Hi Musicphonetics, I'd like to book a free ${inst.label} trial class.`);

  return (
    <div className="pb-24 sm:pb-0">
      {/* Hero */}
      <Section background="ink" spacing="lg" className="relative overflow-hidden">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="gold" className="mb-5">How classes work</Badge>
          <h1 className="font-display text-4xl font-bold leading-tight text-paper sm:text-5xl">
            Learn music the structured way.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-paper/70 sm:text-lg">
            Pick your instrument and see exactly how our classes work, what you will
            learn, and what it costs. Then book a free one-to-one trial. No pressure,
            no obligation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href={startHref} variant="light" size="lg">
              Book a free trial
            </Button>
            <a
              href="#fees"
              className="rounded-full border border-paper/25 px-6 py-3.5 text-base font-semibold text-paper transition-colors hover:border-paper/60"
            >
              See the fees
            </a>
          </div>
          <p className="mt-6 text-sm text-paper/50">
            Guitar · Piano · Keyboard · Vocals · Ukulele · Drums, and more.
          </p>
        </div>
      </Section>

      {/* Instrument picker */}
      <Section background="paper" spacing="lg" id="instruments">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            What would you like to learn?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">
            Tap an instrument to see what the journey looks like.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5">
          {INSTRUMENTS.map((o, i) => {
            const active = i === sel;
            return (
              <button
                key={o.value}
                onClick={() => setSel(i)}
                aria-pressed={active}
                className={
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all " +
                  (active
                    ? "border-gold bg-gold text-ink shadow-card"
                    : "border-hairline bg-white text-ink/70 hover:border-ink/40")
                }
              >
                <InstrumentIcon name={o.icon} size={20} />
                {o.label}
              </button>
            );
          })}
        </div>

        {/* Selected instrument panel */}
        <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-hairline bg-white shadow-card">
          <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
            <div className="p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-deep-gold">
                  <InstrumentIcon name={inst.icon} size={26} />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink">{inst.label}</h3>
                  <p className="text-sm text-ink/55">{inst.tagline}</p>
                </div>
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-ink/40">
                What you will learn
              </p>
              <ul className="mt-3 space-y-2.5">
                {inst.learn.map((l) => (
                  <li key={l} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/75">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-gold" aria-hidden="true">
                      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center gap-4 border-t border-hairline bg-mist p-7 sm:border-l sm:border-t-0 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">Your first 3 months</p>
              <ol className="space-y-3">
                {[
                  ["Month 1", "Comfortable and correct, first notes, chords and steady hands."],
                  ["Month 2", "Playing your first full song with growing confidence."],
                  ["Month 3", "A piece start to finish, and a clear plan for what is next."],
                ].map(([m, d]) => (
                  <li key={m} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-paper">{m}</span>
                    <span className="text-sm leading-relaxed text-ink/75">{d}</span>
                  </li>
                ))}
              </ol>
              <Button href={startHref} variant="primary" size="lg" fullWidth>
                Book a free {inst.label} trial
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* How classes work */}
      <Section background="white" spacing="lg" id="how">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            How your classes actually work
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">
            The same clear system for every student, whichever instrument you choose.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.t} className="rounded-2xl border border-hairline bg-paper p-6">
              <span className="font-display text-2xl font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-lg font-semibold text-ink">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3 text-center text-sm text-ink/70">
          <span className="rounded-full border border-hairline bg-white px-4 py-2">🕐 1 hour per class</span>
          <span className="rounded-full border border-hairline bg-white px-4 py-2">📅 8 classes a month</span>
          <span className="rounded-full border border-hairline bg-white px-4 py-2">🏠 Home · Online · Centre</span>
          <span className="rounded-full border border-hairline bg-white px-4 py-2">👤 Always one-to-one</span>
        </div>
      </Section>

      {/* Fees */}
      <Section background="paper" spacing="lg" id="fees">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Simple, honest fees</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">
            No hidden charges. The trial is always free, so you can decide with zero risk.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEES.map((f) => (
            <div
              key={f.name}
              className={
                "relative flex flex-col rounded-2xl border bg-white p-6 " +
                (f.best ? "border-gold shadow-card-hover" : "border-hairline shadow-card")
              }
            >
              {f.tag && (
                <div className="mb-3">
                  <Badge tone={f.tone === "green" ? "green" : f.tone === "gold" ? "gold" : "muted"}>{f.tag}</Badge>
                </div>
              )}
              <h3 className="text-lg font-semibold text-ink">{f.name}</h3>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-bold text-ink">{f.price}</span>
                {f.unit ? <span className="text-sm text-ink/55">/ {f.unit}</span> : null}
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-ink/70">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-gold" aria-hidden="true">
                      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-ink/50">
          Fees vary a little by instrument, level and location. We will confirm the exact
          fee after your free trial, with no surprises.
        </p>
      </Section>

      {/* What parents see */}
      <Section background="ink" spacing="lg">
        <div className="mx-auto grid max-w-4xl items-center gap-8 sm:grid-cols-[1fr_1.1fr]">
          <div>
            <Badge tone="gold" className="mb-4">The parent portal</Badge>
            <h2 className="font-display text-3xl font-bold text-paper sm:text-4xl">
              You always know how it is going.
            </h2>
            <p className="mt-4 leading-relaxed text-paper/70">
              Every family gets a private portal. See this month&rsquo;s plan and
              classes, weekly practice tracking, and a clear monthly progress report. Honest,
              detailed and always up to date.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              "This month's plan and every class",
              "Weekly practice and homework tracking",
              "A detailed monthly progress report",
              "Fees, invoices and next class at a glance",
            ].map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-xl border border-paper/12 bg-paper/[0.04] p-4 text-paper/85">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-gold" aria-hidden="true">
                  <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* FAQ */}
      <Section background="white" spacing="lg" id="faq">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold text-ink sm:text-4xl">
            Common questions
          </h2>
          <div className="mt-8 divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="bg-paper">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-ink">{f.q}</span>
                    <svg
                      width="20" height="20" viewBox="0 0 24 24" fill="none"
                      className={"shrink-0 text-deep-gold transition-transform " + (open ? "rotate-45" : "")}
                      aria-hidden="true"
                    >
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </button>
                  {open && (
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink/70">{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section background="paper" spacing="lg">
        <div className="mx-auto max-w-2xl rounded-3xl bg-ink p-9 text-center sm:p-12">
          <h2 className="font-display text-3xl font-bold text-paper sm:text-4xl">
            Ready to start with {inst.label}?
          </h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-paper/70">
            Book your free one-to-one trial. It takes under a minute, and we reply fast.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button href={startHref} variant="light" size="lg">
              Book a free trial
            </Button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-paper/25 px-6 py-3.5 text-base font-semibold text-paper transition-colors hover:border-paper/60"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </Section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 p-3 backdrop-blur sm:hidden">
        <Link
          href={startHref}
          onClick={() => track("book_trial", { instrument: inst.value, source: "learn_sticky" })}
          className="flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-base font-semibold text-paper"
        >
          Book a free {inst.label} trial
        </Link>
      </div>
    </div>
  );
}
