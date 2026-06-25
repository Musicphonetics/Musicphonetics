import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { teacherJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/data";
import { TEACHERS, getTeacher, getRegion } from "@/lib/teachers";

export function generateStaticParams() {
  return TEACHERS.map((t) => ({ id: t.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const t = getTeacher(params.id);
  if (!t) return { title: "Teacher" };
  return {
    title: `${t.name} · ${t.instruments.join(", ")}`,
    description: `${t.name} — ${t.qualification}. ${t.experience} teaching ${t.instruments.join(", ")} across ${t.cities.join(", ")}.`,
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-sm text-ink/50">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export default function TeacherProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const t = getTeacher(params.id);
  if (!t) notFound();

  const region = getRegion(t.region);

  return (
    <>
      <JsonLd
        data={[
          teacherJsonLd(t),
          breadcrumbJsonLd([
            { name: "Teachers", path: "/teachers" },
            ...(region ? [{ name: region.name, path: `/teachers/${region.slug}` }] : []),
            { name: t.name, path: `/teachers/profile/${t.slug}` },
          ]),
        ]}
      />

      <Section background="paper" spacing="md">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink/55">
            <Link href="/teachers" className="hover:text-deep-gold">
              Teachers
            </Link>
            <span aria-hidden="true">/</span>
            {region && (
              <>
                <Link href={`/teachers/${region.slug}`} className="hover:text-deep-gold">
                  {region.name}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span className="text-ink/80">{t.name}</span>
          </div>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Photo + quick actions */}
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <div className="relative">
                <div aria-hidden="true" className="absolute -right-3 -top-3 h-full w-full rounded-2xl border border-gold/40" />
                <ImagePlaceholder label="Teacher headshot" aspect="portrait" className="relative" />
              </div>
              <div className="mt-6">
                <Button
                  href={whatsappLink(
                    `Hi Musicphonetics, I'm interested in lessons with ${t.name} (${t.instruments.join(", ")}).`
                  )}
                  external
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  Enquire about {t.name.split("·").pop()?.trim() ?? "this teacher"}
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Details */}
          <Reveal delay={120}>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
                  {t.name}
                </h1>
                {t.verified && (
                  <Badge tone="green">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verified
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.instruments.map((i) => (
                  <Badge key={i} tone="gold">
                    {i}
                  </Badge>
                ))}
              </div>

              <p className="mt-6 text-lg leading-relaxed text-ink/75">{t.bio}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Card>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
                    At a glance
                  </h2>
                  <dl className="mt-2 divide-y divide-hairline">
                    <DetailRow label="Experience" value={t.experience} />
                    <DetailRow label="Rating" value={t.rating > 0 ? `★ ${t.rating.toFixed(1)}` : "—"} />
                    <DetailRow label="Region" value={t.regionName} />
                    <DetailRow label="Teaching mode" value={t.modes.join(" · ")} />
                    <DetailRow label="Certification" value={t.certification} />
                  </dl>
                </Card>
                <Card>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
                    Teaches
                  </h2>
                  <dl className="mt-2 divide-y divide-hairline">
                    <DetailRow label="Levels" value={t.levels.join(", ")} />
                    <DetailRow label="Age groups" value={t.ageGroups.join(", ")} />
                    <DetailRow label="Languages" value={t.languages.join(", ")} />
                    <DetailRow label="Areas" value={t.cities.join(", ")} />
                    <DetailRow label="Qualification" value={t.qualification} />
                  </dl>
                </Card>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <FinalCTA
        headline="Ready to start with the right teacher?"
        text="We confirm the final teacher, slot, and fee personally — so every match is right."
      />
    </>
  );
}
