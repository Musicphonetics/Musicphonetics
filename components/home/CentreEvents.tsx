import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";

// The South Delhi centre and the events (open mics + showcases) we run every few
// months to put students onto a stage.
export function CentreEvents() {
  return (
    <section id="whats-next" className="bg-charcoal-2 py-24 text-ivory md:py-32">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Where it happens"
          title="A real centre. Real stages. Every few months."
          sub="Music shouldn't stay inside a room. We give every student a place to learn and a stage to perform on."
          invert
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {/* South Delhi centre */}
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-charcoal p-7 sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>
              </span>
              <h3 className="mt-5 font-display text-2xl font-medium text-ivory">The South Delhi centre</h3>
              <p className="mt-3 text-base leading-relaxed text-ivory/70">
                A real place to learn, jam and perform, in the heart of South Delhi.
                Prefer to stay home? We also teach at your home and online, right
                across Delhi NCR.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Learn at the centre, at home, or online", "Proper instruments and a room built for music", "Easy to reach across South Delhi"].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-ivory/75">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <WhatsAppCTA label="Ask about the centre" message={WA_MSG.events} variant="outline" className="!border-ivory/25 !text-ivory hover:!border-gold" />
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
              <h3 className="mt-4 font-display text-2xl font-medium text-ivory">Open Mic &amp; Chai + student showcases</h3>
              <p className="mt-3 text-base leading-relaxed text-ivory/75">
                Every few months we put our students on a real stage, open mics,
                recitals and showcases, so all that practice turns into confidence
                and a performance families remember.
              </p>

              {/* Real event photos - a full house at Open Mic + Chai, then performers */}
              <div className="mt-5 space-y-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                  <img src="/images/moments/openmic-audience.webp" alt="A full house at a Musicphonetics Open Mic and Chai evening" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">Open Mic + Chai · a full house</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { src: "/images/classes/trio.webp", alt: "Students making music together in class", pos: "50% 30%" },
                    { src: "/images/hero/slide-1.webp", alt: "Musicphonetics students celebrated together", pos: "50% 32%" },
                  ].map((p) => (
                    <div key={p.src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      <img src={p.src} alt={p.alt} loading="lazy" decoding="async" style={{ objectPosition: p.pos }} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-8 text-center">
            <p className="text-sm text-ivory/60">Every student is invited to the stage. This is where practice becomes confidence.</p>
            <a href="/open-mic"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-charcoal transition hover:brightness-105">
              See Open Mic &amp; Chai
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
