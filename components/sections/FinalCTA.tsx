import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { whatsappLink } from "@/lib/data";

interface FinalCTAProps {
  headline?: string;
  text?: string;
}

export function FinalCTA({
  headline = "Start with one trial. Continue with a clear path.",
  text = "Tell us what you are looking for. We will guide you toward the right path.",
}: FinalCTAProps) {
  return (
    <Section background="ink" spacing="lg">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold leading-tight text-paper sm:text-4xl">
            {headline}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-paper/75">
            {text}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Magnetic>
              <Button href="/start" variant="light" size="lg">
                Book a Trial
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                href={whatsappLink()}
                external
                variant="secondary"
                size="lg"
                className="border-white/25 text-paper hover:border-white"
              >
                Enquire on WhatsApp
              </Button>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
