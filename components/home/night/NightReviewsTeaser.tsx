import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

// A warm, compact social-proof band - the reference closes the first screen with
// this and it sets up the full reviews section that follows.
export function NightReviewsTeaser() {
  return (
    <section className="bg-onyx pb-4">
      <div className="container-mp">
        <Reveal>
          <Link
            href="/reviews"
            className="flex items-center gap-4 rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/[0.07] to-transparent p-4 transition-colors hover:border-gold/40 sm:p-5"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/[0.08] text-gold sm:h-14 sm:w-14">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7-4.35-9.3-8.5C1.2 9.2 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.5 0 4.8 3.7 3.3 6.5C19 16.15 12 20.5 12 20.5Z" /></svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[1.02rem] font-semibold leading-snug text-paper sm:text-lg">
                Loved by 1000+ families across Delhi NCR
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-paper/70">
                <span aria-hidden="true" className="text-gold">★★★★★</span>
                <span className="font-semibold text-paper">4.9/5</span> Parent Satisfaction
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-gold"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
