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
    description: m.title || `${m.name}, Musicphonetics faculty.`,
    robots: indexable ? undefined : { index: false, follow: false },
    openGraph: { title: `${m.name} · Musicphonetics`, description: m.title || m.name },
  };
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const PATHS: Record<string, string> = {
  star: "M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z",
  calendar: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z",
  users: "M9 11a3 3 0 100-6 3 3 0 000 6zm7-1a3 3 0 10-2-5M3 20a6 6 0 0112 0m2-2a6 6 0 014 2",
  music: "M9 18V6l10-2v10M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z",
  badge: "M12 3l2 1.6 2.5-.3.9 2.4 2.3 1.1-.8 2.4.8 2.4-2.3 1.1-.9 2.4-2.5-.3L12 21l-2-1.6-2.5.3-.9-2.4-2.3-1.1.8-2.4-.8-2.4 2.3-1.1.9-2.4 2.5.3L12 3z",
  person: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0",
  pin: "M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  chat: "M21 12a8 8 0 01-11.5 7.2L3 21l1.8-6.5A8 8 0 1121 12z",
  book: "M4 5a2 2 0 012-2h9v16H6a2 2 0 01-2-2V5zM15 3h3a2 2 0 012 2v12a2 2 0 01-2 2h-3",
  check: "M5 12l4 4 10-10",
  screen: "M4 5h16v10H4zM9 20h6M12 15v5",
};

