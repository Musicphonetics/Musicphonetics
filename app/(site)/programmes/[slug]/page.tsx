import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsAppCTA } from "@/components/home/WhatsAppCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { PROGRAMMES, getProgramme } from "@/lib/programmes";

export function generateStaticParams() {
  return PROGRAMMES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProgramme(params.slug);
  if (!p) return { title: "Programme" };
  return {
    title: `${p.name} · Music Classes | Musicphonetics`,
    description: p.intro,
    openGraph: { title: `${p.name} · Musicphonetics`, description: p.intro },
  };
}

function Check({ className = "text-gold" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`mt-0.5 shrink-0 ${className}`}>
      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Arrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function ProgrammePage({ params }: { params: { slug: string } }) {
  const p = getProgramme(params.slug);
  if (!p) notFound();

  const enrolHref = p.payAmount ? `/pay?plan=${p.slug}&amt=${p.payAmount}` : null;

  const courseLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: p.name,
    description: p.intro,
    provider: { "@type": "Organization", name: "Musicphonetics", sameAs: "https://musicphonetics.com" },
  };

  return (
    <div className="bg-charcoal text-ivory">
      <JsonLd data={courseLd} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0">
          <img src={p.heroImage} alt="" className="h-full w-full object-cover object-center" loading="eager" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#232834,rgba(35,40,52,0.92)_35%,rgba(35,40,52,0.7))]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(35,40,52,0.9),transparent)]" />
        </div>
        <div className="container-mp relative py-20 sm:py-28">
          <Link href="/#programmes" className="inline-flex items-center gap-1.5 text-sm text-ivory/70 transition-colors hover:text-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            All programmes
          </Link>
          {p.badge && (
            <span className="mt-5 inline-block rounded-full bg-gold px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-charcoal">{p.badge}</span>
          )}
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">{p.name}</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ivory/85">{p.intro}</p>

          <div className="mt-7 flex flex-wrap items-baseline gap-x-3">
            {p.price ? (
              <><span className="font-display text-4xl font-semibold text-gold">{p.price}</span><span className="text-ivory/65">/ month</span></>
            ) : (
              <span className="font-display text-3xl font-semibold text-gold">By request</span>
            )}
            <span className="text-sm text-ivory/55">· {p.cadence}</span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {enrolHref ? (
              <Link href={enrolHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-base font-semibold text-charcoal shadow-card transition-all hover:brightness-105 hover:-translate-y-0.5">
                Book your place
                <Arrow />
              </Link>
            ) : null}
            <WhatsAppCTA label={p.payAmount ? "Ask a question first" : "Request access"} message={p.ctaMsg} variant={p.payAmount ? "outline" : "primary"} />
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section className="border-y border-white/10 bg-charcoal-2">
        <div className="container-mp grid sm:grid-cols-3">
          <Fact label="Fee" value={p.price ? `${p.price} / month` : "By request"} />
          <Fact label="Format" value="At home, online, or our South Delhi centre" />
          <Fact label="Rhythm" value={p.cadence} />
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-20 sm:py-24">
        <div className="container-mp">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Is this you?</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Made for the right student.</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <FitCard title="For students" items={p.whoStudents} />
            <FitCard title="For parents" items={p.whoParents} />
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-charcoal-2/60 p-6">
            <p className="text-sm font-semibold text-ivory/70">Probably not the right fit if:</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {p.notFor.map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-sm text-ivory/55">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-ivory/35"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="border-t border-white/10 bg-charcoal-2 py-20 sm:py-24">
        <div className="container-mp">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">What you&apos;ll learn</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Inside the programme.</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {p.whatLearn.map((x) => (
              <div key={x} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-charcoal p-5">
                <Check />
                <span className="text-sm leading-relaxed text-ivory/80">{x}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="py-20 sm:py-24">
        <div className="container-mp">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">The journey</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">What to expect, step by step.</h2>
          <ol className="mt-8 max-w-2xl space-y-6 border-l border-white/15 pl-6">
            {p.whatToExpect.map((j) => (
              <li key={j.when} className="relative">
                <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-gold bg-charcoal" />
                <p className="font-display text-sm font-semibold text-gold">{j.when}</p>
                <h3 className="mt-0.5 text-lg font-semibold text-ivory">{j.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ivory/70">{j.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 bg-charcoal-2 py-20 sm:py-24">
        <div className="container-mp">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Good to know</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Your questions, answered.</h2>
          <div className="mt-8 max-w-2xl divide-y divide-white/10 border-y border-white/10">
            {p.faq.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ivory [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/15 transition-transform group-open:rotate-45">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </span>
                </summary>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ivory/70">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-sm text-ivory/55">
            The full fees, class schedule and terms are shown clearly when you book, before any payment.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20">
        <div className="container-mp text-center">
          <h2 className="mx-auto max-w-xl font-display text-3xl font-semibold sm:text-4xl">
            {p.payAmount ? "Ready to begin?" : "Think you're a fit?"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-ivory/75">
            {p.payAmount
              ? "Choose your start date and details next. You'll see the full terms before you pay."
              : "Request access and we'll take it from there, personally."}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {enrolHref ? (
              <Link href={enrolHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-base font-semibold text-charcoal shadow-card transition-all hover:brightness-105 hover:-translate-y-0.5">
                Book your place
                <Arrow />
              </Link>
            ) : null}
            <WhatsAppCTA label={p.payAmount ? "Ask on WhatsApp" : "Request access"} message={p.ctaMsg} variant={p.payAmount ? "outline" : "primary"} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/10 py-6 first:border-t-0 sm:border-l sm:border-t-0 sm:pl-6 sm:first:border-l-0 sm:first:pl-0">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold">{label}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ivory/80">{value}</p>
    </div>
  );
}

function FitCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-charcoal-2/60 p-6">
      <h3 className="font-display text-lg font-semibold text-ivory">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((x) => (
          <li key={x} className="flex items-start gap-2.5 text-sm text-ivory/80"><Check />{x}</li>
        ))}
      </ul>
    </div>
  );
}
