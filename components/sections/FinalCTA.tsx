import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { whatsappLink } from "@/lib/data";

interface FinalCTAProps {
  headline?: string;
  text?: string;
}

export function FinalCTA({
  headline = "Begin your music journey with structure.",
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
          <div className="mt-8 flex justify-center">
            <Button href={whatsappLink()} external variant="light" size="lg">
              Message Musicphonetics on WhatsApp
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
