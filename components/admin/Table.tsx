import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Scrollable, card-wrapped table shell used by all admin tables. */
export function TableShell({
  children,
  toolbar,
}: {
  children: ReactNode;
  toolbar?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-white shadow-card">
      {toolbar && (
        <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-4 py-3 sm:px-5">
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

export function Th({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink/50",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("whitespace-nowrap px-4 py-3 text-ink/80", className)}>
      {children}
    </td>
  );
}

type PillTone = "green" | "gold" | "red" | "neutral" | "blue";

const pillTones: Record<PillTone, string> = {
  green: "bg-feature-green/10 text-feature-green",
  gold: "bg-gold/15 text-deep-gold",
  red: "bg-red-100 text-red-700",
  neutral: "bg-ink/5 text-ink/60",
  blue: "bg-blue-100 text-blue-700",
};

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: PillTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        pillTones[tone]
      )}
    >
      {children}
    </span>
  );
}

/** Map common status strings to a pill tone. */
export function toneForStatus(status: string): PillTone {
  const s = status.toLowerCase();
  if (["paid", "completed", "active", "verified", "converted"].includes(s))
    return "green";
  if (["partial", "renewal due", "in review", "recommended", "scheduled"].includes(s))
    return "gold";
  if (["overdue", "lost", "cancelled", "no-show", "inactive"].includes(s))
    return "red";
  if (["qualified", "contacted"].includes(s)) return "blue";
  return "neutral";
}
