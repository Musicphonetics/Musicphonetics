"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, formatMoney } from "@/components/portal/kit";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadOwnerData, computeKpis, rollupTeachers, daysToBirthday, type OwnerData, type OwnerKpis, type TeacherRollup } from "@/lib/supabase/owner";
import { computeFoundation } from "@/lib/foundation";
import { cn } from "@/lib/utils";

export default function OwnerDashboard() {
  const [data, setData] = useState<OwnerData | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadOwnerData().then(setData);
    // Realtime: refresh when teachers submit.
    const sb = getSupabase();
    const ch = sb.channel("owner-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => loadOwnerData().then(setData))
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => loadOwnerData().then(setData))
      .on("postgres_changes", { event: "*", schema: "public", table: "class_updates" }, () => loadOwnerData().then(setData))
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, []);

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Command dashboard">
      {!data ? <Loading /> : <Body data={data} />}
    </PortalShell>
  );
}

function Body({ data }: { data: OwnerData }) {
  const k: OwnerKpis = computeKpis(data);
  const teachers: TeacherRollup[] = rollupTeachers(data).sort((a, b) => b.revenue - a.revenue);

  if (data.error) {
    return <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Couldn&apos;t load data: {data.error}</div>;
  }

  const split = [
    { name: "Teacher 70%", value: k.teacherMonth, fill: "#1E3A2E" },
    { name: "Company 30%", value: k.companyMonth, fill: "#C9A227" },
  ];
  const perTeacher = teachers.slice(0, 8).map((t) => ({ name: t.name.split(" ")[0], students: t.students, revenue: t.revenue }));
  const trend = revenueTrend(data);

  const inactiveTeachers = teachers.filter((t) => t.classesLogged === 0);
  const pendingPayments = data.payments.filter((p) => p.payment_status === "Pending" || p.payment_status === "Partial");
  const birthdays = data.students
    .map((s) => ({ s, d: daysToBirthday(s.dob) }))
    .filter((x) => x.d !== null && (x.d as number) <= 30 && x.s.status === "active")
    .sort((a, b) => (a.d as number) - (b.d as number));

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Kpi label="Active students" value={String(k.activeStudents)} />
        <Kpi label="Revenue this month" value={formatMoney(k.revenueMonth)} tone="green" />
        <Kpi label="Company 30%" value={formatMoney(k.companyMonth)} tone="gold" />
        <Kpi label="Teacher 70%" value={formatMoney(k.teacherMonth)} />
        <Kpi label="Active teachers" value={String(k.activeTeachers)} />
        <Kpi label="Classes this month" value={String(k.classesMonth)} />
        <Kpi label="Renewals due" value={String(k.renewalsDue)} tone={k.renewalsDue ? "red" : "ink"} />
        <Kpi label="Birthdays ≤30d" value={String(k.birthdays30)} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="This month split">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={split} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {split.map((s) => <Cell key={s.name} fill={s.fill} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatMoney(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            <Legend color="#1E3A2E" label="Teacher 70%" />
            <Legend color="#C9A227" label="Company 30%" />
          </div>
        </Card>

        <Card title="Students per teacher">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perTeacher} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <XAxis dataKey="name" tick={{ fill: "#161B26", fontSize: 11 }} axisLine={{ stroke: "#e5e0d5" }} tickLine={false} />
                <YAxis tick={{ fill: "#5f5a4e", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Bar dataKey="students" fill="#C9A227" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Revenue trend (6 mo)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <XAxis dataKey="m" tick={{ fill: "#161B26", fontSize: 11 }} axisLine={{ stroke: "#e5e0d5" }} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} tick={{ fill: "#5f5a4e", fontSize: 11 }} axisLine={false} tickLine={false} width={38} />
                <Tooltip formatter={(v: number) => formatMoney(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#1E3A2E" strokeWidth={2.5} dot={{ r: 3, fill: "#C9A227" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <AlertList title="Renewals due (≤2 classes left)" tone="red" items={renewalItems(data)} />
        <AlertList title="Pending payments" tone="gold"
          items={pendingPayments.slice(0, 8).map((p) => `${nameFor(data, p.student_id)} · ${formatMoney(p.amount_paid)} · ${p.payment_status}`)} />
        <AlertList title="Upcoming birthdays" tone="green"
          items={birthdays.slice(0, 8).map((b) => `${b.s.name} · in ${b.d} day${b.d === 1 ? "" : "s"}`)} />
      </div>
      {inactiveTeachers.length > 0 && (
        <AlertList title="Teachers with no classes logged" tone="red"
          items={inactiveTeachers.map((t) => t.name)} />
      )}

      {/* Foundation upgrade pipeline - the ₹8k → ₹12k sales pipeline */}
      <UpgradePipeline data={data} />
    </div>
  );
}

function UpgradePipeline({ data }: { data: OwnerData }) {
  const completed = new Map<string, number>();
  for (const c of data.classes) if (c.class_status === "Completed") completed.set(c.student_id, (completed.get(c.student_id) ?? 0) + 1);

  const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, ready: 0, upgraded: 0 };
  const readyNames: string[] = [];
  for (const s of data.students) {
    if (s.status !== "active") continue;
    const isMain = (s.fee_quoted ?? 8000) >= 12000;
    if (isMain) { buckets.upgraded++; continue; }
    const f = computeFoundation(completed.get(s.id) ?? 0, 1, false, false);
    if (f.readyForUpgrade) { buckets.ready++; readyNames.push(s.name); }
    else buckets[f.currentChapter.number as 1 | 2 | 3 | 4]++;
  }

  const cells = [
    { label: "Chapter 1", n: buckets[1] },
    { label: "Chapter 2", n: buckets[2] },
    { label: "Chapter 3", n: buckets[3] },
    { label: "Chapter 4", n: buckets[4] },
    { label: "Ready to upgrade", n: buckets.ready, hot: true },
    { label: "On Main Pathway", n: buckets.upgraded, green: true },
  ];

  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-ink">Foundation upgrade pipeline</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {cells.map((c) => (
          <div key={c.label} className={cn("rounded-xl border p-3 text-center",
            c.hot ? "border-gold/50 bg-gold/[0.08]" : c.green ? "border-feature-green/30 bg-feature-green/[0.06]" : "border-hairline bg-paper")}>
            <p className={cn("font-display text-2xl font-semibold", c.hot ? "text-[#7A5E0F]" : c.green ? "text-feature-green" : "text-ink")}>{c.n}</p>
            <p className="mt-0.5 text-[10px] uppercase leading-tight tracking-wide text-ink/55">{c.label}</p>
          </div>
        ))}
      </div>
      {readyNames.length > 0 && (
        <p className="mt-3 text-xs text-ink/70">
          <b className="text-[#7A5E0F]">Ready for the Main Pathway:</b> {readyNames.slice(0, 12).join(", ")}
          {readyNames.length > 12 ? ` +${readyNames.length - 12} more` : ""}. Time for a founder call.
        </p>
      )}
    </div>
  );
}