function Ic({ name, className = "h-5 w-5 text-gold", fill = false }: { name: string; className?: string; fill?: boolean }) {
  const d = PATHS[name] || PATHS.music;
  return (
    <svg viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} aria-hidden="true" className={className}>
      <path d={d} stroke={fill ? "none" : "currentColor"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function iconFor(label: string): string {
  const s = label.toLowerCase();
  if (/(year|experience|teaching)/.test(s)) return "calendar";
  if (/student/.test(s)) return "users";
  if (/(performance|show|live|song|stage|guitar|solo|rhythm|finger|impro|scale|band)/.test(s)) return "music";
  if (/(certif|grade|trinity|abrsm|rock|exam|award)/.test(s)) return "badge";
  if (/(theory|read)/.test(s)) return "book";
  if (/(ear|by ear|aural)/.test(s)) return "chat";
  if (/age/.test(s)) return "person";
  return "music";
}

const card = "rounded-2xl border border-line/70 bg-white shadow-[0_12px_34px_-18px_rgba(22,27,38,0.22)]";
const eyebrow = "text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F]";

export default function FacultyProfile({ params }: { params: { slug: string } }) {
  const m = getFacultyMember(params.slug);
  if (!m) notFound();
  const first = m.name.split(" ")[0];
  const trial = whatsappLink(`Hi Musicphonetics, I'd like to book a trial class with ${m.name}.`);
  const msg = whatsappLink(`Hi Musicphonetics, I have a question about classes with ${m.name}.`);

  const heroFacts: { icon: string; text: string; fill?: boolean }[] = [];
  if (m.rating) heroFacts.push({ icon: "star", text: `${m.rating}${m.reviewCount ? ` (${m.reviewCount}+ reviews)` : ""}`, fill: true });
  if (typeof m.experienceYears === "number") heroFacts.push({ icon: "calendar", text: `${m.experienceYears}+ years teaching` });
  if (m.studentsTaught) heroFacts.push({ icon: "users", text: `${m.studentsTaught} students taught` });
  if (m.location) heroFacts.push({ icon: "pin", text: m.location });
  if (m.modes && m.modes.length) heroFacts.push({ icon: "screen", text: m.modes.join(" and ") });
  if (m.languages && m.languages.length) heroFacts.push({ icon: "chat", text: `Teaches in ${m.languages.join(", ")}` });

  return (
    <div className="bg-mist text-ink">
      <div className="container-mp space-y-5 py-8 pb-28 sm:py-12 lg:pb-14">
        <Link href="/teachers" className="inline-flex items-center gap-1.5 text-sm text-ink/70 transition-colors hover:text-[#7A5E0F]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Faculty
        </Link>

        {/* HERO */}
        <div className={`${card} p-5 sm:p-7`}>
          <div className="grid gap-6 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[15rem] overflow-hidden rounded-2xl ring-1 ring-line/60 sm:mx-0">
              {m.photo ? (
                <img src={m.photo} alt={m.name} className="h-full w-full object-cover" loading="eager" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#C9A227,#A8851B)]">
                  <span className="font-display text-6xl font-semibold text-charcoal">{initials(m.name)}</span>
                </div>
              )}
              {m.introVideo && (
                <a href={m.introVideo} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-charcoal/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  <Ic name="star" fill className="h-3.5 w-3.5 text-gold" />Watch intro
                </a>
              )}
            </div>

            <div>
              {m.role && <p className={eyebrow}>{m.role}</p>}
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-semibold sm:text-4xl">{m.name}</h1>
                {m.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#7A5E0F]">
                    <Ic name="badge" fill className="h-3.5 w-3.5 text-gold" />Verified
                  </span>
                )}
              </div>
              {m.title && <p className="mt-2 text-ink/70">{m.title}</p>}

              <ul className="mt-5 space-y-2.5">
                {heroFacts.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-ink/80">
                    <Ic name={f.icon} fill={f.fill} className="h-[18px] w-[18px] text-gold" />
                    {f.text}
                  </li>
                ))}
              </ul>

              <div className="mt-6 hidden gap-3 sm:flex">
                <a href={trial} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-charcoal transition hover:brightness-105">
                  Book a trial with {first}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <a href={msg} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/60 px-6 py-3 text-sm font-semibold text-[#7A5E0F] transition hover:bg-gold/10">
                  Message
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK FACTS */}
        {m.stats && m.stats.length > 0 && (
          <div className={`${card} p-5 sm:p-6`}>
            <p className={eyebrow}>Quick facts</p>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
              {m.stats.map((s) => (
                <div key={s.label} className="text-center">
                  <span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-gold/12"><Ic name={iconFor(s.label)} className="h-[18px] w-[18px] text-gold" /></span>
                  <p className="mt-2 font-display text-xl font-semibold leading-tight text-ink">{s.value}</p>
                  <p className="mt-0.5 text-xs text-ink/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT */}
        <div className={`${card} p-6 sm:p-7`}>
          <p className={eyebrow}>About {first}</p>
          <div className="mt-3 space-y-3 leading-relaxed text-ink/80">
            {m.bio.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {m.approach && (
            <div className="mt-5 rounded-xl border border-gold/25 bg-gold/[0.06] p-5">
              <p className={eyebrow}>How {first} teaches</p>
              <p className="mt-1.5 leading-relaxed text-ink/80">{m.approach}</p>
            </div>
          )}
        </div>

        {/* TEACHING SPECIALTIES */}
        {m.specialties && m.specialties.length > 0 && (
          <div className={`${card} p-6 sm:p-7`}>
            <p className={eyebrow}>Teaching specialties</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {m.specialties.map((s) => (
                <div key={s} className="flex items-center gap-3 rounded-xl border border-line/70 bg-paper px-4 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold/12"><Ic name={iconFor(s)} className="h-[18px] w-[18px] text-gold" /></span>
                  <span className="text-sm font-medium leading-snug text-ink/85">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPERIENCE HIGHLIGHTS */}
        {m.highlights && m.highlights.length > 0 && (
          <div className={`${card} p-6 sm:p-7`}>
            <p className={eyebrow}>Experience highlights</p>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {m.highlights.map((h) => (
                <div key={h.title}>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/12 text-gold"><Ic name="badge" className="h-5 w-5 text-gold" /></span>
                  <p className="mt-3 font-semibold leading-snug text-ink">{h.title}</p>
                  {h.sub && <p className="mt-0.5 text-sm text-ink/60">{h.sub}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREDENTIALS */}
        {((m.qualifications && m.qualifications.length > 0) || (m.examPrep && m.examPrep.length > 0) || m.verified) && (
          <div className={`${card} p-6 sm:p-7`}>
            <p className={eyebrow}>Credentials</p>
            {m.qualifications && m.qualifications.length > 0 && (
              <ul className="mt-4 space-y-2.5">
                {m.qualifications.map((q) => (
                  <li key={q} className="flex items-start gap-2.5 text-sm text-ink/80"><Ic name="check" className="mt-0.5 h-[18px] w-[18px] text-gold" />{q}</li>
                ))}
              </ul>
            )}
            {m.examPrep && m.examPrep.length > 0 && (
              <div className="mt-5">
                <p className="text-sm text-ink/70">Exam preparation</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.examPrep.map((e) => <span key={e} className="rounded-full border border-line/70 bg-paper px-3 py-1 text-sm text-ink/80">{e}</span>)}
                </div>
              </div>
            )}
            {m.verified && <p className="mt-5 text-sm text-ink/70">Passed the Musicphonetics seven-stage faculty selection before teaching a single student.</p>}
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {m.achievements && m.achievements.length > 0 && (
          <div className={`${card} p-6 sm:p-7`}>
            <p className={eyebrow}>Highlights</p>
            <ul className="mt-4 space-y-2.5">
              {m.achievements.map((a) => <li key={a} className="flex items-start gap-2.5 text-sm text-ink/80"><Ic name="check" className="mt-0.5 h-[18px] w-[18px] text-gold" />{a}</li>)}
            </ul>
          </div>
        )}

        {/* VIDEOS */}
        {m.videos && m.videos.length > 0 && (
          <div className={`${card} p-6 sm:p-7`}>
            <p className={eyebrow}>Watch</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Students, in their own music.</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {m.videos.map((v, i) => {
                const id = youTubeId(v.url);
                return (
                  <figure key={i} className="overflow-hidden rounded-xl border border-line/70 bg-paper">
                    {id ? (
                      <div className="relative aspect-video w-full">
                        <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${id}`} title={v.caption || m.name} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    ) : (
                      <a href={v.url} target="_blank" rel="noopener noreferrer" className="flex aspect-video w-full items-center justify-center text-[#7A5E0F] hover:bg-gold/5">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold"><Ic name="star" fill className="h-4 w-4 text-gold" />Watch</span>
                      </a>
                    )}
                    {v.caption && <figcaption className="px-4 py-3 text-sm text-ink/70">{v.caption}</figcaption>}
                  </figure>
                );
              })}
            </div>
          </div>
        )}

        {/* GALLERY */}
        {m.gallery && m.gallery.length > 0 && (
          <div className={`${card} p-6 sm:p-7`}>
            <p className={eyebrow}>Moments</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {m.gallery.map((g) => (
                <div key={g} className="relative aspect-square overflow-hidden rounded-xl border border-line/60">
                  <img src={g} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADVICE */}
        {m.advice && (
          <figure className={`${card} p-6 sm:p-8`}>
            <span className="font-display text-4xl leading-none text-gold">&ldquo;</span>
            <blockquote className="mt-1 font-display text-xl font-medium leading-relaxed text-ink sm:text-2xl">{m.advice}</blockquote>
            <figcaption className="mt-3 text-sm font-semibold text-[#7A5E0F]">{first}&apos;s advice for beginners</figcaption>
          </figure>
        )}

        {/* FUN FACTS */}
        {m.funFacts && m.funFacts.length > 0 && (
          <div className={`${card} p-6 sm:p-7`}>
            <p className={eyebrow}>A little more about {first}</p>
            <div className="mt-4 grid gap-x-10 gap-y-1 sm:grid-cols-2">
              {m.funFacts.map((f) => (
                <div key={f.q} className="flex items-baseline justify-between gap-4 border-b border-line/60 py-3">
                  <span className="text-sm text-ink/70">{f.q}</span>
                  <span className="text-right text-sm font-semibold text-ink">{f.a}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky action bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-white/95 backdrop-blur-md lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="container-mp flex gap-3 py-3">
          <a href={msg} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-gold/60 text-sm font-semibold text-[#7A5E0F]">Message</a>
          <a href={trial} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] flex-[1.4] items-center justify-center gap-2 rounded-full bg-gold text-sm font-semibold text-charcoal">
            Book a trial with {first}
          </a>
        </div>
      </div>
    </div>
  );
}
