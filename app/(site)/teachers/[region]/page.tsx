import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TeacherDirectory } from "@/components/teachers/TeacherDirectory";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { regionJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/data";
import { REGIONS, getRegion, teachersInRegion } from "@/lib/teachers";

export function generateStaticParams() {
  return REGIONS.map((r) => ({ region: r.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { region: string };
}): Metadata {
  const region = getRegion(params.region);
  if (!region) return { title: "Teachers" };
  const live = region.status === "active";
  return {
    title: `Music Teachers in ${region.name}`,
    description: live
      ? `Find verified Musicphonetics music teachers in ${region.name}. Filter by instrument, level, language, and teaching mode.`
      : `Musicphonetics is launching soon in ${region.name}. Join the waitlist to be the first to know.`,
  };
}

export default function RegionPage({
  params,
}: {
  params: { region: string };
}) {
  const region = getRegion(params.region);
  if (!region) notFound();

  const teachers = teachersInRegion(region.slug);
  const live = region.status === "active";

  return (
    <>
      <JsonLd
        data={[
          regionJsonLd(region, teachers),
          breadcrumbJsonLd([
            { name: "Teachers", path: "/teachers" },
            { name: region.name, path: `/teachers/${region.slug}` },
          ]),
        ]}
      />

      <PageHero
        eyebrow={`Teachers · ${region.country}`}
        title={
          <>
            Music teachers in{" "}
            <span className="text-deep-gold">{region.name}</span>
          </>
        }
        intro={
          live
            ? `Verified Musicphonetics teachers serving ${region.name} — home and online. Filter to find your match.`
            : `Musicphonetics is launching soon in ${region.name}. Join the waitlist and we'll reach out the moment we open.`
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={live ? "green" : "sample"}>
            {live ? "Live now" : "Launching soon"}
          </Badge>
          <Link
            href="/teachers"
            className="text-sm font-semibold text-deep-gold hover:underline"
          >
            ← All regions
          </Link>
        </div>
      </PageHero>

      {live ? (
        <Section background="white" spacing="lg">
          <TeacherDirectory teachers={teachers} showCityFilter />
        </Section>
      ) : (
        <Section background="white" spacing="lg">
          <Reveal>
            <div className="mx-auto max-w-xl rounded-3xl border border-hairline bg-paper p-8 text-center sm:p-12">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-deep-gold">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-ink">
                Launching soon in {region.name}.
              </h2>
              <p className="mt-3 text-ink/65">
                We&apos;re building our verified teacher network here. Join the
                waitlist and you&apos;ll be the first to know when we open —
                online classes may be available even sooner.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  href={whatsappLink(
                    `Hi Musicphonetics, please add me to the waitlist for ${region.name}.`
                  )}
                  external
                  variant="primary"
                  size="lg"
                >
                  Join the {region.name} waitlist
                </Button>
                <Button href="/teachers/india" variant="secondary" size="lg">
                  Explore online & India teachers
                </Button>
              </div>
            </div>
          </Reveal>
        </Section>
      )}

      <FinalCTA
        headline="Prefer a personal recommendation?"
        text="Tell us your instrument, level, and location. We'll match you with the right teacher."
      />
    </>
  );
}
