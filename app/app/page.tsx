"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth";
import { Logo } from "@/components/layout/Logo";
import { Icon, Loading } from "@/components/app/states";

// /app — the entry gate for the new application. Signed-in teachers and parents
// are routed to their new /app home; owners go to their existing control centre.
// Signed-out visitors choose an account type and sign in through the EXISTING
// logins (Phase 1 reuses current auth; it does not add a new sign-up yet).

const OPTIONS = [
  { label: "Teacher", desc: "Manage students, lessons and your profile", href: "/teacher/login", icon: "users" },
  { label: "Parent / Student", desc: "Follow your child's learning journey", href: "/parent/login", icon: "children" },
  { label: "Owner / Admin", desc: "Run the platform", href: "/owner/login", icon: "lock" },
  { label: "Sales", desc: "Leads and enrolments", href: "/sales/login", icon: "inbox" },
  { label: "Trial", desc: "Your free-trial journey", href: "/trial/login", icon: "home" },
];

export default function AppGate() {
  const { loading, configured, userId, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !configured || !userId || !profile) return;
    if (profile.role === "teacher") router.replace("/app/teacher/home");
    else if (profile.role === "parent") router.replace("/app/parent/home");
    else if (profile.role === "owner") router.replace("/owner/dashboard");
  }, [loading, configured, userId, profile, router]);

  const redirecting = configured && !!userId && !!profile &&
    (profile.role === "teacher" || profile.role === "parent" || profile.role === "owner");

  if (loading || redirecting) {
    return <div className="grid min-h-[100svh] place-items-center bg-paper"><Loading /></div>;
  }

  return (
    <div className="grid min-h-[100svh] place-items-center bg-paper px-5 py-10 text-ink">
      <div className="w-full max-w-md">
        <div className="flex justify-center"><Logo /></div>
        <div className="mt-7 text-center">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#7A5E0F]">New app · preview</span>
          <h1 className="mt-4 font-display text-[1.9rem] font-semibold leading-tight">Welcome to the Musicphonetics app</h1>
          <p className="mt-2 text-[0.92rem] text-ink/60">Choose how you use Musicphonetics to sign in.</p>
        </div>

        <div className="mt-6 space-y-2.5">
          {OPTIONS.map((o) => (
            <Link key={o.label} href={o.href}
              className="flex items-center gap-3.5 rounded-2xl border border-hairline bg-white p-4 shadow-card transition hover:border-gold/40 hover:shadow-card-hover">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink/5 text-ink/60"><Icon n={o.icon} s={20} /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[1rem] font-semibold text-ink">{o.label}</span>
                <span className="block truncate text-[0.8rem] text-ink/55">{o.desc}</span>
              </span>
              <Icon n="arrow" s={18} c="text-ink/35" />
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-[0.76rem] leading-relaxed text-ink/45">
          This is the new app, in preview. Your current portals keep working exactly as before.
        </p>
      </div>
    </div>
  );
}
