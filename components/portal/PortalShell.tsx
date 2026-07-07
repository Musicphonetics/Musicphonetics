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

// Wraps every portal screen: enforces auth + role, renders the sticky bottom
// tab bar, and shows config/loading/denied states. `role` is the role this
// area requires.
export function PortalShell({
  children, role, tabs, title,
}: { children: ReactNode; role: "teacher" | "owner"; tabs: Tab[]; title?: string }) {
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
          Supabase environment variables are missing. Set{" "}
          <code className="rounded bg-mist px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-mist px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Cloudflare Pages.
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
          This account is a <b>{profile.role}</b>. Use the {profile.role} portal.
        </p>
        <button onClick={() => signOut()} className="mt-5 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">Sign out</button>
      </Centered>
    );
  }
  if (profile && profile.status === "blacklisted") {
    return (
      <Centered>
        <h1 className="font-display text-xl font-semibold text-ink">Account paused</h1>
        <p className="mt-2 max-w-sm text-sm text-ink/65">Your account is currently inactive. Please contact the Musicphonetics office.</p>
        <button onClick={() => signOut()} className="mt-5 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">Sign out</button>
      </Centered>
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

      {/* Sticky bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link key={t.href} href={t.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-[#7A5E0F]" : "text-ink/55"
                )}>
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
  return <div className="grid min-h-screen place-items-center bg-paper px-6 text-center">{<div>{children}</div>}</div>;
}
