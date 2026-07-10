import Image from "next/image";
import { FOUNDER } from "@/lib/founder";

// A warm, signed note from the Director - shown inside the parent and teacher
// portals so oversight feels personal, not corporate.
const NOTES: Record<"parent" | "teacher", { eyebrow: string; body: string[] }> = {
  parent: {
    eyebrow: "A note from the Director",
    body: [
      "Thank you for trusting us with your child's music. My promise is simple: this will never feel random.",
      "Every class is prepared, every week is tracked, and after each class you'll see exactly what was taught and what's next. If anything ever feels off, message me directly.",
    ],
  },
  teacher: {
    eyebrow: "A note from the Director",
    body: [
      "You're not freelancing here - you're part of a serious teaching network with a standard we hold from the top.",
      "Update your classes honestly, look after every student, and your work is seen, tracked and paid transparently. Grow with us, and I'll back you.",
    ],
  },
};

export function DirectorNote({ variant }: { variant: "parent" | "teacher" }) {
  const n = NOTES[variant];
  return (
    <figure className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gold/40">
          <Image src={FOUNDER.photo} alt={FOUNDER.photoAlt} fill sizes="44px" className="object-cover object-top" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A5E0F]">{n.eyebrow}</p>
          <p className="font-display text-sm font-semibold text-ink">{FOUNDER.name}</p>
        </div>
      </div>
      <blockquote className="mt-3 space-y-2 text-sm leading-relaxed text-ink/80">
        {n.body.map((p) => <p key={p}>{p}</p>)}
      </blockquote>
      <figcaption className="mt-3 text-xs text-ink/55">- Abhishek Kumar, Founder &amp; Director</figcaption>
    </figure>
  );
}
