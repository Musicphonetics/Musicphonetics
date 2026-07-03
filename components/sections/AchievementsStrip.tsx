import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const ITEMS = [
  "Chief-judge invitations",
  "Shared stages incl. Shaan",
  "Trinity-recognised",
  "200+ graded-exam successes",
];

export function AchievementsStrip() {
  return (
    <Section background="mist" spacing="sm">
      <Reveal>
        <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 text-center">
          {ITEMS.map((it, i) => (
            <li key={it} className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold">
                  <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.6 5.9 21l1.4-6.8L2.2 9.6l6.9-.7z" fill="currentColor" stroke="none" />
                </svg>
                {it}
              </span>
              {i < ITEMS.length - 1 && <span aria-hidden="true" className="hidden text-gold sm:inline">·</span>}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
