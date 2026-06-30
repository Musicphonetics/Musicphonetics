import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Use the light wordmark for dark backgrounds (e.g. the footer). */
  invert?: boolean;
  className?: string;
}

/** Musicphonetics brand wordmark (real logo art). */
export function Logo({ invert = false, className }: LogoProps) {
  const src = invert
    ? "/logo-wordmark-light.webp"
    : "/logo-wordmark-dark.webp";
  // Intrinsic ratios of the supplied art (kept for crisp scaling).
  const width = invert ? 163 : 177;

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center", className)}
      aria-label="Musicphonetics home"
    >
      <Image
        src={src}
        alt="Musicphonetics"
        width={width}
        height={30}
        priority
        className="h-7 w-auto sm:h-8"
      />
    </Link>
  );
}
