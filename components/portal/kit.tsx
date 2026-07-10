"use client";

import { cn } from "@/lib/utils";

// Shared mobile-first form primitives for the Teacher OS. Big tap targets,
// native inputs, gold focus ring.
const inputBase =
  "w-full rounded-xl border border-hairline bg-white px-4 py-3.5 text-base text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

export function Label({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <span className="mb-1.5 block text-sm font-semibold text-ink">
      {children}{req && <span className="text-[#7A5E0F]"> *</span>}
    </span>
  );
}

export function Field({
  label, value, onChange, type = "text", req, placeholder, inputMode,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; req?: boolean;
  placeholder?: string; inputMode?: "text" | "tel" | "email" | "numeric" | "decimal";
}) {
  return (
    <label className="block">
      <Label req={req}>{label}</Label>
      <input className={inputBase} type={type} value={value} inputMode={inputMode}
        placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function MoneyField({
  label, value, onChange, req,
}: { label: string; value: string; onChange: (v: string) => void; req?: boolean }) {
  return (
    <label className="block">
      <Label req={req}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-ink/60">₹</span>
        <input className={cn(inputBase, "pl-8")} inputMode="numeric" value={value}
          placeholder="0" onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))} />
      </div>
    </label>
  );
}

export function TextArea({
  label, value, onChange, placeholder, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea className={inputBase} rows={rows} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function Select({
  label, value, onChange, options, req,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; req?: boolean }) {
  return (
    <label className="block">
      <Label req={req}>{label}</Label>
      <select className={inputBase} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o === "-" ? "" : o}>{o}</option>)}
      </select>
    </label>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-hairline bg-white p-5 shadow-card", className)}>{children}</div>;
}

export function StatCard({ label, value, tone = "ink" }: { label: string; value: string; tone?: "ink" | "gold" | "green" | "red" }) {
  const toneClass = { ink: "text-ink", gold: "text-[#7A5E0F]", green: "text-feature-green", red: "text-red-600" }[tone];
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/60">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-semibold", toneClass)}>{value}</p>
    </div>
  );
}

export function Loading({ label = "Loading…", dark }: { label?: string; dark?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-20", dark ? "text-paper/60" : "text-ink/60")}>
      <span className={cn("h-8 w-8 animate-spin rounded-full border-2 border-t-gold", dark ? "border-white/15" : "border-hairline")} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title, hint, dark }: { title: string; hint?: string; dark?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-dashed p-8 text-center", dark ? "border-white/15 bg-onyx-1" : "border-hairline bg-paper")}>
      <p className={cn("font-display text-lg font-semibold", dark ? "text-paper" : "text-ink")}>{title}</p>
      {hint && <p className={cn("mt-1.5 text-sm", dark ? "text-paper/60" : "text-ink/60")}>{hint}</p>}
    </div>
  );
}

export function Toast({ kind, message }: { kind: "success" | "error"; message: string }) {
  return (
    <div className={cn(
      "fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-xl px-4 py-3 text-sm font-medium shadow-card-hover",
      kind === "success" ? "bg-feature-green text-paper" : "bg-red-600 text-white"
    )}>
      {message}
    </div>
  );
}

export function formatMoney(n: number | null | undefined): string {
  return "₹" + (n ?? 0).toLocaleString("en-IN");
}
