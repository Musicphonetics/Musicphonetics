import type { Metadata } from "next";
import Link from "next/link";
import { RAZORPAY_PAY_LINK, whatsappLink } from "@/lib/data";

export const metadata: Metadata = {
  title: "Open Mic & Chai · The Stage Program | Musicphonetics",
  description:
    "Open Mic & Chai, the Musicphonetics stage program. Coming this August across Delhi NCR. Registration opens 22 July, from ₹999 per child.",
  openGraph: {
    title: "Open Mic & Chai · The Stage Program",
    description: "Coming this August. Registration opens 22 July, from ₹999 per child.",
  },
};

const WA_REGISTER = whatsappLink("Hi Musicphonetics, I'd like to register my child for Open Mic & Chai (₹999 per child). Please hold a spot.");
const WA_ASK = whatsappLink("Hi Musicphonetics, I'd like to know more about the Open Mic & Chai stage program.");

function Star() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" /></svg>;
}
function Arrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const FACTS = [
  { label: "When", value: "This August", note: "Exact date announced soon" },
  { label: "Registration opens", value: "22 July 2026", note: "Reserve early on WhatsApp" },
  { label: "Fee", value: "₹999 / child", note: "Per performer" },
];

const GETS = [
  { t: "A real stage", d: "Lights, a mic and a live audience, not a classroom corner." },
  { t: "A supportive crowd", d: "Families, friends and fellow students cheering every performer on." },
  { t: "Chai and community", d: "A warm evening that feels like a gathering, not an exam." },
  { t: "Photos and memories", d: "Your child's first performance, captured to keep." },
];

const GALLERY = [
  { src: "/images/moments/openmic-audience.webp", pos: "50% 50%", alt: "A full house at a Musicphonetics Open Mic and Chai evening" },
  { src: "/images/classes/trio.webp", pos: "50% 30%", alt: "Students making music together" },
  { src: "/images/hero/slide-1.webp", pos: "50% 32%", alt: "Musicphonetics students celebrated together" },
];

export default function OpenMicPage() {
  return (
    <div className="bg-charcoal text-ivory">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0">
          <img src="/images/moments/openmic-audience.webp" alt="" className="h-full w-full object-cover object-center" loading="eager" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#161B26,rgba(22,27,38,0.9)_40%,rgba(22,27,38,0.72))]" />
        </div>
        <div className="container-mp relative py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-charcoal/40 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold backdrop-blur-sm">
            <Star /> Open Mic &amp; Chai · The Stage Program
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[1.02]">
            Your child&apos;s first real stage.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ivory/85">
            Every few months we put our students on a real stage. An evening of music, chai and a full
            house, where months of practice finally become a performance the whole family remembers.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-charcoal">Coming this August</span>
            <span className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-ivory/85">Registration opens 22 July</span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={WA_REGISTER} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-base font-semibold text-charcoal shadow-[0_16px_40px_-14px_rgba(201,162,39,0.7)] transition hover:brightness-105">
              Reserve your child&apos;s spot
              <Arrow />
            </a>
            <a href="#register" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-4 text-base font-semibold text-ivory transition hover:border-gold hover:text-gold">
              See the details
            </a>
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="border-y border-white/10 bg-charcoal-2">
        <div className="container-mp grid sm:grid-cols-3">
          {FACTS.map((f, i) => (
            <div key={f.label} className={`py-7 ${i > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0 sm:pl-8" : ""}`}>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold">{f.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ivory">{f.value}</p>
              <p className="mt-1 text-sm text-ivory/60">{f.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What it is */}
      <section className="py-16 sm:py-20">
        <div className="container-mp grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">What it is</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">More than a recital. A rite of passage.</h2>
            <p className="mt-4 text-ivory/80">
              Open Mic &amp; Chai is where practice turns into confidence. Beginners and seasoned students
              share the same stage, play the songs they have been working on, and feel what it means to be
              heard. Parents watch, chai flows, and everyone leaves a little braver.
            </p>
            <p className="mt-3 text-ivory/80">
              This August, we are opening the stage again, and every Musicphonetics child is invited.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {GALLERY.map((g, i) => (
              <div key={g.src} className={`relative overflow-hidden rounded-2xl border border-white/10 ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}`}>
                <img src={g.src} alt={g.alt} loading="eager" decoding="async" style={{ objectPosition: g.pos }} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What your child gets */}
      <section className="border-t border-white/10 bg-charcoal-2 py-16 sm:py-20">
        <div className="container-mp">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">What your child gets</p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">An evening they will not forget.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GETS.map((g) => (
              <div key={g.t} className="rounded-2xl border border-white/10 bg-charcoal p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold"><Star /></span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ivory">{g.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory/70">{g.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register */}
      <section id="register" className="scroll-mt-16 py-16 sm:py-24">
        <div className="container-mp">
          <div className="mx-auto max-w-2xl rounded-3xl border border-gold/40 bg-charcoal-2 p-7 text-center shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] sm:p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Registration</p>
            <p className="mt-4 font-display text-5xl font-semibold text-ivory">₹999<span className="text-2xl text-ivory/55"> / child</span></p>
            <p className="mt-3 text-ivory/80">
              Online registration goes live on <b className="text-ivory">22 July 2026</b>. Reserve your child&apos;s
              place early on WhatsApp and we will hold a spot for you.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={WA_REGISTER} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-base font-semibold text-charcoal transition hover:brightness-105">
                Reserve on WhatsApp
                <Arrow />
              </a>
              <a href={RAZORPAY_PAY_LINK} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-4 text-base font-semibold text-ivory transition hover:border-gold hover:text-gold">
                Pay registration securely
              </a>
            </div>
            <p className="mt-4 text-xs text-ivory/55">
              Payments are secure and made in the Musicphonetics name. One spot is one child.
            </p>
          </div>

          <p className="mx-auto mt-8 max-w-lg text-center text-sm text-ivory/70">
            Questions about the evening?{" "}
            <a href={WA_ASK} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold underline underline-offset-4">Ask us on WhatsApp</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
