import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { WhatsAppCTA } from "@/components/home/WhatsAppCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { PROGRAMMES, getProgramme, type Programme } from "@/lib/programmes";
import { SCHEDULE_POLICY, BILLING_POLICY } from "@/lib/policy";

export function generateStaticParams() {
  return PROGRAMMES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProgramme(params.slug);
  if (!p) return { title: "Programme" };
  return {
    title: `${p.name} - Music Classes | Musicphonetics`,
    description: p.intro,
    openGraph: { title: `${p.name} - Musicphonetics`, description: p.intro },
  };
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
    <>
      <JsonLd data={courseLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div aria-hidden="true" className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.heroImage} alt="" className="h-full w-full object-cover object-center" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 to-transparent" />
        </div>
        <div className="container-mp relative py-20 sm:py-24">
          <Link href="/#programmes" className="text-sm text-paper/70 hover:text-paper">← All programmes</Link>
          {p.badge && (
            <span className="mt-5 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">{p.badge}</span>
          )}
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">{p.name}</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-paper/85">{p.intro}</p>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-3">
            {p.price ? (
              <><span className="font-display text-4xl font-semibold text-gold">{p.price}</span><span className="text-paper/70">/ month</span></>
            ) : (
              <span className="font-display text-3xl font-semibold text-gold">By Request</span>
            )}
            <span className="text-sm text-paper/60">· {p.cadence}</span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {enrolHref ? (
              <Link href={enrolHref} className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-4 text-base font-semibold text-ink shadow-card transition-all hover:bg-deep-gold hover:-translate-y-0.5">
                Enrol Now · Pay Securely
              </Link>
            ) : null}
            <WhatsAppCTA label={p.payAmount ? "Ask a question on WhatsApp" : "Request Access on WhatsApp"} message={p.ctaMsg} variant={p.payAmount ? "outline" : "primary"} />
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <Section background="paper" spacing="lg">
        <p className="eyebrow">Who it&apos;s for</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Is this the right fit?</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <FitCard title="For students" items={p.whoStudents} tone="green" />
          <FitCard title="For parents" items={p.whoParents} tone="gold" />
        </div>
        <div className="mt-5 rounded-2xl border border-hairline bg-white p-6">
          <p className="text-sm font-semibold text-ink/70">This plan is not for:</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {p.notFor.map((x) => (
              <li key={x} className="flex items-start gap-2.5 text-sm text-ink/60">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-ink/35"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* What you'll learn */}
      <Section background="white" spacing="lg">
        <p className="eyebrow">What you&apos;ll learn</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Inside the programme.</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {p.whatLearn.map((x) => (
            <div key={x} className="flex items-start gap-3 rounded-2xl border border-hairline bg-paper p-5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-[#7A5E0F]"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-sm text-ink/80">{x}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section background="paper" spacing="lg">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">From enquiry to first class.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.howItWorks.map((s, i) => (
            <div key={s.t} className="rounded-2xl border border-hairline bg-white p-6">
              <span className="font-display text-2xl font-semibold text-[#7A5E0F]">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-base font-semibold text-ink">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{s.d}</p>
            </div>
          ))}
        </div>
        {/* Duration & format */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoTile label="Duration" value={p.duration} />
          <InfoTile label="Format" value={p.format} />
        </div>

        {/* Schedule & fees policy - shown before payment so it's clear */}
        {p.payAmount && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <PolicyCard title="Class schedule" items={SCHEDULE_POLICY} />
            <PolicyCard title="Fees & billing" items={BILLING_POLICY} />
          </div>
        )}
      </Section>

      {/* What to expect */}
      <Section background="white" spacing="lg">
        <p className="eyebrow">What to expect</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Your journey, step by step.</h2>
        <ol className="mt-8 max-w-2xl space-y-6 border-l border-hairline pl-6">
          {p.whatToExpect.map((j) => (
            <li key={j.when} className="relative">
              <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-gold bg-white" />
              <p className="font-display text-sm font-semibold text-[#7A5E0F]">{j.when}</p>
              <h3 className="mt-0.5 text-lg font-semibold text-ink">{j.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{j.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* FAQ */}
      <Section background="paper" spacing="lg">
        <p className="eyebrow">Questions</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Good to know.</h2>
        <div className="mt-8 max-w-2xl divide-y divide-hairline border-y border-hairline">
          {p.faq.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline transition-transform group-open:rotate-45">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </span>
              </summary>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <section className="bg-ink py-16 text-paper sm:py-20">
        <div className="container-mp text-center">
          <h2 className="mx-auto max-w-xl font-display text-3xl font-semibold sm:text-4xl">
            {p.payAmount ? "Ready to begin?" : "Think you're a fit?"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-paper/75">
            {p.payAmount ? "Enrol now and pay securely, or ask us anything on WhatsApp first." : "Request access and we'll take it from there - personally."}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {enrolHref ? (
              <Link href={enrolHref} className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-4 text-base font-semibold text-ink shadow-card transition-all hover:bg-deep-gold hover:-translate-y-0.5">
                Enrol Now · Pay Securely
              </Link>
            ) : null}
            <WhatsAppCTA label={p.payAmount ? "Ask on WhatsApp" : "Request Access on WhatsApp"} message={p.ctaMsg} variant={p.payAmount ? "outline" : "primary"} />
          </div>
        </div>
      </section>
    </>
  );
}

function FitCard({ title, items, tone }: { title: string; items: string[]; tone: "green" | "gold" }) {
  const ring = tone === "green" ? "border-feature-green/30 bg-feature-green/[0.05]" : "border-gold/30 bg-gold/[0.05]";
  const check = tone === "green" ? "text-feature-green" : "text-[#7A5E0F]";
  return (
    <div className={`rounded-2xl border ${ring} p-6`}>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((x) => (
          <li key={x} className="flex items-start gap-2.5 text-sm text-ink/80">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`mt-0.5 shrink-0 ${check}`}><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">{label}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{value}</p>
    </div>
  );
}

function PolicyCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((x) => (
          <li key={x} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/75">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-[#7A5E0F]"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
