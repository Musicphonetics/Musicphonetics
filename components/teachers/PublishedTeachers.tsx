"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { loadPublishedProfiles, type TeacherProfile } from "@/lib/profile";

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

// Auto-lists teacher profiles the moment they're published/approved. Client-
// fetched so new teachers appear without a rebuild (the site is static export).
export function PublishedTeachers() {
  const [list, setList] = useState<TeacherProfile[] | null>(null);
  useEffect(() => { loadPublishedProfiles().then(setList).catch(() => setList([])); }, []);

  if (!list || list.length === 0) return null;

  return (
    <Section background="white" spacing="lg">
      <p className="eyebrow">Our faculty</p>
      <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Meet the teachers.</h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <Link key={m.slug} href={`/faculty?id=${m.slug}`} className="group flex items-center gap-4 rounded-2xl border border-hairline bg-white p-5 transition hover:border-gold hover:shadow-card">
            <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
              {m.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#C9A227,#A8851B)] font-display text-xl font-semibold text-white">{initials(m.name)}</span>
              )}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="block font-display text-lg font-semibold text-ink">{m.name}</span>
                <VerifiedTick />
              </span>
              <span className="block truncate text-sm text-ink/60">{m.headline || m.instruments}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#7A5E0F]">View profile
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function VerifiedTick() {
  return (
    <span title="Verified by Musicphonetics" className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#7A5E0F] text-white">
      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
    </span>
  );
}
