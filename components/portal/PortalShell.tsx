"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, signOut } from "@/lib/supabase/auth";
import { NotificationBell } from "./NotificationBell";
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
  children: ReactNode; role: "teacher" | "owner" | "parent" | "sales"; tabs: Tab[]; title?: string;
  subtitle?: string; headerRight?: ReactNode; variant?: "mobile" | "wide"; theme?: "light" | "night";
}) {
  const { loading, configured, userId, profile, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const night = theme === "night";
  const loginPath = role === "owner" ? "/owner/login" : role === "parent" ? "/parent/login" : role === "sales" ? "/sales/login" : "/teacher/login";

  // Only bounce to login when genuinely signed out — NOT on a network/timeout
  // error (that would loop to a login page that also can't reach the server).
  useEffect(() => {
    if (!loading && configured && !userId && !error) router.replace(loginPath);
  }, [loading, configured, userId, error, router, loginPath]);

  // A staff account (owner/teacher) must never use the Student (parent) portal:
  // the students table has teacher/owner SELECT policies, so it would surface
  // their assigned students. Send them to their own portal instead.
  useEffect(() => {
    if (role === "parent" && profile && (profile.role === "owner" || profile.role === "teacher")) {
      router.replace(profile.role === "owner" ? "/owner/dashboard" : "/teacher/dashboard");
    }
  }, [role, profile, router]);

  // Clear per-user portal state when the signed-in account changes, so a
  // previous user's selection / read-state can never carry over to another.
  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    const KEY = "mp-portal-uid";
    const prev = window.localStorage.getItem(KEY);
    if (prev && prev !== userId) {
      window.localStorage.removeItem("mp-director-read");
      window.localStorage.removeItem("mp-selected-student");
    }
    window.localStorage.setItem(KEY, userId);
  }, [userId]);

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
  // Couldn't reach the server (paused project, dropped connection, timeout):
  // show a bounded retry instead of spinning forever or looping to login.
  if (!loading && error && !userId) {
    return (
      <Centered>
        <h1 className="font-display text-xl font-semibold text-ink">Can’t reach the server</h1>
        <p className="mt-2 max-w-sm text-sm text-ink/65">{error}</p>
        <div className="mt-5 flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">Retry</button>
          <Link href={loginPath} className="rounded-full border border-hairline px-6 py-3 text-sm font-semibold text-ink">Sign in</Link>
        </div>
      </Centered>
    );
  }
  // Instant shell skeleton while auth resolves — the portal never shows a blank
  // screen, and a slow secondary query can't hold up the whole chrome.
  if (loading) return <ShellSkeleton night={night} wide={variant === "wide"} />;
  if (!userId) return <ShellSkeleton night={night} wide={variant === "wide"} />;

  // A staff account (owner/teacher) must never render the Student (parent)
  // portal — it would expose their teacher/owner-visible student rows. Block it
  // (an effect above also redirects them to their own portal).
  if (role === "parent" && profile && (profile.role === "owner" || profile.role === "teacher")) {
    return (
      <Centered>
        <h1 className="font-display text-xl font-semibold text-ink">Staff account</h1>
        <p className="mt-2 max-w-sm text-sm text-ink/65">
          This is a <b>{profile.role}</b> account, so the Student Portal isn&apos;t available here.
          Use your {profile.role} portal instead.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href={profile.role === "owner" ? "/owner/dashboard" : "/teacher/dashboard"}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">Go to my portal</Link>
          <button onClick={() => signOut()} className="rounded-full border border-hairline px-6 py-3 text-sm font-semibold text-ink">Sign out</button>
        </div>
      </Centered>
    );
  }

  // Parents are identified by students.parent_id (RLS + explicit query filter),
  // NOT by a profile role. The parent portal doesn't block a role='parent' or
  // roleless account; staff accounts are handled above. Staff portals enforce role.
  if (role !== "parent" && profile && profile.role !== role) {
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
          <div className="mx-auto max-w-6xl px-4 py-3">
            {/* Brand + sign out */}
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-base font-semibold">Musicphonetics <span className="text-gold">{role === "sales" ? "Sales" : "Owner"}</span></p>
              <div className="flex items-center gap-2">
                <NotificationBell tone="dark" />
                <button onClick={() => signOut()} className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-sm text-paper/70 hover:text-paper">Sign out</button>
              </div>
            </div>
            {/* Tabs: horizontally scrollable on mobile, wrap on desktop */}
            <nav className="-mx-1 mt-2.5 flex items-center gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-2 md:flex-wrap md:overflow-visible">
              {tabs.map((t) => {
                const active = pathname === t.href;
                return (
                  <Link key={t.href} href={t.href}
                    className={cn("shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      active ? "bg-gold text-ink" : "text-paper/70 hover:bg-white/10 hover:text-paper")}>
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          {title && <h1 className="mb-5 font-display text-2xl font-semibold text-ink">{title}</h1>}
          {children}
        </main>
      </div>
    );
  }

  // Non-owner portals (teacher / parent / student). Responsive: on mobile a
  // narrow column + bottom tab bar; on desktop (lg+) a proper left sidebar with
  // a wide content area, so a laptop no longer shows a phone stranded in white.
  const t = night
    ? { shell: "bg-onyx text-paper", side: "bg-onyx-1/70 border-white/10", head: "bg-onyx/85 border-white/10",
        brand: "text-paper", eyebrow: "text-gold", bell: "dark" as const,
        navActive: "bg-gold/15 text-gold", navIdle: "text-paper/55 hover:bg-white/5 hover:text-paper",
        botBar: "bg-onyx-1/95 border-white/10", botActive: "text-gold", botIdle: "text-paper/45",
        ring: "border-gold/30 bg-gold/10 text-gold", signout: "border-white/15 text-paper/70 hover:text-paper" }
    : { shell: "bg-paper text-ink", side: "bg-white border-hairline", head: "bg-paper/90 border-hairline",
        brand: "text-ink", eyebrow: "text-[#7A5E0F]", bell: "light" as const,
        navActive: "bg-gold/12 text-[#7A5E0F]", navIdle: "text-ink/60 hover:bg-ink/[0.04] hover:text-ink",
        botBar: "bg-white/95 border-hairline", botActive: "text-[#7A5E0F]", botIdle: "text-ink/55",
        ring: "border-gold/40 bg-gold/10 text-[#7A5E0F]", signout: "border-hairline text-ink/60 hover:text-ink" };

  const Logo = () => (
    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border", t.ring)}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18V6l8-2v10" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.7" /><circle cx="14.5" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>
    </span>
  );

  return (
    <div className={cn("min-h-screen pb-24 lg:pb-0", t.shell)}>
      {/* Desktop sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r px-4 py-5 lg:flex", t.side)}>
        <div className="flex items-center gap-2.5 px-2">
          <Logo />
          <span className="leading-tight">
            <span className={cn("block font-display text-sm font-semibold", t.brand)}>{title || "Musicphonetics"}</span>
            {subtitle && <span className={cn("block text-[0.6rem] font-semibold uppercase tracking-[0.18em]", t.eyebrow)}>{subtitle}</span>}
          </span>
        </div>
        <nav className="mt-7 flex flex-1 flex-col gap-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? t.navActive : t.navIdle)}>
                <span className="grid h-5 w-5 shrink-0 place-items-center">{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2 border-t px-1 pt-4"
          style={{ borderColor: night ? "rgba(255,255,255,0.08)" : "rgba(22,27,38,0.08)" }}>
          <NotificationBell tone={t.bell} allHref={role === "parent" ? "/parent/notifications" : undefined} />
          <button onClick={() => signOut()} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", t.signout)}>Sign out</button>
        </div>
      </aside>

      {/* Mobile header */}
      {(title || headerRight || true) && (
        <header className={cn("sticky top-0 z-30 border-b px-4 py-3 backdrop-blur lg:hidden", t.head)}>
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="leading-tight">
                <span className={cn("block font-display text-sm font-semibold", t.brand)}>{title || "Musicphonetics"}</span>
                {subtitle && <span className={cn("block text-[0.6rem] font-semibold uppercase tracking-[0.18em]", t.eyebrow)}>{subtitle}</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell tone={t.bell} allHref={role === "parent" ? "/parent/notifications" : undefined} />
              {headerRight}
            </div>
          </div>
        </header>
      )}

      {/* Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-md px-4 py-5 lg:max-w-5xl lg:px-10 lg:py-9">
          {(title || headerRight) && (
            <div className="mb-6 hidden items-center justify-between gap-3 lg:flex">
              <h1 className={cn("font-display text-2xl font-semibold", t.brand)}>{title}</h1>
              {headerRight}
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className={cn("fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur lg:hidden", t.botBar)}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href}
                className={cn("relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? t.botActive : t.botIdle)}>
                {active && night && <span aria-hidden="true" className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gold" />}
                <span className="grid h-7 w-7 place-items-center">{tab.icon}</span>
                {tab.label}
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

// Lightweight shell placeholder shown the instant a portal page mounts, so the
// chrome appears immediately and auth/data resolve underneath it.
function ShellSkeleton({ night, wide }: { night: boolean; wide: boolean }) {
  const bg = night ? "bg-onyx" : "bg-paper";
  const bar = night ? "bg-white/10" : "bg-ink/10";
  const card = night ? "bg-white/5" : "bg-white";
  const border = night ? "border-white/10" : "border-hairline";
  const Block = ({ className }: { className?: string }) => <div className={cn("animate-pulse rounded-md", bar, className)} />;
  return (
    <div className={cn("min-h-screen", bg, wide ? "" : "pb-24 lg:pb-0")}>
      {/* Desktop sidebar placeholder (non-wide portals) */}
      {!wide && (
        <aside className={cn("fixed inset-y-0 left-0 hidden w-64 flex-col gap-3 border-r px-4 py-5 lg:flex", border)}>
          <Block className="h-9 w-40" />
          <div className="mt-4 flex flex-col gap-2">{[0, 1, 2, 3, 4].map((i) => <Block key={i} className="h-9 w-full rounded-xl" />)}</div>
        </aside>
      )}
      <header className={cn("border-b px-4 py-3", border, night ? "bg-onyx/85" : "bg-paper/90", wide ? "" : "lg:hidden")}>
        <div className={cn("mx-auto flex items-center justify-between", wide ? "max-w-6xl" : "max-w-md")}>
          <Block className="h-6 w-40" />
          <Block className="h-8 w-8 rounded-full" />
        </div>
      </header>
      <main className={cn("mx-auto px-4 py-6", wide ? "max-w-6xl" : "max-w-md lg:max-w-5xl lg:pl-72")}>
        <Block className="h-5 w-32" />
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("rounded-2xl border p-4", border, card)}>
              <Block className="h-3 w-16" />
              <Block className="mt-3 h-6 w-20" />
            </div>
          ))}
        </div>
        <div className={cn("mt-4 rounded-2xl border p-4", border, card)}><Block className="h-24 w-full" /></div>
      </main>
      {!wide && (
        <nav className={cn("fixed inset-x-0 bottom-0 border-t px-4 py-3 lg:hidden", border, night ? "bg-onyx-1/95" : "bg-white/95")}>
          <div className="mx-auto flex max-w-md items-center justify-around">
            {[0, 1, 2, 3, 4].map((i) => <Block key={i} className="h-7 w-7 rounded-lg" />)}
          </div>
        </nav>
      )}
    </div>
  );
}
