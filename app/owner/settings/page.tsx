"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { PROGRAM_PRICES, priceLabel } from "@/lib/pricing";
import { SalesTeam } from "@/components/owner/SalesTeam";
import { AiKnowledge } from "@/components/owner/AiKnowledge";
import { cn } from "@/lib/utils";

// Operational settings & admin index. No secrets are shown or editable here, // keys (Supabase service role, Razorpay, Resend) live only in Cloudflare env.
const LINKS: { href: string; title: string; sub: string }[] = [
  { href: "/owner/leads", title: "Leads", sub: "Enquiries, pipeline, assignment, conversion" },
  { href: "/owner/students", title: "Students", sub: "Codes, plans, teacher assignment, search" },
  { href: "/owner/teachers", title: "Teachers", sub: "Roster, onboarding, coupons, earnings" },
  { href: "/owner/applications", title: "Applications", sub: "Approve teachers, offer & joining letters" },
  { href: "/owner/schedule", title: "Schedule", sub: "All classes, filters, conflicts" },
  { href: "/owner/messages", title: "Messages & notifications", sub: "Director notes and the bell feed" },
  { href: "/owner/payments", title: "Payments", sub: "Invoices, receipts, settlement" },
  { href: "/owner/payouts", title: "Payouts", sub: "Teacher settlements" },
  { href: "/owner/reports", title: "Reports", sub: "Review & publish monthly reports" },
  { href: "/owner/documents", title: "Documents", sub: "Every student's documents" },
  { href: "/owner/audit", title: "Audit log", sub: "Append-only activity record" },
];

const PROGRAMS: { name: string; price: string; note: string; tone: string }[] = [
  { name: "Foundation", price: priceLabel("foundation"), tone: "bg-gold/15 text-[#7A5E0F]",
    note: "32-class beginner journey (Explore → Play → Make Music → Perform). Progress bar + monthly focus." },
  { name: "Main Pathway", price: priceLabel("main"), tone: "bg-forest/12 text-forest",
    note: "Ongoing structured development, guided by a fresh monthly goal the teacher sets." },
  { name: "Director's Circle", price: "From ₹2,500/class", tone: "bg-ink/10 text-ink/70",
    note: "Bespoke, director-guided. By consultation, from ₹2,500 per class, up to ₹5,000. Owner-managed." },
];

const ENV_NOTES = [
  ["ACTIVATION_CODE", "The code families use on Student Activation"],
  ["BREVO_API_KEY (or RESEND_API_KEY) / MAIL_FROM", "Sends offers, notifications & update emails. Brevo needs no domain (verify one sender)."],
  ["RAZORPAY_KEY_ID / KEY_SECRET", "Enrolment payments (server-only)"],
  ["DIRECTOR_TEACHER_ID", "Default teacher for activated students"],
  ["ALLOWED_ORIGIN_HOSTS", "Optional: restrict which origins may call public APIs"],
];

interface CouponRow { code: string; discount_percent: number; active: boolean; label: string | null; teacher_id: string }

