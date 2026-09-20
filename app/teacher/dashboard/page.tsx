"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { StatCard, Loading, formatMoney } from "@/components/portal/kit";
import { DirectorNote } from "@/components/portal/DirectorNote";
import { TeacherOnboardingSelf } from "@/components/portal/OnboardingChecklist";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadTeacherMessage, type DirectorMessage } from "@/lib/supabase/director";
import { loadRoster } from "@/lib/supabase/roster";
import { computePending, PendingFeesModal, type PendingStudent } from "@/components/portal/PendingFeesModal";
import { useAuth } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
function mondayISO() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}
function monthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const first = (profile?.full_name || "").split(" ")[0] || "there";
  const [stats, setStats] = useState<{ students: number; week: number; received: number; pending: number } | null>(null);
  const [pending, setPending] = useState<PendingStudent[]>([]);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [directorMsg, setDirectorMsg] = useState<DirectorMessage | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setErr("The portal isn’t configured. Please contact the Musicphonetics office.");
      setStats({ students: 0, week: 0, received: 0, pending: 0 });
      return;
    }
    loadTeacherMessage().then(setDirectorMsg).catch(() => {});
    const sb = getSupabase();
    (async () => {
      try {
        // RLS scopes all of these to the signed-in teacher automatically. The
        // roster gives per-student standing so "Pending" can name exactly which
        // students owe (renewal due / unpaid) rather than a lump sum.
        const [rosterRes, weekRes, payRes] = await Promise.all([
          loadRoster(),
          sb.from("class_updates").select("id", { count: "exact", head: true })
            .gte("class_date", mondayISO()).eq("class_status", "Completed"),
          sb.from("payments").select("amount_paid").gte("payment_date", monthStartISO()),
        ]);
        if (rosterRes.error) setErr(rosterRes.error);
        const activeCount = rosterRes.rows.filter((r) => r.status === "active").length;
        const received = (payRes.data ?? []).reduce((s, r) => s + (r.amount_paid ?? 0), 0);
        const { list, total } = computePending(rosterRes.rows);
        setPending(list);
        setStats({
          students: activeCount,
          week: weekRes.count ?? 0,
          received,
          pending: total,
        });
      } catch (e) {
        // Never leave the dashboard spinning, surface a bounded error instead.
        setErr(e instanceof Error ? e.message : "Couldn’t load your data. Please retry.");
        setStats({ students: 0, week: 0, received: 0, pending: 0 });
      }
    })();
  }, []);

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS}>
      <p className="text-sm text-ink/60">{greeting()},</p>
      <h1 className="font-display text-2xl font-semibold text-ink">{first}</h1>
      <p className="mt-1 text-xs text-ink/55">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>

      <NewLeadsAlert />

      {err && (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load your data: {err}
        </div>
      )}
      {!stats ? <Loading /> : (
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Students" value={`${stats.students}/20`} tone="gold" />
          <StatCard label="Classes this week" value={String(stats.week)} />
          <StatCard label="Received this month" value={formatMoney(stats.received)} tone="green" />
          {/* Pending is clickable: it opens the exact list of students who owe. */}
          <button
            onClick={() => pending.length > 0 && setPendingOpen(true)}
            disabled={pending.length === 0}
            className="rounded-2xl border border-hairline bg-white p-4 text-left transition-colors enabled:hover:border-ink/30 disabled:cursor-default">
            <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-ink/60">
              Pending
              {pending.length > 0 && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-ink/35"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </p>
            <p className={cn("mt-1 font-display text-2xl font-semibold", stats.pending > 0 ? "text-red-600" : "text-ink")}>{formatMoney(stats.pending)}</p>
            {pending.length > 0 && (() => {
              const due = pending.filter((p) => p.reason !== "renew_soon").length;
              return (
                <p className="mt-0.5 text-[11px] font-medium text-ink/50">
                  {due > 0 ? `${due} to renew` : `${pending.length} renewing soon`} · tap to see who
                </p>
              );
            })()}
          </button>
        </div>
      )}

      {pendingOpen && (
        <PendingFeesModal
          list={pending}
          total={stats?.pending ?? 0}
          onClose={() => setPendingOpen(false)}
        />
      )}

      <div className="mt-6 grid gap-3">
        <Action href="/teacher/add-student" label="Add Student" primary />
        <div className="grid grid-cols-2 gap-3">
          <Action href="/teacher/class-update" label="Add Class Update" />
          <Action href="/teacher/payments" label="Add Payment" />
        </div>
        <Action href="/teacher/students" label="View My Students" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Action href="/teacher/today" label="Today's Classes" />
        <Action href="/teacher/schedule" label="Schedule" />
        <Action href="/teacher/reports" label="Monthly Reports" />
        <Action href="/teacher/earnings" label="Earnings" />
        <Action href="/teacher/profile-maker" label="My public profile" />
      </div>

      <div className="mt-6">
        <TeacherOnboardingSelf />
      </div>

      <div className="mt-6">
        <DirectorNote variant="teacher" custom={directorMsg ? { title: directorMsg.title, body: directorMsg.body, date: directorMsg.created_at } : null} />
      </div>
    </PortalShell>
  );
}

// New assigned leads the teacher hasn't contacted yet, surfaced up front so
// they never hunt for them (RLS scopes the count to their own leads).
function NewLeadsAlert() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    getSupabase().from("leads").select("id", { count: "exact", head: true })
      .is("first_contacted_at", null).not("status", "in", "(converted,lost,not_interested,duplicate)")
      .then(({ count }) => setCount(count ?? 0));
  }, []);
  if (count <= 0) return null;
  return (
    <Link href="/teacher/leads" className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-gold/50 bg-gold/[0.08] p-4">
      <div>
        <p className="font-display text-base font-semibold text-ink">{count} new lead{count === 1 ? "" : "s"} to follow up</p>
        <p className="text-xs text-ink/60">Tap to contact and convert them.</p>
      </div>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-sm font-bold text-ink">{count > 9 ? "9+" : count}</span>
    </Link>
  );
}

function Action({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link href={href}
      className={
        "flex min-h-[54px] items-center justify-center rounded-2xl px-4 text-center text-sm font-semibold transition-all active:scale-[0.98] " +
        (primary ? "bg-ink text-paper shadow-card" : "border border-hairline bg-white text-ink")
      }>
      {primary && <span className="mr-1.5 text-gold">+</span>}{label}
    </Link>
  );
}
