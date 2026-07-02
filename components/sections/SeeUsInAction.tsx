"use client";

import { useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PERFORMANCES } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Lightweight YouTube facade — shows the thumbnail until the visitor taps play,
 * then mounts the iframe. Avoids loading six players on page load.
 */
function ShortCard({ id, title }: { id: string; title: string }) {
  const [active, setActive] = useState(false);
  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-ink shadow-card">
      {active ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`Play ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt={`${title} — tap to play`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-ink shadow-lg transition-transform duration-300 group-hover:scale-110"
            )}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

export function SeeUsInAction() {
  return (
    <Section id="performances" background="ink" spacing="lg">
      <SectionHeading
        eyebrow="See us in action"
        title="Hear the standard for yourself."
        intro="Short clips from real performances. This is the musicianship behind the method."
        invert
      />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-6">
        {PERFORMANCES.map((p, i) => (
          <Reveal key={p.id} delay={(i % 6) * 60}>
            <ShortCard id={p.id} title={p.title} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
