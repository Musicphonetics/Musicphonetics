import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";

// "What's next" - the South Delhi centre and the events (open mics + showcases)
// we run every few months to push students onto a stage.
export function CentreEvents() {
  return (
    <section id="whats-next" className="bg-ink py-16 text-paper sm:py-24">
      <div className="container-mp">
        <Reveal>
          <p className="eyebrow text-gold">What&apos;s next for you</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.9rem]">
            A real centre. Real stages. Every few months.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/75">
            Music shouldn&apos;t stay inside a room. We give every student a place to
            learn and a stage to perform on.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {/* South Delhi centre */}
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-white/12 bg-white/[0.03] p-7 sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-paper">The South Delhi centre</h3>
              <p className="mt-3 text-base leading-relaxed text-paper/75">
                A real place to learn, jam and perform, in the heart of South Delhi.
                Prefer to stay home? We also teach at your home and online, right
                across Delhi NCR.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Learn at the centre, at home, or online", "Proper instruments and a room built for music", "Easy to reach across South Delhi"].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-paper/80">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <WhatsAppCTA label="Ask about the centre" message={WA_MSG.events} variant="outline" />
              </div>
            </div>
          </Reveal>

          {/* Events every 3 months */}
          <Reveal delay={90}>
            <div className="flex h-full flex-col rounded-3xl border border-gold/40 bg-gradient-to-b from-gold/[0.10] to-white/[0.02] p-7 sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-ink">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3ZM6 11a6 6 0 0 0 12 0M12 18v3M8 21h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div className="mt-5 flex items-center gap-2">
                <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">Every 3 months</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold text-paper">Open Mic &amp; Chai + student showcases</h3>
              <p className="mt-3 text-base leading-relaxed text-paper/80">
                Every few months we put our students on a real stage, open mics,
                recitals and showcases, so all that practice turns into confidence
                and a performance families remember.
              </p>

              {/* Real event photos */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { src: "/images/moments/02-openmic.webp", alt: "A student performing at Open Mic and Chai" },
                  { src: "/images/moments/03-stage-guitar.webp", alt: "A student performing guitar on a large stage" },
                ].map((p) => (
                  <div key={p.src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <img src={p.src} alt={p.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-sm text-paper/60">
            Every student is invited. Watch a few clips from our stages just below.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
