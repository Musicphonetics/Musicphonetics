import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { AREA_PAGES } from "@/lib/areas";
import { whatsappTrialLink } from "@/lib/data";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Music Classes in Delhi NCR | Home & Online",
  description:
    "Structured, faculty-led music classes across Delhi NCR. Delhi Cantt, South Delhi, Gurugram, Noida, Faridabad, Ghaziabad and Central Delhi. Guitar, piano, vocals and more, at home or online. Book a free trial.",
  alternates: { canonical: "/music-classes" },
};

export default function MusicClassesHub() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Music classes by area in Delhi NCR",
    itemListElement: AREA_PAGES.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Music classes in ${a.name}`,
      url: `${SITE_URL}/music-classes/${a.slug}`,
    })),
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Music classes", path: "/music-classes" },
  ]);

  return (
    <>
      <JsonLd data={[itemList, breadcrumb]} />

      <PageHero
        eyebrow="Across Delhi NCR"
        title={<>Music classes near you, <span className="italic text-gold">at home or online.</span></>}
        intro="A verified teacher, a structured method, and progress you can actually follow, wherever you are in Delhi NCR. Choose your area to begin."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/start" variant="primary" size="lg">Book a free trial</Button>
          <Button href={whatsappTrialLink()} external variant="secondary" size="lg">Enquire on WhatsApp</Button>
        </div>
      </PageHero>

      <Section background="white" spacing="md">
        <SectionHeading eyebrow="Find your area" title="Where would you like to learn?"
          intro="Home visits across these areas, and live online everywhere in India." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREA_PAGES.map((a) => (
            <Link key={a.slug} href={`/music-classes/${a.slug}`}
              className="group rounded-2xl border border-hairline bg-white p-6 transition hover:border-ink/30 hover:shadow-card">
              <p className="font-display text-xl font-semibold text-ink">{a.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{a.neighbourhoods.slice(0, 4).join(" · ")} &amp; more</p>
              <p className="mt-4 text-sm font-semibold text-[#7A5E0F] group-hover:underline">Music classes in {a.name} →</p>
            </Link>
          ))}
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
