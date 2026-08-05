import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { AREA_PAGES, AREA_INSTRUMENTS, getArea } from "@/lib/areas";
import { BRAND, PHONE_DISPLAY, PACKAGES, whatsappTrialLink } from "@/lib/data";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return AREA_PAGES.map((a) => ({ area: a.slug }));
}

export function generateMetadata({ params }: { params: { area: string } }): Metadata {
  const area = getArea(params.area);
  if (!area) return {};
  const title = `Music Classes in ${area.name} — Home & Online`;
  const description = `Structured, faculty-led music classes in ${area.name} — guitar, piano, keyboard, vocals & more, at home or online. Verified teachers, a personalised plan, monthly reports. Book a free trial.`;
  return {
    title,
    description,
    alternates: { canonical: `/music-classes/${area.slug}` },
    openGraph: { title: `Music Classes in ${area.name}`, description, url: `${SITE_URL}/music-classes/${area.slug}` },
  };
}

export default function AreaPage({ params }: { params: { area: string } }) {
  const area = getArea(params.area);
  if (!area) notFound();

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Music lessons",
    name: `Music classes in ${area.name}`,
    description: `Structured, one-to-one music lessons in ${area.name} — home and online — across guitar, piano, keyboard, vocals, drums and more.`,
    areaServed: { "@type": "Place", name: `${area.name}, Delhi NCR, India` },
    provider: {
      "@type": ["LocalBusiness", "MusicSchool", "EducationalOrganization"],
      name: BRAND.name,
      url: SITE_URL,
      telephone: PHONE_DISPLAY,
      areaServed: area.neighbourhoods.map((n) => ({ "@type": "Place", name: n })),
    },
    offers: { "@type": "Offer", priceCurrency: "INR", price: "15000", url: `${SITE_URL}/start` },
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Music classes", path: "/music-classes" },
    { name: area.name, path: `/music-classes/${area.slug}` },
  ]);

  return (
    <>
      <JsonLd data={[service, breadcrumb]} />

      <PageHero
        eyebrow={`Music classes in ${area.name}`}
        title={<>Structured music classes in {area.name} — <span className="italic text-gold">at home or online.</span></>}
        intro={area.lead}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/start" variant="primary" size="lg">Book a free trial</Button>
          <Button href={whatsappTrialLink()} external variant="secondary" size="lg">Enquire on WhatsApp</Button>
        </div>
      </PageHero>

      {/* Local intro */}
      <Section background="white" spacing="md">
        <Reveal>
          <div className="max-w-3xl">
            <p className="eyebrow">Music education, built like an institution</p>
            <p className="mt-4 text-lg leading-relaxed text-ink/75">{area.intro}</p>
          </div>
        </Reveal>
      </Section>

      {/* Instruments */}
      <Section background="paper" spacing="md">
        <SectionHeading eyebrow="Every instrument" title={`Learn any instrument in ${area.name}`}
          intro="One method, one standard — whichever instrument your child (or you) wants to play." />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {AREA_INSTRUMENTS.map((inst) => (
            <div key={inst} className="rounded-xl border border-hairline bg-white px-4 py-4 text-center text-sm font-semibold text-ink">
              {inst}
            </div>
          ))}
        </div>
      </Section>

      {/* Programmes */}
      <Section background="white" spacing="md">
        <SectionHeading eyebrow="Choose a pathway" title={`How families in ${area.name} learn with us`}
          intro="Every student follows a personalised, one-to-one pathway. Pick the level of guidance that fits." />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {PACKAGES.map((p) => (
            <div key={p.key} className={`rounded-2xl border p-6 ${p.featured ? "border-gold bg-gold/[0.05]" : p.premium ? "border-ink bg-ink text-paper" : "border-hairline bg-white"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${p.premium ? "text-gold" : "text-[#7A5E0F]"}`}>{p.name}</p>
              <p className={`mt-2 font-display text-2xl font-semibold ${p.premium ? "text-paper" : "text-ink"}`}>{p.priceFrom}</p>
              <p className={`text-sm ${p.premium ? "text-paper/60" : "text-ink/50"}`}>{p.unit}</p>
              <p className={`mt-3 text-sm leading-relaxed ${p.premium ? "text-paper/80" : "text-ink/70"}`}>{p.tagline}</p>
            </div>
          ))}
        </div>
        <p className="mt-6"><Link href="/programs" className="font-semibold text-[#7A5E0F]">See full programme details →</Link></p>
      </Section>

      {/* Why us */}
      <Section background="paper" spacing="md">
        <SectionHeading eyebrow={`Why ${area.name} chooses Musicphonetics`} title="Not tuition. An education." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {[
            ["Verified faculty", "Every teacher passes a 7-stage selection. A safe, vetted professional at your home or online."],
            ["A real method", "A structured pathway from first sound to confident performance — never a random string of songs."],
            ["Progress you can see", "A parent portal with a personalised monthly plan, class-by-class updates and monthly reports."],
            ["Home or online", `Taught at your home across ${area.name}, or live online — whichever suits your family.`],
          ].map(([h, b]) => (
            <div key={h} className="rounded-2xl border border-hairline bg-white p-6">
              <p className="font-display text-lg font-semibold text-ink">{h}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Neighbourhoods */}
      <Section background="white" spacing="md">
        <SectionHeading eyebrow="Where we teach" title={`Neighbourhoods we cover in ${area.name}`}
          intro="Home visits across these areas, and live online everywhere else." />
        <div className="mt-6 flex flex-wrap gap-2.5">
          {area.neighbourhoods.map((n) => (
            <span key={n} className="rounded-full border border-hairline bg-mist px-4 py-2 text-sm font-medium text-ink/75">{n}</span>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink/60">Don&apos;t see your locality? We very likely still cover it — <Link href={whatsappTrialLink()} className="font-semibold text-[#7A5E0F]">message us on WhatsApp</Link> and we&apos;ll confirm a teacher near you.</p>
      </Section>

      <FinalCTA
        headline={`Start music classes in ${area.name} with one free trial.`}
        text="Tell us the instrument and who it's for. We'll match a verified teacher and confirm your slot — usually the same day."
      />
    </>
  );
}
