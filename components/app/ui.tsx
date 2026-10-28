"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

// ============================================================================
// Musicphonetics /app design system — a small, consistent, premium UI kit.
// Brand: charcoal/ink #161B26, gold #C9A227, Fraunces (display) + Hanken (body),
// warm paper surfaces. Every interactive element has a visible focus ring;
// motion is subtle and respects prefers-reduced-motion (handled globally).
// ============================================================================

/* ---------------------------------------------------------------- icons --- */
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
  check: "M5 12.5l4.5 4.5L19 6.5",
  plus: "M12 5v14M5 12h14",
  pencil: "M4 20h4L18 10l-4-4L4 16zM14 6l4 4",
  close: "M6 6l12 12M18 6L6 18",
  build: "M14 6l4 4M3 21l4-1L20 7a2 2 0 00-3-3L4 17z",
  star: "M12 3l2.6 5.5L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.4-.8z",
  clock: "M12 8v4l3 2M12 21a9 9 0 100-18 9 9 0 000 18z",
  target: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8z",
  music: "M9 18V5l10-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z",
  spark: "M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4z",
  warning: "M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
};
export function Icon({ n, s = 20, c = "" }: { n: string; s?: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={c}><path d={PATHS[n] ?? PATHS.info} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* --------------------------------------------------------------- buttons --- */
type BtnVariant = "primary" | "accent" | "ghost" | "soft" | "danger";
type BtnSize = "sm" | "md" | "lg";
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";
const BTN_SIZE: Record<BtnSize, string> = { sm: "px-4 py-2 text-[0.82rem]", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" };
const BTN_VARIANT: Record<BtnVariant, string> = {
  primary: "bg-ink text-paper hover:brightness-125 focus-visible:ring-ink",
  accent: "bg-gold text-ink hover:brightness-105 focus-visible:ring-gold",
  ghost: "border border-hairline text-ink hover:bg-mist/60 focus-visible:ring-ink",
  soft: "bg-ink/[0.05] text-ink hover:bg-ink/[0.09] focus-visible:ring-ink",
  danger: "bg-red-600 text-white hover:brightness-110 focus-visible:ring-red-600",
};
export function Button({
  children, onClick, variant = "primary", size = "md", full, disabled, loading, href, type = "button", ariaLabel,
}: {
  children: React.ReactNode; onClick?: () => void; variant?: BtnVariant; size?: BtnSize; full?: boolean;
  disabled?: boolean; loading?: boolean; href?: string; type?: "button" | "submit"; ariaLabel?: string;
}) {
  const cls = `${BTN_BASE} ${BTN_SIZE[size]} ${BTN_VARIANT[variant]} ${full ? "w-full" : ""}`;
  const inner = loading ? <><Spinner s={16} /> {children}</> : children;
  if (href) return <Link href={href} className={cls} aria-label={ariaLabel}>{inner}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled || loading} aria-label={ariaLabel} aria-busy={loading} className={cls}>{inner}</button>;
}

/* ---------------------------------------------------------------- inputs --- */
export const inputCls = "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition placeholder:text-ink/40 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/40";
export function Field({ label, hint, error, htmlFor, children }: { label?: string; hint?: string; error?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block">
      {label && <span className="mb-1.5 block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink/50">{label}</span>}
      {children}
      {error ? <span className="mt-1 block text-[0.76rem] text-red-600">{error}</span>
        : hint ? <span className="mt-1 block text-[0.76rem] text-ink/45">{hint}</span> : null}
    </label>
  );
}

/* ---------------------------------------------------------- surfaces/type -- */
export function Card({ children, className = "", onClick, interactive }: { children: React.ReactNode; className?: string; onClick?: () => void; interactive?: boolean }) {
  return (
    <div onClick={onClick}
      className={`rounded-2xl border border-hairline bg-white shadow-card ${interactive ? "transition hover:border-gold/40 hover:shadow-card-hover" : ""} ${className}`}>
      {children}
    </div>
  );
}
export function PageHeader({ title, subtitle, actions, back }: { title: string; subtitle?: string; actions?: React.ReactNode; back?: React.ReactNode }) {
  return (
    <div className="mb-5">
      {back}
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[clamp(1.5rem,3.4vw,1.9rem)] font-semibold leading-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-[0.9rem] text-ink/55">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-ink/45">{children}</p>;
}
export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "gold" | "green" | "red"; children: React.ReactNode }) {
  const t = {
    neutral: "bg-ink/[0.05] text-ink/60 border-hairline",
    gold: "bg-gold/10 text-[#7A5E0F] border-gold/30",
    green: "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
    red: "bg-red-500/10 text-red-700 border-red-500/20",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${t}`}>{children}</span>;
}
export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-mist px-2.5 py-0.5 text-[0.72rem] font-medium text-ink/70">{children}</span>;
}
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "·";
  return <span className="grid shrink-0 place-items-center rounded-full bg-gold/15 font-display font-semibold text-[#7A5E0F]" style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials}</span>;
}
export function Metric({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <Card className="p-3 text-center">
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-[0.62rem] font-medium uppercase tracking-wide text-ink/45">{label}</p>
      {hint && <p className="mt-0.5 text-[0.62rem] text-ink/40">{hint}</p>}
    </Card>
  );
}

/* ------------------------------------------------------- loading / empty --- */
export function Spinner({ s = 20 }: { s?: number }) {
  return <span className="inline-block animate-spin rounded-full border-2 border-current/25 border-t-current align-[-0.15em]" style={{ width: s, height: s }} aria-hidden="true" />;
}
export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-ink/[0.06] ${className}`} />;
}
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-3.5">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}
export function EmptyState({ icon = "book", title, hint, action }: { icon?: string; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-sm place-items-center py-14 text-center">
      <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-gold/15 to-forest/10 text-[#7A5E0F]">
        <Icon n={icon} s={26} />
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink/55">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ----------------------------------------------- subtle brand motif (svg) -- */
export function BrandWave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="mp-wave" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#E7C86A" stopOpacity="0" /><stop offset="0.5" stopColor="#C9A227" stopOpacity="0.7" /><stop offset="1" stopColor="#E7C86A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 80 Q 75 40 150 80 T 300 80 T 450 80 T 600 80 T 750 80 T 900 80 T 1050 80 T 1200 80" stroke="url(#mp-wave)" strokeWidth="2" fill="none" />
    </svg>
  );
}

/* ---------------------------------------------------------------- toasts --- */
type Toast = { id: number; kind: "success" | "error" | "info"; message: string };
const ToastCtx = createContext<{ push: (kind: Toast["kind"], message: string) => void }>({ push: () => {} });
export function useToast() { return useContext(ToastCtx); }
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-card-hover ${t.kind === "error" ? "bg-red-600 text-white" : t.kind === "success" ? "bg-ink text-paper" : "bg-white text-ink border border-hairline"}`}>
            <Icon n={t.kind === "error" ? "warning" : t.kind === "success" ? "check" : "info"} s={16} /> {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------------------------------------- utilities --- */
export function fmtDate(ymd: string | null): string {
  if (!ymd) return "—";
  const d = new Date(ymd.length <= 10 ? ymd + "T00:00:00" : ymd);
  if (isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
const STATUS_CLS: Record<string, string> = {
  Completed: "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
  Rescheduled: "bg-gold/10 text-[#7A5E0F] border-gold/30",
  Cancelled: "bg-ink/[0.05] text-ink/55 border-hairline",
  "No-Show": "bg-red-500/10 text-red-700 border-red-500/20",
};
export function StatusPill({ status }: { status: string | null }) {
  if (!status) return null;
  return <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${STATUS_CLS[status] ?? "bg-ink/[0.05] text-ink/55 border-hairline"}`}>{status}</span>;
}
