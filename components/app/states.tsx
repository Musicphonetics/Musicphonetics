import Link from "next/link";

// Shared presentational pieces for the /app shell: icon set, loading / error /
// empty / "sign in" panels, and the honest Phase-1 module-status page used by
// every not-yet-migrated screen. No fake data, no dead buttons.

const PATHS: Record<string, string> = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  users: "M9 11a3 3 0 100-6 3 3 0 000 6zm7 0a3 3 0 100-6M3 20a6 6 0 0112 0m2 0a6 6 0 00-3-5.2",
  book: "M5 4h12a1 1 0 011 1v15H7a2 2 0 00-2 2zM5 4v14M9 8h6M9 11h6",
  calendar: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z",
  inbox: "M4 13h4l1.5 3h5L16 13h4M4 13l2-7h12l2 7v6a1 1 0 01-1 1H5a1 1 0 01-1-1z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0",
  children: "M12 20s-7-4.2-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.8-7 9-7 9z",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
  search: "M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  external: "M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5",
  logout: "M15 17l5-5-5-5M20 12H9M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4",
  lock: "M6 11V8a6 6 0 1112 0v3M5 11h14v10H5z",
  info: "M12 8h.01M11 12h1v5h1M12 21a9 9 0 100-18 9 9 0 000 18z",
  chevron: "M9 6l6 6-6 6",
  build: "M14 6l4 4M3 21l4-1L20 7a2 2 0 00-3-3L4 17z",
};

export function Icon({ n, s = 20, c = "" }: { n: string; s?: number; c?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={c}>
      <path d={PATHS[n]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Loading() {
  return (
    <div className="grid place-items-center py-24" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-gold" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-md place-items-center py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-ink/5 text-ink/50"><Icon n={icon} s={24} /></span>
      <h2 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-2 text-[0.92rem] leading-relaxed text-ink/60">{children}</div>
    </div>
  );
}

export function NotConfigured() {
  return <Panel icon="info" title="App preview isn't configured here">This environment has no connection configured. On the live site this screen loads your account.</Panel>;
}

export function ErrorState({ message }: { message?: string }) {
  return <Panel icon="info" title="Something went wrong">{message || "We couldn't load this right now. Check your connection and try again."}</Panel>;
}

export function SignInPanel({ loginHref, label }: { loginHref: string; label: string }) {
  return (
    <Panel icon="lock" title="Sign in to continue">
      <p>This workspace is private. Sign in to your {label} account to see your information.</p>
      <div className="mt-5 flex flex-col items-center gap-2">
        <Link href={loginHref} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:brightness-110">Sign in <Icon n="arrow" s={16} /></Link>
        <Link href="/app" className="text-[0.8rem] font-medium text-ink/50 hover:text-ink">Choose a different account type</Link>
      </div>
    </Panel>
  );
}

export function WrongWorkspace({ goHref }: { goHref: string }) {
  return (
    <Panel icon="lock" title="This isn't your workspace">
      <p>Your account doesn&apos;t have access here.</p>
      <div className="mt-5"><Link href={goHref} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:brightness-110">Go to your home <Icon n="arrow" s={16} /></Link></div>
    </Panel>
  );
}

// Honest Phase-1 page: explains what the screen will do and links to the live
// classic portal where that capability works today. Never pretends to be done.
export function ModulePage({
  title, intent, points, classicHref, classicLabel,
}: {
  title: string; intent: string; points: string[]; classicHref: string; classicLabel: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-[1.7rem] font-semibold text-ink">{title}</h1>
        <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[#7A5E0F]">In development</span>
      </div>
      <p className="mt-2 text-[0.98rem] leading-relaxed text-ink/65">{intent}</p>

      <div className="mt-5 rounded-2xl border border-hairline bg-white p-5 shadow-card">
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.15em] text-ink/45">This screen will include</p>
        <ul className="mt-3 grid gap-2">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-[0.9rem] text-ink/75">
              <Icon n="build" s={16} c="mt-0.5 shrink-0 text-gold" />{p}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-hairline bg-mist/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.9rem] font-semibold text-ink">Working today in the classic portal</p>
          <p className="text-[0.82rem] text-ink/55">These features are live right now — this new app is being built alongside them.</p>
        </div>
        <Link href={classicHref} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:brightness-110">
          Open {classicLabel} <Icon n="external" s={15} />
        </Link>
      </div>
    </div>
  );
}
