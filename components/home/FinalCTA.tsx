import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";

// One action, then the footer.
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-charcoal-2 py-16 text-ivory sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-deep-gold/10 blur-[130px]" />
      <div className="container-mp relative">
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <span aria-hidden="true" className="mx-auto block h-px w-10 bg-gold" />
            <h2 className="mt-5 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.08]">
              Start with one message.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ivory/75">
              Tell us the student&apos;s age, instrument and goal - we&apos;ll match the right teacher.
            </p>
            <div className="mt-8 flex justify-center">
              <WhatsAppCTA label="Enquire on WhatsApp" message={WA_MSG.final} />
            </div>
            <p className="mt-4 text-sm text-ivory/55">We reply immediately.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
