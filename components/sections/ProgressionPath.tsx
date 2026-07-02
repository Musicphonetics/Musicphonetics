import { Reveal } from "@/components/ui/Reveal";

// M3.2 — an elegant stepped progression. Labelled as typical (pace varies).
const STEPS = ["Foundation", "Developing", "Intermediate", "Advanced", "Graded exams"];

export function ProgressionPath() {
  return (
    <div>
      <ol className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
        {STEPS.map((step, i) => (
          <Reveal as="li" key={step} delay={i * 70} className="relative flex-1">
            <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
              {/* Node */}
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold bg-paper font-display text-sm font-semibold text-[#7A5E0F]">
                {i + 1}
              </span>
              {/* Connector (between nodes) */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden h-px flex-1 bg-gradient-to-r from-gold/60 to-gold/20 sm:absolute sm:left-[calc(50%+20px)] sm:right-[calc(-50%+20px)] sm:top-5 sm:block"
                />
              )}
              <span className="text-sm font-semibold text-ink sm:mt-3">{step}</span>
            </div>
          </Reveal>
        ))}
      </ol>
      <p className="mt-6 text-xs text-ink/70">
        A typical progression — individual pace varies by student.
      </p>
    </div>
  );
}
