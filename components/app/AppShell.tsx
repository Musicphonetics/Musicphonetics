"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, signOut } from "@/lib/supabase/auth";
import { NAV, CLASSIC, ROLE_LABEL, type AppRole } from "./nav";
import { Icon, Loading, NotConfigured, ErrorState, SignInPanel, WrongWorkspace } from "./states";

// AppShell — the persistent authenticated chrome for the new /app/* application.
// Top bar + account menu, desktop nav rail, mobile bottom nav. Role-protected:
// reuses the existing Supabase auth (useAuth) client-side; real authorisation is
// still enforced by the server (Cloudflare Functions) and Supabase RLS. The nav
// is non-sensitive; private data only renders in the gated content area.

export function AppShell({ role, children }: { role: AppRole; children: React.ReactNode }) {
  const { loading, configured, userId, profile, error } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const nav = NAV[role];
  const classic = CLASSIC[role];

  // Close the account menu on route change.
  useEffect(() => { setMenu(false); }, [pathname]);

  const authedCorrect = configured && !!userId && profile?.role === role;

  let content: React.ReactNode;
  if (loading) content = <Loading />;
  else if (!configured) content = <NotConfigured />;
  else if (error) content = <ErrorState message={error} />;
  else if (!userId) content = <SignInPanel loginHref={classic.login} label={ROLE_LABEL[role].toLowerCase()} />;
  else if (profile && profile.role !== role) {
    const goHref = profile.role === "teacher" ? "/app/teacher/home" : profile.role === "parent" ? "/app/parent/home" : "/app";
    content = <WrongWorkspace goHref={goHref} />;
  } else content = children;

  async function handleSignOut() {
    try { await signOut(); } catch { /* ignore */ }
    router.replace("/app");
  }

  return (
    <div data-app-shell={role} className="min-h-[100svh] bg-paper font-body text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-hairline bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link href="/app" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-xs font-bold text-gold">M</span>
            <span className="hidden font-display text-[0.98rem] font-semibold sm:block">Musicphonetics</span>
          </Link>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-[#7A5E0F]">App preview · {ROLE_LABEL[role]}</span>

          <div className="relative ml-auto">
            {authedCorrect ? (
              <>
                <button onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}
                  className="flex items-center gap-2 rounded-full border border-hairline bg-white py-1 pl-1 pr-2.5 text-sm transition hover:bg-mist/60">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/15 text-[0.72rem] font-bold text-[#7A5E0F]">
                    {(profile?.full_name || profile?.email || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[9rem] truncate font-medium sm:block">{profile?.full_name || profile?.email}</span>
                  <Icon n="chevron" s={14} c="rotate-90 text-ink/40" />
                </button>
                {menu && (
                  <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-hairline bg-white shadow-card-hover">
                    <div className="border-b border-hairline px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{profile?.full_name || "Your account"}</p>
                      <p className="truncate text-[0.72rem] text-ink/50">{profile?.email}</p>
                    </div>
                    <Link href={classic.portal} role="menuitem" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/80 hover:bg-mist/60">
                      <Icon n="external" s={16} c="text-ink/45" /> Open {classic.label}
                    </Link>
                    <button onClick={handleSignOut} role="menuitem" className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink/80 hover:bg-mist/60">
                      <Icon n="logout" s={16} c="text-ink/45" /> Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href={classic.login} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:brightness-110">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl">
        {/* Desktop nav rail */}
        <nav data-testid="app-rail" aria-label={`${ROLE_LABEL[role]} navigation`} className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 flex-col gap-1 border-r border-hairline p-3 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-ink text-paper" : "text-ink/65 hover:bg-mist/70 hover:text-ink"}`}
                aria-current={active ? "page" : undefined}>
                <Icon n={item.icon} s={19} /> {item.label}
              </Link>
            );
          })}
          <div className="mt-auto rounded-xl border border-hairline bg-white p-3">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-ink/45">New app · preview</p>
            <p className="mt-1 text-[0.74rem] leading-relaxed text-ink/55">Being built alongside your live {classic.label.toLowerCase()}.</p>
          </div>
        </nav>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">{content}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav data-testid="app-bottomnav" aria-label={`${ROLE_LABEL[role]} navigation (mobile)`} className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-hairline bg-paper/95 px-1 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1.5 backdrop-blur lg:hidden">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-1 ${active ? "text-ink" : "text-ink/45"}`}>
              <Icon n={item.icon} s={21} />
              <span className="text-[0.58rem] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
