import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { STANDARDS, getStandard } from "@/lib/standards-data";

export function generateStaticParams() {
  return STANDARDS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const d = getStandard(params.slug);
  if (!d) return { title: "Standard" };
  return {
    title: `${d.title} · Standards`,
    description: d.summary,
  };
}

export default function StandardPage({ params }: { params: { slug: string } }) {
  const d = getStandard(params.slug);
  if (!d) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Standards", path: "/standards" },
          { name: d.title, path: `/standards/${d.slug}` },
        ])}
      />

      {/* Doc hero */}
      <section className="relative overflow-hidden border-b border-white/5 bg-ink py-16 text-paper sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-deep-gold/12 blur-3xl" />
        <div className="container-mp relative">
          <Link href="/standards" className="text-sm font-semibold text-gold hover:underline">
            ← The Standards Library
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gold/80">
            {d.eyebrow}
          </p>
          <div className="mt-3 flex items-start gap-4">
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
              {d.title}
            </h1>
            <span className="mt-2 shrink-0 font-display text-sm font-semibold text-gold">
              № {String(d.num).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper/70 sm:text-lg">
            {d.summary}
          </p>
        </div>
      </section>

      <Section background="paper" spacing="lg">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
          {/* TOC */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">In this document</p>
            <nav className="mt-4">
              <ol className="space-y-2 border-l border-hairline">
                {d.toc.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="-ml-px block border-l border-transparent pl-4 text-sm text-ink/60 transition-colors hover:border-gold hover:text-ink"
                      dangerouslySetInnerHTML={{ __html: t.label }}
                    />
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Content */}
          <article
            className="standard-prose max-w-2xl"
            dangerouslySetInnerHTML={{ __html: d.content }}
          />
        </div>
      </Section>

      <FinalCTA
        headline="Standards you can trust. Classes you'll love."
        text="Start your music journey with Musicphonetics."
      />
    </>
  );
}
