import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

// The depth (method, faculty rigour, standards) compressed to one scannable
// line - each links to its full page for the rare digger + SEO.
const CHIPS = [
  { label: "Structured method", href: "/method" },
  { label: "Verified faculty (7-stage)", href: "/teachers" },
  { label: "Police-verified & safe", href: "/standards/child-protection" },
  { label: "23 written standards", href: "/standards" },
  { label: "Trinity-recognised pathway", href: "/curriculum" },
];

export function ReassuranceChips() {
  return (
    <Section background="paper" spacing="md">
      <Reveal>
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="eyebrow">Backed by a real system</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {CHIPS.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink/80 transition-colors hover:border-gold/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {c.label}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
