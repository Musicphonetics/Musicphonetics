import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MediaImage } from "@/lib/media";

type Aspect = "square" | "portrait" | "landscape" | "wide" | "auto";

const aspectClass: Record<Aspect, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  auto: "",
};

interface PhotoProps {
  image: MediaImage;
  aspect?: Aspect;
  className?: string;
  /** Responsive sizes hint for next/image. */
  sizes?: string;
  /** Eager-load above-the-fold images (e.g. the hero). */
  priority?: boolean;
  rounded?: string;
  /** Tailwind object-position, e.g. "object-top". */
  position?: string;
}

/**
 * Lazy-loaded, blur-up image wrapper around next/image.
 * Lazy loading is the default; the inline blurDataURL (see lib/media.ts)
 * gives a soft blur-up without a build-time image pipeline.
 */
export function Photo({
  image,
  aspect = "portrait",
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  rounded = "rounded-2xl",
  position = "object-center",
}: PhotoProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-mist",
        rounded,
        aspect !== "auto" && aspectClass[aspect],
        className
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        placeholder="blur"
        blurDataURL={image.blurDataURL}
        priority={priority}
        className={cn("object-cover", position)}
      />
    </div>
  );
}
