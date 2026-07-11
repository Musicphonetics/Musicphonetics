import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { HOME_PACKAGES } from "@/lib/home-config";
import { cn } from "@/lib/utils";

const MAP: Record<string, { slug: string; payKey?: string }> = {
  main: { slug: "main", payKey: "main" },
  foundation: { slug: "foundation", payKey: "foundation" },
  directors: { slug: "directors-circle" },
};
const ORDER = ["foundation", "main", "directors"];

// Clear plans, clear fees. Swipe on mobile, an even 3-up grid on desktop with
// the flagship raised in the middle.
export function FunnelPackages() {
  const cards = ORDER.map((k) => HOME_PACKAGES.find((p) => p.key === k)!).filter(Boolean);
  return (
    <section id="programmes" className="scroll-mt-20 bg-gradient-to-b from-white to-paper py-14 sm:py-20">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Programmes & fees"
          title="Clear plans. Clear fees."
          sub="No hidden pricing - pick the plan that fits, apply and pay online, or ask us anything on WhatsApp first."
          center
        />

        <div role="region" aria-label="Programmes and fees" tabIndex={0} className="mt-10 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:mt-12 sm:grid sm:grid-cols-3 sm:items-center sm:gap-5 sm:overflow-visible sm:pb-0">
          {cards.map((p) => <Card key={p.key} p={p} />)}
        </div>
      </div>
    </section>
  );
}

function Card({ p }: { p: (typeof HOME_PACKAGES)[number] }) {
  const m = MAP[p.key];
  const flagship = !!p.featured;
  return (
    <div className={cn(
      "flex w-[85vw] max-w-[340px] shrink-0 snap-center flex-col rounded-3xl border p-6 sm:w-auto sm:max-w-none sm:p-7",
      flagship
        ? "border-gold/60 bg-white shadow-[0_20px_60px_-24px_rgba(201,162,39,0.45)] ring-1 ring-gold/30 sm:scale-[1.04]"
        : "border-hairline bg-white shadow-card",
    )}>
      {p.badge && (
        <span className={cn("mb-3 w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
          flagship ? "bg-gold text-ink" : "border border-gold/40 text-[#7A5E0F]")}>{p.badge}</span>
      )}
      <h3 className="font-display text-xl font-semibold leading-tight text-ink">{p.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{p.tagline}</p>

      <div className="mt-4 flex items-end gap-1">
        <span className="font-display text-3xl font-semibold text-ink">{p.price ?? "By request"}</span>
        {p.price && <span className="pb-1 text-sm text-ink/60">/ month</span>}
      </div>
      {p.cadence && <p className="mt-0.5 text-xs text-ink/60">{p.cadence}</p>}

      <ul className="mt-5 flex-1 space-y-2.5">
        {p.bullets.slice(0, 4).map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-ink/75">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-[#7A5E0F]">
              <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2.5">
        {m.payKey && p.payAmount ? (
          <Link href={`/pay?plan=${m.payKey}&amt=${p.payAmount}`}
            className="flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-full bg-gold px-5 text-sm font-semibold text-ink transition-all hover:bg-deep-gold active:scale-[0.98]">
            Apply &amp; pay →
          </Link>
        ) : (
          <WhatsAppCTA label={p.ctaLabel} message={p.ctaMsg} size="md" fullWidth />
        )}
        <Link href={`/programmes/${m.slug}`}
          className="flex min-h-[44px] w-full items-center justify-center rounded-full border border-ink/20 px-5 text-sm font-semibold text-ink hover:border-ink">
          See full details
        </Link>
      </div>
    </div>
  );
}
