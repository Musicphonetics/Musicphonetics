"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadPendingProfiles, loadPublishedProfiles, reviewProfile, type TeacherProfile } from "@/lib/profile";

export default function OwnerTeacherProfiles() {
  const [pending, setPending] = useState<TeacherProfile[] | null>(null);
  const [published, setPublished] = useState<TeacherProfile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function reload() {
    loadPendingProfiles().then(setPending);
    loadPublishedProfiles().then(setPublished);
  }
  useEffect(() => { if (isSupabaseConfigured()) reload(); else setPending([]); }, []);

  async function review(id: string, approve: boolean) {
    setBusyId(id); setErr(null);
    const { error } = await reviewProfile(id, approve);
    setBusyId(null);
    if (error) setErr(/function .*mp_review_teacher_profile/i.test(error) ? "Run supabase/owner_leads_teacher_profiles.sql first." : error);
    else reload();
  }

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Teacher profiles">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Pending approval</h2>
        {!pending ? <Loading /> : pending.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-hairline bg-white p-5 text-sm text-ink/60">No profile updates waiting. New teachers publish their first profile instantly; later edits appear here.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="rounded-2xl border border-gold/40 bg-white p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-mist text-xl">
                    {p.photo_url ? <img src={p.photo_url} alt="" className="h-full w-full object-cover" /> : "🎓"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-semibold text-ink">{p.name}</p>
                    {p.headline && <p className="text-sm text-ink/70">{p.headline}</p>}
                    <p className="mt-2 line-clamp-3 text-sm text-ink/65">{p.bio}</p>
                    {p.slug && <Link href={`/faculty?id=${p.slug}`} target="_blank" className="mt-2 inline-block text-xs font-semibold text-[#7A5E0F] underline">Preview →</Link>}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => review(p.id!, true)} disabled={busyId === p.id}
                    className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink hover:bg-deep-gold disabled:opacity-50">Approve &amp; publish</button>
                  <button onClick={() => review(p.id!, false)} disabled={busyId === p.id}
                    className="rounded-full border border-hairline px-5 py-2 text-sm font-semibold text-ink/70 hover:border-ink/40 disabled:opacity-50">Send back</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">Published ({published.length})</h2>
        {published.length === 0 ? (
          <p className="mt-3 text-sm text-ink/55">No published teacher profiles yet.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((p) => (
              <Link key={p.id} href={`/faculty?id=${p.slug}`} target="_blank" className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-4 hover:border-ink/30">
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-mist text-lg">
                  {p.photo_url ? <img src={p.photo_url} alt="" className="h-full w-full object-cover" /> : "🎓"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                  <span className="block truncate text-xs text-ink/60">{p.headline || p.instruments}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PortalShell>
  );
}
