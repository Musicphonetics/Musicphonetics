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
  const title = `Music Classes in ${area.name} | Home & Online`;
  const description = `Structured, faculty-led music classes in ${area.name}. Guitar, piano, keyboard, vocals and more, at home or online. Verified teachers, a personalised plan and monthly reports. Book a free trial.`;
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

  const whyPoints: [string, string][] = area.whyPoints ?? [
    ["Verified faculty", "Every teacher clears a seven stage selection. A safe, vetted professional at your home or online."],
    ["A real method", "A clear pathway from first sound to confident performance, never a random string of songs."],
    ["Progress you can see", "A parent portal with a personalised monthly plan, class by class updates and monthly reports."],
    ["Home or online", `Taught at your home across ${area.name}, or live online, whichever suits your family.`],
  ];

  // Flagship (Delhi Cantt) carries a full LocalBusiness with the real postal
  // address that matches the Google Business Profile exactly. Other areas are
  // service-area only (no street address to claim).
  const primary = area.address
    ? {
        "@context": "https://schema.org",
        "@type": ["MusicSchool", "LocalBusiness", "EducationalOrganization"],
        "@id": `${SITE_URL}/music-classes/${area.slug}#localbusiness`,
        name: BRAND.name,
        url: `${SITE_URL}/music-classes/${area.slug}`,
        telephone: PHONE_DISPLAY,
        priceRange: "₹₹",
        image: `${SITE_URL}/og.png?v=2`,
        address: {
          "@type": "PostalAddress",
          streetAddress: area.address.street,
          addressLocality: area.address.locality,
          addressRegion: area.address.region,
          postalCode: area.address.postalCode,
          addressCountry: "IN",
        },
        hasMap: area.address.mapUrl,
        areaServed: area.neighbourhoods.map((n) => ({ "@type": "Place", name: n })),
      }
    : {
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: "Music lessons",
        name: `Music classes in ${area.name}`,
        description: `Structured, one to one music lessons in ${area.name}, home and online, across guitar, piano, keyboard, vocals, drums and more.`,
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
      <JsonLd data={[primary, breadcrumb]} />

      <PageHero
        eyebrow={`Music classes in ${area.name}`}
        title={<>Structured music classes in {area.name}, <span className="italic text-gold">at home or online.</span></>}
        intro={area.lead}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/studio" variant="primary" size="lg">Book a free trial</Button>
          <Button href={whatsappTrialLink()} external variant="secondary" size="lg">Enquire on WhatsApp</Button>
        </div>
      </PageHero>

      {/* Local intro */}
      <Section background="white" spacing="md">
        <Reveal>
          <div className="max-w-3xl">
            <p className="eyebrow">Our approach in {area.name}</p>
            <p className="mt-4 text-lg leading-relaxed text-ink/75">{area.intro}</p>
          </div>
        </Reveal>
      </Section>

      {/* Founder / defence note (flagship only) */}
      {area.founderNote && (
        <Section background="ink" spacing="md">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">From a forces family</p>
              <p className="mt-4 font-display text-xl font-semibold leading-relaxed text-paper sm:text-2xl">{area.founderNote}</p>
            </div>
          </Reveal>
        </Section>
      )}

      {/* Instruments */}
      <Section background="paper" spacing="md">
        <SectionHeading eyebrow="Every instrument" title={`Learn any instrument in ${area.name}`}
          intro="One method and one standard, whichever instrument your child or you want to play." />
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
          intro="Every student follows a personalised, one to one pathway. Pick the level of guidance that fits." />
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
        <p className="mt-6"><Link href="/programs" className="font-semibold text-[#7A5E0F]">See full programme details</Link></p>
      </Section>

      {/* Why us */}
      <Section background="paper" spacing="md">
        <SectionHeading eyebrow={`Why ${area.name} chooses Musicphonetics`} title="A music education you can rely on." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {whyPoints.map(([h, b]) => (
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
        <p className="mt-6 text-sm text-ink/60">Don&apos;t see your locality? We very likely still cover it. <Link href={whatsappTrialLink()} className="font-semibold text-[#7A5E0F]">Message us on WhatsApp</Link> and we&apos;ll confirm a teacher near you.</p>
      </Section>

      {/* Flagship only: visible Name/Address/Phone matching the Google listing. */}
      {area.address && (
        <Section background="paper" spacing="md">
          <div className="rounded-2xl border border-hairline bg-white p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr] sm:items-center">
              <div>
                <p className="eyebrow">Find us in Delhi Cantt</p>
                <p className="mt-3 font-display text-2xl font-semibold text-ink">{BRAND.name}</p>
                <address className="mt-2 not-italic text-ink/75">
                  {area.address.street}, {area.address.locality}<br />
                  {area.address.region} {area.address.postalCode}, India<br />
                  <a href={`tel:+91${PHONE_DISPLAY.replace(/\D/g, "").slice(-10)}`} className="font-semibold text-[#7A5E0F]">{PHONE_DISPLAY}</a>
                </address>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button href={area.address.mapUrl} external variant="primary" size="md">Get directions</Button>
                  <Button href={whatsappTrialLink()} external variant="secondary" size="md">WhatsApp us</Button>
                </div>
              </div>
              <div className="rounded-xl border border-hairline bg-mist p-5 text-sm leading-relaxed text-ink/70">
                <p className="font-semibold text-ink">Home, online or studio</p>
                <p className="mt-1">Classes at your home across Delhi Cantt, live online anywhere, or in person at our Parade Road studio. Free trial, no commitment. We usually confirm a teacher the same day.</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      <FinalCTA
        headline={`Start music classes in ${area.name} with one free trial.`}
        text="Tell us the instrument and who it is for. We will match a verified teacher and confirm your slot, usually the same day."
      />
    </>
  );
}
