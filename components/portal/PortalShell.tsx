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
// mobile bottom tab bar (teacher) or a wide top-nav command layout (owner).
export function PortalShell({
  children, role, tabs, title, variant = "mobile",
}: { children: ReactNode; role: "teacher" | "owner"; tabs: Tab[]; title?: string; variant?: "mobile" | "wide" }) {
  const { loading, configured, userId, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const loginPath = role === "owner" ? "/owner/login" : "/teacher/login";

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
  if (loading) return <div className="min-h-screen bg-paper"><Loading /></div>;
  if (!userId) return <div className="min-h-screen bg-paper"><Loading label="Redirecting…" /></div>;

  if (profile && profile.role !== role) {
    return (
      <Centered>
        <h1 className="font-display text-xl font-semibold text-ink">Wrong area</h1>
        <p className="mt-2 max-w-sm text-sm text-ink/65">
          This account is a <b>{profile.role}</b>. Use the {profile.role} portal
          {role === "teacher" ? " — the owner dashboard is at /owner/dashboard." : "."}
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
