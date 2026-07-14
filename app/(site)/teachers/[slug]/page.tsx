import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { whatsappLink } from "@/lib/data";
import { FACULTY, getFacultyMember, isFacultyPublic, youTubeId } from "@/lib/faculty";

export function generateStaticParams() {
  return FACULTY.map((f) => ({ slug: f.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const m = getFacultyMember(params.slug);
  if (!m) return { title: "Faculty" };
  const indexable = m.published && isFacultyPublic();
  return {
    title: `${m.name} · Musicphonetics Faculty`,
    description: m.tagline,
    robots: indexable ? undefined : { index: false, follow: false },
    openGraph: { title: `${m.name} · Musicphonetics`, description: m.tagline },
  };
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-gold">{label}</p>
      <p className="mt-1 text-sm text-ivory/85">{value}</p>
    </div>
  );
}

function Check() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function FacultyProfile({ params }: { params: { slug: string } }) {
  const m = getFacultyMember(params.slug);
  if (!m) notFound();

  const trial = whatsappLink(`Hi Musicphonetics, I'd like to book a trial class with ${m.name}.`);

  return (
    <div className="bg-charcoal text-ivory">
      {/* Hero */}
      <section className="border-b border-white/10 bg-charcoal-2">
        <div className="container-mp py-14 sm:py-20">
          <Link href="/teachers" className="inline-flex items-center gap-1.5 text-sm text-ivory/70 transition-colors hover:text-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Faculty
          </Link>

          <div className="mt-8 grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
            {/* Photo or monogram */}
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-3xl ring-1 ring-gold/30 sm:mx-0 sm:h-48 sm:w-48">
              {m.photo ? (
                <img src={m.photo} alt={m.name} className="h-full w-full object-cover" loading="eager" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#C9A227,#A8851B)]">
                  <span className="font-display text-5xl font-semibold text-charcoal">{initials(m.name)}</span>
                </div>
              )}
            </div>

            <div className="text-center sm:text-left">
              {m.verified && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-gold">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.6 2.1 3.3-.4 1.2 3.1 3 1.5-1 3.2 1 3.2-3 1.5-1.2 3.1-3.3-.4L12 22l-2.6-2.1-3.3.4-1.2-3.1-3-1.5 1-3.2-1-3.2 3-1.5L9.4 1.7 12 2z" /></svg>
                  Verified faculty
                </span>
              )}
              <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">{m.name}</h1>
              {m.role && <p className="mt-1.5 text-gold">{m.role}</p>}
              <p className="mt-3 max-w-xl text-lg leading-relaxed text-ivory/80">{m.tagline}</p>

              <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
                {m.instruments.map((i) => (
                  <span key={i} className="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-sm text-ivory/85">{i}</span>
                ))}
              </div>

              <div className="mt-7">
                <a href={trial} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-charcoal transition hover:brightness-105">
                  Book a trial with {m.name.split(" ")[0]}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick facts */}
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
            {typeof m.experienceYears === "number" && <Fact label="Experience" value={`${m.experienceYears}+ years`} />}
            {m.areas && m.areas.length > 0 && <Fact label="Teaches in" value={m.areas.join(", ")} />}
            {m.modes && m.modes.length > 0 && <Fact label="Formats" value={m.modes.join(" · ")} />}
            {m.languages && m.languages.length > 0 && <Fact label="Languages" value={m.languages.join(", ")} />}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-14 sm:py-16">
        <div className="container-mp max-w-3xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">About</p>
          <div className="mt-4 space-y-4 text-lg leading-relaxed text-ivory/80">
            {m.bio.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {m.approach && (
            <div className="mt-8 rounded-2xl border border-gold/25 bg-gold/[0.05] p-6">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-gold">Teaching approach</p>
              <p className="mt-2 leading-relaxed text-ivory/85">{m.approach}</p>
            </div>
          )}
        </div>
      </section>

      {/* Credentials */}
      {((m.qualifications && m.qualifications.length > 0) || (m.examPrep && m.examPrep.length > 0)) && (
        <section className="border-t border-white/10 bg-charcoal-2 py-14 sm:py-16">
          <div className="container-mp max-w-3xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Credentials</p>
            <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">Trained, tested and trusted.</h2>
            {m.qualifications && m.qualifications.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {m.qualifications.map((q) => <li key={q} className="flex items-start gap-3 text-ivory/85"><Check />{q}</li>)}
              </ul>
            )}
            {m.examPrep && m.examPrep.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-ivory/60">Exam preparation</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.examPrep.map((e) => <span key={e} className="rounded-full border border-white/15 px-3 py-1 text-sm text-ivory/85">{e}</span>)}
                </div>
              </div>
            )}
            {m.verified && (
              <p className="mt-6 text-sm text-ivory/60">Passed the Musicphonetics seven-stage faculty selection before teaching a single student.</p>
            )}
          </div>
        </section>
      )}

      {/* Achievements */}
      {m.achievements && m.achievements.length > 0 && (
        <section className="py-14 sm:py-16">
          <div className="container-mp max-w-3xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Highlights</p>
            <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">A few things worth mentioning.</h2>
            <ul className="mt-6 space-y-2.5">
              {m.achievements.map((a) => <li key={a} className="flex items-start gap-3 text-ivory/85"><Check />{a}</li>)}
            </ul>
          </div>
        </section>
      )}

      {/* Videos */}
      {m.videos && m.videos.length > 0 && (
        <section className="border-t border-white/10 bg-charcoal-2 py-14 sm:py-16">
          <div className="container-mp">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Watch</p>
            <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">Students, in their own words and music.</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {m.videos.map((v, i) => {
                const id = youTubeId(v.url);
                return (
                  <figure key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
                    {id ? (
                      <div className="relative aspect-video w-full">
                        <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${id}`} title={v.caption || m.name} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    ) : (
                      <a href={v.url} target="_blank" rel="noopener noreferrer" className="flex aspect-video w-full items-center justify-center bg-white/[0.04] text-gold hover:bg-white/[0.07]">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>Watch</span>
                      </a>
                    )}
                    {v.caption && <figcaption className="px-4 py-3 text-sm text-ivory/70">{v.caption}</figcaption>}
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {m.gallery && m.gallery.length > 0 && (
        <section className="py-14 sm:py-16">
          <div className="container-mp">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Moments</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {m.gallery.map((g) => (
                <div key={g} className="relative aspect-square overflow-hidden rounded-2xl border border-white/10">
                  <img src={g} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-white/10 py-14 text-center sm:py-16">
        <div className="container-mp">
          <h2 className="mx-auto max-w-lg font-display text-2xl font-semibold sm:text-3xl">Meet {m.name.split(" ")[0]} in a trial class.</h2>
          <p className="mx-auto mt-3 max-w-md text-ivory/75">No commitment to start. See if the fit is right, then decide.</p>
          <a href={trial} target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-base font-semibold text-charcoal transition hover:brightness-105">
            Book a trial with {m.name.split(" ")[0]}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
      </section>
    </div>
  );
}
