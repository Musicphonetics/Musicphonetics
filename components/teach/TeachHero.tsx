import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { Stave } from "@/components/ui/Stave";
import { whatsappLink } from "@/lib/data";
import { TEACH_WHATSAPP } from "@/lib/teach-econ";

function Stat({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-gold sm:text-3xl">{children}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-paper/55">{label}</div>
    </div>
  );
}

export function TeachHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ink via-ink to-feature-green/60 text-paper">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-gold/10 blur-3xl" />
      <Stave className="pointer-events-none absolute bottom-8 left-1/2 w-[280px] -translate-x-1/2 opacity-20" />

      <div className="container-mp relative py-20 sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-gold" /></span>
          Limited intake · onboarding 2 faculty this cycle
        </span>

        <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
          You teach. <span className="block italic text-gold">We handle everything else.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/75">
          Join a faculty, not a marketplace. We bring the students, payments,
          scheduling, and brand — you bring the music. A 70% share, paid on time.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href={TEACH_WHATSAPP} external size="lg" variant="light">Apply on WhatsApp</Button>
          <Button href={whatsappLink("Hi Musicphonetics, I have a question about teaching with you.")} external size="lg" variant="secondary" className="border-white/25 text-paper hover:border-white">Message us</Button>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          <Stat label="Students taught"><CountUp value={1100} suffix="+" /></Stat>
          <Stat label="Years teaching"><CountUp value={10} suffix=" yrs" /></Stat>
          <Stat label="Your share"><CountUp value={70} suffix="%" /></Stat>
          <Stat label="Per class">₹840–₹1,050</Stat>
        </dl>
      </div>
    </section>
  );
}
