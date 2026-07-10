"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ReviewCard({ file, onOpen, carousel }: { file: string; onOpen: () => void; carousel?: boolean }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-2xl border border-gold/25 bg-[#0e121b] p-2 text-left transition-colors hover:border-gold/50",
        carousel && "w-[85%] snap-start sm:w-[46%] lg:w-[31%]"
      )}
    >
      <span className="absolute left-3 top-3 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-paper/90 backdrop-blur">
        Google Review
      </span>
      {/* Screenshots vary in size; object-contain keeps text readable on dark. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/reviews/${file}`}
        alt="Real Google review from a Musicphonetics parent or student"
        loading="lazy"
        decoding="async"
        className="h-64 w-full rounded-xl object-contain"
      />
    </button>
  );
}

function Lightbox({ file, onClose }: { file: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/reviews/${file}`} alt="Google review, enlarged" className="max-h-[88vh] max-w-full rounded-2xl border border-white/10" onClick={(e) => e.stopPropagation()} />
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-paper hover:bg-white/20">✕</button>
    </div>
  );
}

export function Reviews({ files, variant, showAllHref }: { files: string[]; variant: "carousel" | "grid"; showAllHref?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      {variant === "carousel" ? (
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {files.map((f) => <ReviewCard key={f} file={f} carousel onOpen={() => setOpen(f)} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => <ReviewCard key={f} file={f} onOpen={() => setOpen(f)} />)}
        </div>
      )}
      {showAllHref && (
        <div className="mt-6 text-center">
          <Link href={showAllHref} className="text-sm font-semibold text-gold underline underline-offset-4 hover:text-deep-gold">
            View all reviews →
          </Link>
        </div>
      )}
      {open && <Lightbox file={open} onClose={() => setOpen(null)} />}
    </>
  );
}

// Homepage section wrapper.
export function ReviewsSection({ files }: { files: string[] }) {
  return (
    <section className="bg-ink py-20 text-paper sm:py-28">
      <div className="container-mp">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-gold" />
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-gold">Proof</span>
        </div>
        <h2 className="mt-4 max-w-2xl font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.06] text-paper">
          Families who stayed.
        </h2>
        <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-paper/70">
          Real Google reviews from parents and students - shown exactly as received.
        </p>

        <div className="mt-10">
          <Reviews files={files} variant="carousel" showAllHref="/reviews" />
        </div>
      </div>
    </section>
  );
}