function renewalItems(data: OwnerData): string[] {
  const completed = new Map<string, number>();
  for (const c of data.classes) if (c.class_status === "Completed") completed.set(c.student_id, (completed.get(c.student_id) ?? 0) + 1);
  return data.students
    .filter((s) => s.status === "active" && (s.classes_per_month ?? 0) - (completed.get(s.id) ?? 0) <= 2)
    .slice(0, 8)
    .map((s) => `${s.name} · ${Math.max((s.classes_per_month ?? 0) - (completed.get(s.id) ?? 0), 0)} left`);
}

function revenueTrend(data: OwnerData) {
  const now = new Date();
  const buckets: { m: string; key: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ m: d.toLocaleString("en-IN", { month: "short" }), key: `${d.getFullYear()}-${d.getMonth()}`, revenue: 0 });
  }
  for (const p of data.payments) {
    const d = new Date(p.payment_date); if (isNaN(+d)) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const b = buckets.find((x) => x.key === key);
    if (b) b.revenue += p.amount_paid ?? 0;
  }
  return buckets;
}

function nameFor(data: OwnerData, studentId: string): string {
  return data.students.find((s) => s.id === studentId)?.name ?? "-";
}

function Kpi({ label, value, tone = "ink" }: { label: string; value: string; tone?: "ink" | "gold" | "green" | "red" }) {
  const c = { ink: "text-ink", gold: "text-[#7A5E0F]", green: "text-feature-green", red: "text-red-600" }[tone];
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink/60">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-semibold", c)}>{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />{label}</span>;
}

function AlertList({ title, items, tone }: { title: string; items: string[]; tone: "red" | "gold" | "green" }) {
  const dot = { red: "bg-red-500", gold: "bg-gold", green: "bg-feature-green" }[tone];
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      {items.length === 0 ? <p className="text-xs text-ink/50">Nothing right now.</p> : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-ink/75">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} />{it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
