import Link from "next/link";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";

export function FunnelHero() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-20%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-deep-gold/12 blur-[130px]" />
      <div className="container-mp relative flex min-h-[88vh] flex-col justify-center py-20 sm:min-h-[80vh]">
        <Link href="/reviews" className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs text-paper/80 transition-colors hover:border-gold/50">
          <span className="text-gold">★★★★★</span>
          Trusted by parents &amp; students across Delhi NCR
        </Link>

        <h1 className="max-w-3xl font-display text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl">
          Music classes that don&apos;t feel <span className="text-gold">random.</span>
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/80">
          Structured music learning for children, beginners &amp; serious learners —
          Guitar, Piano/Keyboard &amp; Vocals. Delhi NCR + Online.
        </p>

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-paper/70">
          <span>Structured classes</span><Dot /><span>Teacher matching</span><Dot /><span>Progress tracking</span>
        </p>

        <div className="mt-9">
          <WhatsAppCTA label="Enquire on WhatsApp" message={WA_MSG.hero} />
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-gold" />;
}
