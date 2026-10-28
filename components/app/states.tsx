import Link from "next/link";
import { Icon, Button, Card } from "./ui";

// Shell-level states for the /app application: loading / not-configured / error
// / sign-in / wrong-workspace panels, plus the honest "in development" module
// page used by every not-yet-migrated screen. Built on the shared ui.tsx kit so
// the look stays consistent. No fake data, no dead buttons.

export { Icon };

export function Loading() {
  return (
    <div className="grid place-items-center py-24" role="status" aria-live="polite">
      <span className="inline-block h-9 w-9 animate-spin rounded-full border-[2.5px] border-ink/15 border-t-gold" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function Panel({ icon, tone = "muted", title, children, action }: {
  icon: string; tone?: "muted" | "gold"; title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  const badge = tone === "gold"
    ? "bg-gradient-to-br from-gold/20 to-forest/10 text-[#7A5E0F]"
    : "bg-ink/5 text-ink/45";
  return (
    <div className="mx-auto grid max-w-md place-items-center py-16 text-center">
      <span className={`grid h-14 w-14 place-items-center rounded-2xl ${badge}`}><Icon n={icon} s={26} /></span>
      <h2 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-2 text-[0.92rem] leading-relaxed text-ink/60">{children}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function NotConfigured() {
  return <Panel icon="info" title="App preview isn't configured here">This environment has no connection configured. On the live site this screen loads your account.</Panel>;
}

export function ErrorState({ message }: { message?: string }) {
  return <Panel icon="warning" title="Something went wrong">{message || "We couldn't load this right now. Check your connection and try again."}</Panel>;
}

export function SignInPanel({ loginHref, label }: { loginHref: string; label: string }) {
  return (
    <Panel icon="lock" tone="gold" title="Sign in to continue"
      action={
        <div className="flex flex-col items-center gap-2.5">
          <Button href={loginHref} size="lg">Sign in <Icon n="arrow" s={16} /></Button>
          <Link href="/app" className="text-[0.8rem] font-medium text-ink/50 hover:text-ink">Choose a different account type</Link>
        </div>
      }>
      This workspace is private. Sign in to your {label} account to see your information.
    </Panel>
  );
}

export function WrongWorkspace({ goHref }: { goHref: string }) {
  return (
    <Panel icon="lock" title="This isn't your workspace"
      action={<Button href={goHref} size="lg">Go to your home <Icon n="arrow" s={16} /></Button>}>
      Your account doesn&apos;t have access here.
    </Panel>
  );
}

// Honest "in development" page: explains what the screen will do and links to
// the live classic portal where that capability works today. Never pretends to
// be done, never a dead button.
export function ModulePage({
  title, intent, points, classicHref, classicLabel,
}: {
  title: string; intent: string; points: string[]; classicHref: string; classicLabel: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="font-display text-[clamp(1.5rem,3.4vw,1.9rem)] font-semibold text-ink">{title}</h1>
        <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[#7A5E0F]">In development</span>
      </div>
      <p className="mt-2 text-[0.98rem] leading-relaxed text-ink/65">{intent}</p>

      <Card className="mt-5 p-5">
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.15em] text-ink/45">This screen will include</p>
        <ul className="mt-3 grid gap-2">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-[0.9rem] text-ink/75">
              <Icon n="build" s={16} c="mt-0.5 shrink-0 text-gold" />{p}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-hairline bg-mist/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.9rem] font-semibold text-ink">Working today in the classic portal</p>
          <p className="text-[0.82rem] text-ink/55">These features are live right now — this new app is being built alongside them.</p>
        </div>
        <Button href={classicHref} variant="primary" size="sm">Open {classicLabel} <Icon n="external" s={15} /></Button>
      </div>
    </div>
  );
}
