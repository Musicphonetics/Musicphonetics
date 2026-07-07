import { Reveal } from "@/components/ui/Reveal";
import { Stave } from "@/components/ui/Stave";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";

export function FounderMission() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-paper sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-deep-gold/10 blur-[130px]" />
      <div className="container-mp relative">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center"><Stave className="w-16 opacity-70" /></div>
          <Reveal>
            <h2 className="mt-6 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Music, taught with a clear path.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-paper/75 sm:text-lg">
              Musicphonetics was built to solve one problem: music classes often become
              random. Students learn songs, but not always structure, confidence, rhythm,
              theory or long-term direction. Our goal is to give every student a clear path -
              from first notes to confident performance.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-9 flex justify-center">
              <WhatsAppCTA label="Start Your Musicphonetics Journey" message={WA_MSG.final} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
