import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Stave } from "@/components/ui/Stave";
import { MotionReveal } from "./MotionReveal";

export function FounderWord() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-28">
      <AuroraBackground />
      <div className="container-mp relative">
        <MotionReveal>
          <div className="mx-auto max-w-3xl text-center">
            <Stave className="mx-auto" />
            {/* TODO(content): replace with the founder's exact "You were chosen…" quote. */}
            <blockquote className="mt-7 font-display text-2xl font-medium italic leading-relaxed text-paper sm:text-3xl sm:leading-snug">
              “You weren&apos;t hired to fill a slot. You were chosen to carry a
              standard. Teach well, and we&apos;ll make sure the rest of it -
              the students, the pay, the platform - is never your problem again.”
            </blockquote>
            <figcaption className="mt-6 text-sm text-paper/60">
              Abhishek Kumar · Founder, Musicphonetics
            </figcaption>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
