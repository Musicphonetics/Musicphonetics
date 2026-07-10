"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, signOut } from "@/lib/supabase/auth";
import { Loading } from "./kit";
import { cn } from "@/lib/utils";

export interface Tab {
  href: string;
  label: string;
  icon: ReactNode;
}

// Wraps every portal screen: enforces auth + role, then renders either the
// mobile bottom tab bar (teacher/parent) or a wide top-nav command layout (owner).
// theme="night" gives the dark, cinematic treatment (the parent portal).
export function PortalShell({
  children, role, tabs, title, subtitle, headerRight, variant = "mobile", theme = "light",
}: {
  children: ReactNode; role: "teacher" | "owner" | "parent"; tabs: Tab[]; title?: string;
  subtitle?: string; headerRight?: ReactNode; variant?: "mobile" | "wide"; theme?: "light" | "night";
}) {
  const { loading, configured, userId, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const night = theme === "night";
  const loginPath = role === "owner" ? "/owner/login" : role === "parent" ? "/parent/login" : "/teacher/login";

  useEffect(() => {
    if (!loading && configured && !userId) router.replace(loginPath);
  }, [loading, configured, userId, router, loginPath]);

  if (!configured) {
    return (
      <Centered>
        <h1 className="font-display text-xl font-semibold text-ink">Portal not configured</h1>
        <p className="mt-2 max-w-sm text-sm text-ink/65">
          Supabase environment variables are missing. Set them in Cloudflare Pages and redeploy.
        </p>
      </Centered>
    );
  }
  if (loading) return <div className={cn("min-h-screen", night ? "bg-onyx" : "bg-paper")}><Loading dark={night} /></div>;
  if (!userId) return <div className={cn("min-h-screen", night ? "bg-onyx" : "bg-paper")}><Loading dark={night} label="Redirecting…" /></div>;

  if (profile && profile.role !== role) {
    return (
      <Centered>
        <h1 className="font-display text-xl font-semibold text-ink">Wrong area</h1>
        <p className="mt-2 max-w-sm text-sm text-ink/65">
          This account is a <b>{profile.role}</b>. Use the {profile.role} portal
          {role === "teacher" ? " - the owner dashboard is at /owner/dashboard." : "."}
        </p>
        <button onClick={() => signOut()} className="mt-5 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">Sign out</button>
      </Centered>
    );
  }
  if (profile && profile.status === "blacklisted") {
    return (
      <Centered>
        <h1 className="font-display text-xl font-semibold text-ink">Account paused</h1>
        <p className="mt-2 max-w-sm text-sm text-ink/65">Your account is inactive. Please contact the Musicphonetics office.</p>
        <button onClick={() => signOut()} className="mt-5 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">Sign out</button>
      </Centered>
    );
  }

  if (variant === "wide") {
    return (
      <div className="min-h-screen bg-paper">
        <header className="sticky top-0 z-30 border-b border-hairline bg-ink text-paper">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <p className="font-display text-base font-semibold">Musicphonetics <span className="text-gold">Owner</span></p>
            <nav className="flex flex-1 flex-wrap items-center gap-1">
              {tabs.map((t) => {
                const active = pathname === t.href;
                return (
                  <Link key={t.href} href={t.href}
                    className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      active ? "bg-gold text-ink" : "text-paper/70 hover:text-paper")}>
                    {t.label}
                  </Link>
                );
              })}
            </nav>
            <button onClick={() => signOut()} className="text-sm text-paper/60 hover:text-paper">Sign out</button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          {title && <h1 className="mb-5 font-display text-2xl font-semibold text-ink">{title}</h1>}
          {children}
        </main>
      </div>
    );
  }

  if (night) {
    return (
      <div className="min-h-screen bg-onyx pb-24 text-paper">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-onyx/85 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18V6l8-2v10" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.7" /><circle cx="14.5" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>
              </span>
              <span className="leading-tight">
                <span className="block font-display text-sm font-semibold tracking-wide text-paper">{title || "Musicphonetics"}</span>
                {subtitle && <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold">{subtitle}</span>}
              </span>
            </div>
            {headerRight}
          </div>
        </header>
        <main className="mx-auto max-w-md px-4 py-5">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-onyx-1/95 backdrop-blur-md"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="mx-auto flex max-w-md items-stretch justify-around">
            {tabs.map((t) => {
              const active = pathname === t.href;
              return (
                <Link key={t.href} href={t.href}
                  className={cn("relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    active ? "text-gold" : "text-paper/45")}>
                  {active && <span aria-hidden="true" className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gold" />}
                  <span className="grid h-7 w-7 place-items-center">{t.icon}</span>
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-24">
      {title && (
        <header className="sticky top-0 z-30 border-b border-hairline bg-paper/90 px-4 py-3 backdrop-blur">
          <p className="font-display text-base font-semibold text-ink">{title}</p>
        </header>
      )}
      <main className="mx-auto max-w-md px-4 py-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link key={t.href} href={t.href}
                className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-[#7A5E0F]" : "text-ink/55")}>
                <span className={cn("grid h-7 w-7 place-items-center", active && "text-[#7A5E0F]")}>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="grid min-h-screen place-items-center bg-paper px-6 text-center"><div>{children}</div></div>;
}
