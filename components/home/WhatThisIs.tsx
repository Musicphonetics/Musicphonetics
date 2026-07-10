import { Reveal } from "@/components/ui/Reveal";

// The "define it" section - answers the first-five-seconds question, confidently.
export function WhatThisIs() {
  return (
    <section className="bg-paper py-16 text-ink sm:py-28">
      <div className="container-mp">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-gold" />
              <span className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F]">What Musicphonetics is</span>
            </div>
            <p className="mt-6 font-display text-[clamp(1.5rem,3.2vw,2.1rem)] font-medium leading-[1.28] text-ink">
              Not a random tutor you found online. Musicphonetics is a structured,
              one-to-one music school - a teacher matched to the student, a real
              curriculum, progress you can see after every class, and a stage to perform
              on. <span className="text-[#7A5E0F]">Run like an institution, taught like a mentor.</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
