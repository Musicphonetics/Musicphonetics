"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";
import { TableShell, Th, Td, StatusPill, toneForStatus } from "@/components/admin/Table";
import { signOutOwner } from "@/lib/owner-auth";
import {
  MOCK_PEOPLE,
  MOCK_STUDENTS,
} from "@/lib/mock-crm";
import { TEACHERS } from "@/lib/teachers";
import { REVIEWS } from "@/lib/data";
import { ROADMAP } from "@/lib/geo";
import { formatINR } from "@/lib/utils";

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "gold" | "green" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p
        className={
          "mt-2 font-display text-2xl font-semibold " +
          (tone === "green"
            ? "text-feature-green"
            : tone === "warn"
            ? "text-deep-gold"
            : "text-ink")
        }
      >
        {value}
      </p>
    </div>
  );
}

export function OwnerDashboard() {
  const router = useRouter();

  // ---- Derived metrics (mock data; structured to swap for Sheets/WATI) ----
  const totalLeads = MOCK_PEOPLE.length;
  const trialBookings = MOCK_PEOPLE.filter((p) =>
    ["New", "Contacted"].includes(p.currentStatus)
  ).length;
  const activeStudents = MOCK_STUDENTS.filter(
    (s) => s.status === "Active" || s.status === "Renewal Due"
  ).length;
  const teacherCount = TEACHERS.length;
  const pendingFollowups = MOCK_PEOPLE.filter(
    (p) => !["Converted", "Lost"].includes(p.currentStatus)
  ).length;
  const paymentsDue = MOCK_STUDENTS.reduce((s, x) => s + x.balance, 0);
  const classesCompleted = MOCK_STUDENTS.reduce((s, x) => s + x.classesDone, 0);
  const classesRemaining = MOCK_STUDENTS.reduce(
    (s, x) => s + (x.classesPurchased - x.classesDone),
    0
  );

  // City-wise enquiries
  const cityCounts = new Map<string, number>();
  MOCK_PEOPLE.forEach((p) =>
    cityCounts.set(p.area, (cityCounts.get(p.area) ?? 0) + 1)
  );
  const cityWise = [...cityCounts.entries()].sort((a, b) => b[1] - a[1]);
  const maxCity = Math.max(...cityWise.map(([, c]) => c), 1);

  const recent = [...MOCK_PEOPLE]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6);

  function handleSignOut() {
    signOutOwner();
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-hairline bg-ink text-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Logo invert />
            <span className="hidden text-sm text-paper/50 sm:inline">Owner portal</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="gold">Mock data · ready to connect</Badge>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-paper/80 hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink/55">
            A live operating snapshot. Connect Google Sheets / WATI to replace
            mock data.
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total leads" value={String(totalLeads)} tone="gold" />
          <MetricCard label="Trial bookings" value={String(trialBookings)} />
          <MetricCard label="Active students" value={String(activeStudents)} tone="green" />
          <MetricCard label="Teachers" value={String(teacherCount)} />
          <MetricCard label="Pending follow-ups" value={String(pendingFollowups)} tone="warn" />
          <MetricCard label="Payments due" value={formatINR(paymentsDue)} tone="warn" />
          <MetricCard label="Classes completed" value={String(classesCompleted)} />
          <MetricCard label="Classes remaining" value={String(classesRemaining)} />
        </div>

        {/* City-wise + Reviews */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
            <h2 className="text-base font-semibold text-ink">City-wise enquiries</h2>
            <ul className="mt-5 space-y-3">
              {cityWise.map(([city, count]) => (
                <li key={city} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm text-ink/70">{city}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${(count / maxCity) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-sm font-semibold text-ink">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
            <h2 className="text-base font-semibold text-ink">Reviews collected</h2>
            <p className="mt-2 font-display text-4xl font-semibold text-ink">{REVIEWS.length}</p>
            <p className="mt-1 text-sm text-ink/55">Written reviews · video reviews coming soon.</p>
            <div className="mt-4 rounded-xl border border-hairline bg-paper p-4 text-sm italic text-ink/70">
              “{REVIEWS[0].quote}”
              <span className="mt-1 block not-italic text-xs text-ink/45">- {REVIEWS[0].name}</span>
            </div>
          </div>
        </div>

        {/* Recent enquiries */}
        <div>
          <h2 className="mb-3 text-base font-semibold text-ink">Recent enquiries</h2>
          <TableShell>
            <thead className="border-b border-hairline bg-paper/60">
              <tr>
                <Th>Name</Th>
                <Th>City</Th>
                <Th>Instrument</Th>
                <Th>Source</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {recent.map((p) => (
                <tr key={p.id} className="hover:bg-paper/50">
                  <Td className="font-medium text-ink">{p.name}</Td>
                  <Td>{p.area}</Td>
                  <Td>{p.instrument}</Td>
                  <Td>{p.leadSource}</Td>
                  <Td>
                    <StatusPill tone={toneForStatus(p.currentStatus)}>{p.currentStatus}</StatusPill>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </div>

        {/* Teacher availability */}
        <div>
          <h2 className="mb-3 text-base font-semibold text-ink">Teacher availability</h2>
          <TableShell>
            <thead className="border-b border-hairline bg-paper/60">
              <tr>
                <Th>Teacher</Th>
                <Th>Instruments</Th>
                <Th>Location</Th>
                <Th>Format</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {TEACHERS.map((t, i) => (
                <tr key={t.id} className="hover:bg-paper/50">
                  <Td className="font-medium text-ink">{t.name}</Td>
                  <Td>{t.instruments.join(", ")}</Td>
                  <Td>{t.cities.join(" / ")}</Td>
                  <Td>{t.modes.join(" / ")}</Td>
                  <Td>
                    <StatusPill tone={i % 4 === 0 ? "gold" : "green"}>
                      {i % 4 === 0 ? "Limited slots" : "Available"}
                    </StatusPill>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </div>

        {/* Expansion roadmap */}
        <div>
          <h2 className="mb-3 text-base font-semibold text-ink">Expansion roadmap</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {ROADMAP.map((g) => (
              <div key={g.key} className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
                <Badge tone={g.tone === "live" ? "green" : g.tone === "soon" ? "gold" : "muted"}>
                  {g.label}
                </Badge>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {g.cities.map((c) => (
                    <li key={c} className="rounded-lg border border-hairline bg-paper px-2.5 py-1 text-sm text-ink/75">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
