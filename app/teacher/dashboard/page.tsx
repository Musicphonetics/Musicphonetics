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
import { useAuth } from "@/lib/supabase/auth";

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
  const [err, setErr] = useState<string | null>(null);
  const [directorMsg, setDirectorMsg] = useState<DirectorMessage | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadTeacherMessage().then(setDirectorMsg);
    const sb = getSupabase();
    (async () => {
      // RLS scopes all of these to the signed-in teacher automatically.
      const [studentsRes, weekRes, payRes] = await Promise.all([
        sb.from("students").select("fee_quoted,status").eq("status", "active"),
        sb.from("class_updates").select("id", { count: "exact", head: true })
          .gte("class_date", mondayISO()).eq("class_status", "Completed"),
        sb.from("payments").select("amount_paid").gte("payment_date", monthStartISO()),
      ]);
      if (studentsRes.error) setErr(studentsRes.error.message);
      const active = studentsRes.data ?? [];
      const expected = active.reduce((s, r) => s + (r.fee_quoted ?? 0), 0);
      const received = (payRes.data ?? []).reduce((s, r) => s + (r.amount_paid ?? 0), 0);
      setStats({
        students: active.length,
        week: weekRes.count ?? 0,
        received,
        pending: Math.max(expected - received, 0),
      });
    })();
  }, []);

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS}>
      <p className="text-sm text-ink/60">{greeting()},</p>
      <h1 className="font-display text-2xl font-semibold text-ink">{first}</h1>
      <p className="mt-1 text-xs text-ink/55">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>

      {err && (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load your data: {err}
        </div>
      )}
      {!stats ? <Loading /> : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatCard label="Students" value={`${stats.students}/20`} tone="gold" />
          <StatCard label="Classes this week" value={String(stats.week)} />
          <StatCard label="Received this month" value={formatMoney(stats.received)} tone="green" />
          <StatCard label="Pending" value={formatMoney(stats.pending)} tone={stats.pending > 0 ? "red" : "ink"} />
        </div>
      )}

      <div className="mt-6 grid gap-3">
        <Action href="/teacher/add-student" label="Add Student" primary />
        <div className="grid grid-cols-2 gap-3">
          <Action href="/teacher/class-update" label="Add Class Update" />
          <Action href="/teacher/payments" label="Add Payment" />
        </div>
        <Action href="/teacher/students" label="View My Students" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Action href="/teacher/today" label="Today's Classes" />
        <Action href="/teacher/schedule" label="Schedule" />
        <Action href="/teacher/reports" label="Monthly Reports" />
        <Action href="/teacher/earnings" label="Earnings" />
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
