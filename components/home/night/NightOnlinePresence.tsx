import { SectionHeader } from "../SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

const PROFILES = [
  { img: "/images/presence/google-business.webp", label: "Google", caption: "4.8★ · Music school · Delhi Cantonment", alt: "Musicphonetics Google Business Profile - 4.8 stars, music school in Delhi" },
  { img: "/images/presence/justdial.webp", label: "JustDial", caption: "4.8★ · 22 ratings · 9 years in business", alt: "Musicphonetics JustDial profile - 4.8 stars, 22 ratings, 9 years in business" },
  { img: "/images/presence/google-reviews.webp", label: "Google reviews", caption: "Real reviews from real families", alt: "Musicphonetics Google review summary showing mostly 5-star reviews" },
];

// Our real, verifiable presence - the actual Google Business and JustDial
// profiles, shown as they are. Proof, not claims.
export function NightOnlinePresence() {
  return (
    <section className="bg-onyx py-14 sm:py-24">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Find us online"
          title="A real, established school - see for yourself."
          sub="Not a pop-up operation. Here are our actual Google and JustDial profiles, exactly as they appear."
          center
          invert
        />

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
          {PROFILES.map((p, i) => (
            <Reveal key={p.img} delay={(i % 3) * 90}>
              <figure className="flex flex-col items-center">
                <div className="relative w-full max-w-[220px]">
                  <div className="overflow-hidden rounded-[1.6rem] border-[5px] border-[#23262e] bg-onyx-1 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]">
                    <img src={p.img} alt={p.alt} loading="lazy" decoding="async"
                      className="aspect-[9/15] w-full object-cover object-top" />
                  </div>
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-ink">{p.label}</span>
                </div>
                <figcaption className="mt-4 text-center text-sm text-paper/70">{p.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
