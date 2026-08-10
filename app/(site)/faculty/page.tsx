"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loadProfileBySlug, profileList, type TeacherProfile } from "@/lib/profile";

export default function FacultyProfilePage() {
  return (
    <Suspense fallback={<div className="container-mp grid min-h-[50vh] place-items-center py-20 text-ink/50">Loading…</div>}>
      <FacultyProfileInner />
    </Suspense>
  );
}

function FacultyProfileInner() {
  const params = useSearchParams();
  const slug = params.get("id") || "";
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");

  useEffect(() => {
    if (!slug) { setState("missing"); return; }
    loadProfileBySlug(slug).then((p) => { setProfile(p); setState(p ? "ok" : "missing"); });
  }, [slug]);

  if (state === "loading") {
    return <div className="container-mp grid min-h-[50vh] place-items-center py-20 text-ink/50">Loading…</div>;
  }
  if (state === "missing" || !profile) {
    return (
      <div className="container-mp grid min-h-[50vh] place-items-center py-20 text-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Profile not found</h1>
          <p className="mt-2 text-sm text-ink/60">This teacher profile isn&apos;t available.</p>
          <Link href="/teachers" className="mt-5 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper">See all teachers</Link>
        </div>
      </div>
    );
  }

  const first = profile.name.split(" ")[0];
  const bio = profile.bio.split(/\n{1,}/).map((s) => s.trim()).filter(Boolean);
  const chips = (label: string, val: string) => {
    const items = profileList(val);
    if (!items.length) return null;
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">{label}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((it) => <span key={it} className="rounded-full bg-gold/10 px-3 py-1 text-sm text-ink/80">{it}</span>)}
        </div>
      </div>
    );
  };

  return (
    <article className="bg-paper">
      {/* Hero */}
      <div className="bg-ink text-paper">
        <div className="container-mp flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center">
          <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-3xl border border-gold/30 bg-white/5 text-4xl">
            {profile.photo_url ? <img src={profile.photo_url} alt={profile.name} className="h-full w-full object-cover" /> : "🎓"}
          </div>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Musicphonetics Faculty</p>
            <div className="mt-1.5 flex items-center gap-2">
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">{profile.name}</h1>
              <span title="Verified by Musicphonetics" className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold text-gold">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
                Verified
              </span>
            </div>
            {profile.headline && <p className="mt-1.5 text-lg text-paper/80">{profile.headline}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-paper/70">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.experience_years && <span>🎵 {profile.experience_years}+ years</span>}
              {profile.age_group && <span>👥 Ages {profile.age_group}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-mp grid gap-10 py-14 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {bio.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">About {first}</h2>
              <div className="mt-3 space-y-3 text-[0.975rem] leading-relaxed text-ink/75">{bio.map((para, i) => <p key={i}>{para}</p>)}</div>
            </section>
          )}
          {profile.approach && (
            <section className="rounded-2xl border border-hairline bg-white p-5">
              <h2 className="font-display text-lg font-semibold text-ink">How {first} teaches</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{profile.approach}</p>
            </section>
          )}
          {profile.advice && (
            <blockquote className="rounded-2xl border-l-4 border-gold bg-mist/50 p-5 text-lg font-display italic text-ink/80">“{profile.advice}”</blockquote>
          )}
        </div>

        <aside className="space-y-5">
          {chips("Instruments", profile.instruments)}
          {chips("Specialties", profile.specialties)}
          {chips("Qualifications", profile.qualifications)}
          {chips("Achievements", profile.achievements)}
          {chips("Languages", profile.languages)}
          <div className="rounded-2xl border border-hairline bg-white p-5">
            <p className="text-sm font-semibold text-ink">Learn with {first}</p>
            <p className="mt-1 text-xs text-ink/60">Book a free trial and we&apos;ll match you.</p>
            <Link href="/studio" className="mt-3 inline-block w-full rounded-full bg-gold px-5 py-2.5 text-center text-sm font-semibold text-ink hover:bg-deep-gold">Book a free trial</Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
