import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ECOSYSTEM, PARTNER_SLOTS, type EcoCard } from "@/lib/teach-config";
import { INSTAGRAM_URL } from "@/lib/data";

function EcoIcon({ name }: { name: EcoCard["icon"] }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  const s = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "network":
      return <svg {...common}><circle cx="12" cy="6" r="2.5" {...s} /><circle cx="5" cy="18" r="2.5" {...s} /><circle cx="19" cy="18" r="2.5" {...s} /><path d="M12 8.5v3m0 0L6.5 16m5.5-4.5L17.5 16" {...s} /></svg>;
    case "leads":
      return <svg {...common}><path d="M3 12h6l2-3 2 6 2-3h6" {...s} /></svg>;
    case "space":
      return <svg {...common}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5z" {...s} /><path d="M9 21v-6h6v6" {...s} /></svg>;
    case "feature":
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="4" {...s} /><circle cx="12" cy="12" r="3.2" {...s} /><circle cx="16.5" cy="7.5" r="1" fill="currentColor" /></svg>;
    case "gear":
      return <svg {...common}><path d="M8 18V9l10-3v9" {...s} /><circle cx="6" cy="18" r="2" {...s} /><circle cx="16" cy="15" r="2" {...s} /></svg>;
    case "stage":
      return <svg {...common}><path d="m12 3 2.4 5 5.6.5-4.2 3.7 1.3 5.5L12 20l-5.1 2.7 1.3-5.5L4 13.5 9.6 13 12 3z" {...s} /></svg>;
    case "grow":
      return <svg {...common}><path d="M12 20v-8m0 0c0-3 2-5 5-5 0 3-2 5-5 5zm0 0c0-2.5-1.7-4.2-4-4.2 0 2.5 1.7 4.2 4 4.2z" {...s} /></svg>;
    case "globe":
      return <svg {...common}><circle cx="12" cy="12" r="8.5" {...s} /><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" {...s} /></svg>;
  }
}

export function Ecosystem() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Why teach with us"
        title={<>A solo tutor builds everything alone. Here, it&apos;s already built.</>}
        intro="Finding students, chasing payments, having no brand and no backup - that's the solo grind. Step into a decade-old ecosystem instead, and just teach."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ECOSYSTEM.map((c, i) => (
          <Reveal key={c.title} delay={(i % 4) * 70}>
            <div className="flex h-full flex-col rounded-2xl border border-hairline bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-card-hover">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-[#7A5E0F]">
                <EcoIcon name={c.icon} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Partner + social proof slots - degrade gracefully when logos aren't in yet */}
      <Reveal delay={120}>
        <div className="mt-12 rounded-3xl border border-hairline bg-white/60 p-6 sm:p-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">
            Discovery &amp; space partners
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {PARTNER_SLOTS.map((p) => (
              // PARTNER_LOGO slot - replace this text chip with a monochrome logo
              // (greyscale-to-colour on hover) once the asset is supplied.
              <div key={p.name} className="text-center">
                <span className="font-display text-lg font-semibold text-ink/70">{p.name}</span>
                <span className="mt-0.5 block text-[11px] uppercase tracking-wider text-ink/70">{p.note}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-ink/70">
            Follow the faculty on{" "}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#7A5E0F] underline underline-offset-2">
              Instagram
            </a>{" "}
            - YouTube, WhatsApp channel and website features roll out to every teacher.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
