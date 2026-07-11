import { Reveal } from "@/components/ui/Reveal";

const ITEMS = [
  {
    title: "Structured Path",
    sub: "Level-wise learning built for results",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 21V4M6 4l9 2.5-3 3 3 3L6 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    title: "Progress Tracking",
    sub: "Real-time updates for every learner",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M4 8l6-4 6 5 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    title: "Monthly Reports",
    sub: "Detailed reports for parents",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h7l5 5v13H7V3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M14 3v5h5M10 13h6M10 16.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
];

// The three "why us" pillars, as a compact dark card with hairline dividers.
export function NightTrustStrip() {
  return (
    <section className="bg-paper pb-2 pt-2">
      <div className="container-mp">
        <Reveal>
          <div className="grid grid-cols-3 divide-x divide-hairline rounded-2xl border border-hairline bg-white p-4 shadow-card sm:p-6">
            {ITEMS.map((it) => (
              <div key={it.title} className="flex flex-col items-center px-2 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left">
                <span className="text-[#7A5E0F]">{it.icon}</span>
                <span className="mt-2 sm:mt-0">
                  <span className="block font-display text-[0.9rem] font-semibold leading-tight text-ink sm:text-base">{it.title}</span>
                  <span className="mt-1 block text-[0.72rem] leading-snug text-ink/60 sm:text-[0.82rem]">{it.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
