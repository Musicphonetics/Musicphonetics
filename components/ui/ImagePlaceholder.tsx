import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  /** Internal label so this slot can be found and replaced before launch. */
  label: string;
  className?: string;
  aspect?: "square" | "portrait" | "landscape" | "wide";
  tone?: "paper" | "ink";
}

const aspects = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
};

/**
 * Clearly-labelled visual placeholder for real images added later.
 * TODO(content): replace each placeholder with a real, alt-described image.
 */
export function ImagePlaceholder({
  label,
  className,
  aspect = "landscape",
  tone = "paper",
}: ImagePlaceholderProps) {
  const isInk = tone === "ink";
  return (
    <div
      role="img"
      aria-label={`Image placeholder: ${label}`}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl border",
        aspects[aspect],
        isInk
          ? "border-white/10 bg-white/5"
          : "border-hairline bg-gradient-to-br from-mist to-paper",
        className
      )}
    >
      {/* Decorative hairline grid */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 opacity-40",
          isInk ? "opacity-20" : ""
        )}
        style={{
          backgroundImage:
            "linear-gradient(rgba(22,27,38,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(22,27,38,.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={isInk ? "text-paper/50" : "text-ink/30"}
        >
          <path
            d="M9 18V6l10-2v11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            isInk ? "text-paper/60" : "text-ink/40"
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
