"use client";

import { useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Family video stories.
 *
 * Built now, hidden until the real videos exist (expected next week).
 * Populate REVIEW_VIDEOS with { id, name } and the section reveals itself —
 * we never ship a "coming soon" label.
 */
export type ReviewVideo = { id: string; name: string };

// TODO(content): add real YouTube IDs here when the videos are ready.
export const REVIEW_VIDEOS: ReviewVideo[] = [];

function VideoCard({ id, name }: ReviewVideo) {
  const [active, setActive] = useState(false);
  return (
    <figure className="overflow-hidden rounded-2xl bg-midnight shadow-card">
      <div className="relative aspect-[9/16]">
        {active ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
            title={`${name} — family story`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label={`Play ${name}'s story`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="px-4 py-3 text-sm font-medium text-paper">{name}</figcaption>
    </figure>
  );
}

export function ReviewVideos() {
  // Hidden until real videos exist — no placeholder, no "coming soon".
  if (REVIEW_VIDEOS.length === 0) return null;

  return (
    <Section background="ink" spacing="lg">
      <SectionHeading
        eyebrow="In their words"
        title="Watch our families' stories."
        intro="Real parents and students, on camera."
        invert
      />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {REVIEW_VIDEOS.map((v, i) => (
          <Reveal key={v.id} delay={(i % 4) * 70}>
            <VideoCard {...v} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