export default function OwnerSettings() {
  const [coupons, setCoupons] = useState<CouponRow[] | null>(null);
  const [couponNote, setCouponNote] = useState<string | null>(null);
  const [emailTest, setEmailTest] = useState<{ busy: boolean; ok: boolean | null; note: string | null }>({ busy: false, ok: null, note: null });

  async function sendTestEmail() {
    setEmailTest({ busy: true, ok: null, note: null });
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const token = session?.access_token;
      if (!token) { setEmailTest({ busy: false, ok: false, note: "Please sign in again." }); return; }
      const res = await fetch("/api/email-test", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: "{}" });
      const j = await res.json().catch(() => ({}));
      setEmailTest({ busy: false, ok: !!j.sent, note: j.sent ? `Sent to ${j.to} via ${j.note?.replace(/^sent via /, "") || "provider"}. Check your inbox (and spam).` : (j.note || "Could not send.") });
    } catch (e) {
      setEmailTest({ busy: false, ok: false, note: (e as Error)?.message || "Request failed." });
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) { setCoupons([]); return; }
    getSupabase().from("teacher_coupons").select("code,discount_percent,active,label,teacher_id").order("active", { ascending: false })
      .then(({ data, error }) => {
        if (error) { setCouponNote(/relation|does not exist|schema cache/i.test(error.message) ? "Run supabase/teacher_coupons.sql to enable teacher coupons." : error.message); setCoupons([]); }
        else setCoupons((data as CouponRow[]) ?? []);
      });
  }, []);

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Settings">
      {/* Programs & current pricing */}
      <section className="rounded-2xl border border-hairline bg-white p-5">
        <p className="font-display text-lg font-semibold text-ink">Programs &amp; current pricing</p>
        <p className="mt-0.5 text-sm text-ink/60">The current list prices used across the site and for new enrolments. Historical payments keep their own amounts.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PROGRAMS.map((p) => (
            <div key={p.name} className="rounded-xl border border-hairline p-4">
              <div className="flex items-center justify-between gap-2">
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", p.tone)}>{p.name}</span>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-ink">{p.price}<span className="text-sm font-normal text-ink/50">{PROGRAM_PRICES[p.name === "Foundation" ? "foundation" : p.name === "Main Pathway" ? "main" : "directors"] != null ? " / mo" : ""}</span></p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink/60">{p.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink/50">To change a list price, update <code className="rounded bg-mist px-1">lib/pricing.ts</code> (single source) and redeploy. A student&apos;s program is set per-student under <Link href="/owner/students" className="font-semibold text-[#7A5E0F]">Students</Link>.</p>
      </section>

      {/* Teacher commercial settings, coupons */}
      <section className="mt-6 rounded-2xl border border-hairline bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-lg font-semibold text-ink">Teacher commercial settings</p>
          <Link href="/owner/teachers" className="text-sm font-semibold text-[#7A5E0F]">Manage per teacher →</Link>
        </div>
        <p className="mt-0.5 text-sm text-ink/60">Coupon codes (percent off) are created per teacher in <b>Teachers</b>. Teachers can see their code but never edit it; the discount is re-validated on the server at payment.</p>
        {couponNote && <p className="mt-3 rounded-lg bg-mist px-3 py-2 text-xs text-ink/70">{couponNote}</p>}
        {coupons === null ? (
          <p className="mt-3 text-sm text-ink/50">Loading…</p>
        ) : coupons.length === 0 ? (
          <p className="mt-3 text-sm text-ink/55">No teacher coupons yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-hairline">
            {coupons.map((c) => (
              <div key={c.code} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="flex items-center gap-3">
                  <code className="rounded bg-mist px-2 py-0.5 font-mono text-sm text-ink">{c.code}</code>
                  <span className="text-sm text-ink/70">{c.label || `${c.discount_percent}%`}</span>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", c.active ? "bg-feature-green/12 text-feature-green" : "bg-mist text-ink/55")}>
                  {c.discount_percent}% · {c.active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI assistant knowledge (how the parent "Ask" assistant is grounded) */}
      <AiKnowledge />

      {/* Sales & marketing team */}
      <SalesTeam />

      {/* Admin index */}
      <p className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wide text-ink/50">Manage</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-2xl border border-hairline bg-white p-4 transition hover:border-ink/30 hover:shadow-card">
            <p className="text-sm font-semibold text-ink">{l.title}</p>
            <p className="mt-0.5 text-xs text-ink/60">{l.sub}</p>
          </Link>
        ))}
      </div>

      {/* Env / config */}
      <div className="mt-6 rounded-2xl border border-hairline bg-white p-5">
        <p className="font-display text-lg font-semibold text-ink">Configuration</p>
        <p className="mt-0.5 text-sm text-ink/60">These are set as environment variables in Cloudflare Pages, never in the app. Values are never shown here.</p>
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

      {/* Email delivery self-test */}
      <div className="mt-6 rounded-2xl border border-hairline bg-white p-5">
        <p className="font-display text-lg font-semibold text-ink">Email delivery</p>
        <p className="mt-0.5 text-sm text-ink/60">Sends a test email to your owner account address, straight through the mail provider. Use it to confirm updates and notifications can actually reach inboxes.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={sendTestEmail} disabled={emailTest.busy}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:brightness-125 disabled:opacity-50">
            {emailTest.busy ? "Sending…" : "Send test email"}
          </button>
          {emailTest.ok !== null && (
            <span className={cn("text-sm", emailTest.ok ? "text-feature-green" : "text-red-600")}>{emailTest.ok ? "✓ Sent" : "✗ Failed"}</span>
          )}
        </div>
        {emailTest.note && <p className={cn("mt-3 rounded-lg px-3 py-2 text-xs", emailTest.ok ? "bg-feature-green/10 text-ink/70" : "bg-red-500/10 text-ink/75")}>{emailTest.note}</p>}
        <p className="mt-3 text-xs text-ink/55">A successful test confirms the provider. For automatic update/notification emails, also run <code className="rounded bg-mist px-1">supabase/notifications_email_all.sql</code> and schedule the outbox drainer (see <code className="rounded bg-mist px-1">supabase/notifications_email.sql</code>).</p>
      </div>
    </PortalShell>
  );
}
