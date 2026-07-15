"use client";

import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";

// Operational settings & admin index. No secrets are shown or editable here —
// keys (Supabase service role, Razorpay, Resend) live only in Cloudflare env.
const LINKS: { href: string; title: string; sub: string }[] = [
  { href: "/owner/students", title: "Students", sub: "Codes, plans, teacher assignment, search" },
  { href: "/owner/teachers", title: "Teachers", sub: "Roster, onboarding, earnings" },
  { href: "/owner/applications", title: "Applications", sub: "Approve teachers, offer & joining letters" },
  { href: "/owner/schedule", title: "Schedule", sub: "All classes, filters, conflicts" },
  { href: "/owner/messages", title: "Messages & notifications", sub: "Director notes and the bell feed" },
  { href: "/owner/payments", title: "Payments", sub: "Invoices, receipts, settlement" },
  { href: "/owner/payouts", title: "Payouts", sub: "Teacher settlements" },
  { href: "/owner/reports", title: "Reports", sub: "Review & publish monthly reports" },
  { href: "/owner/documents", title: "Documents", sub: "Every student's documents" },
  { href: "/owner/audit", title: "Audit log", sub: "Append-only activity record" },
];

const ENV_NOTES = [
  ["ACTIVATION_CODE", "The code families use on Student Activation"],
  ["RESEND_API_KEY / MAIL_FROM", "Auto-emails teacher offers on approval"],
  ["RAZORPAY_KEY_ID / KEY_SECRET", "Enrolment payments (server-only)"],
  ["DIRECTOR_TEACHER_ID", "Default teacher for activated students"],
  ["ALLOWED_ORIGIN_HOSTS", "Optional: restrict which origins may call public APIs"],
];

export default function OwnerSettings() {
  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Settings">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-2xl border border-hairline bg-white p-4 transition hover:border-ink/30 hover:shadow-card">
            <p className="text-sm font-semibold text-ink">{l.title}</p>
            <p className="mt-0.5 text-xs text-ink/60">{l.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-hairline bg-white p-5">
        <p className="font-display text-lg font-semibold text-ink">Configuration</p>
        <p className="mt-0.5 text-sm text-ink/60">These are set as environment variables in Cloudflare Pages — never in the app. Values are never shown here.</p>
        <div className="mt-3 divide-y divide-hairline">
          {ENV_NOTES.map(([k, v]) => (
            <div key={k} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <code className="rounded bg-mist px-2 py-0.5 text-xs text-ink/80">{k}</code>
              <span className="text-sm text-ink/60">{v}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink/55">Database migrations live in <code className="rounded bg-mist px-1">/supabase/*.sql</code> and are run in the Supabase SQL editor.</p>
      </div>
    </PortalShell>
  );
}
