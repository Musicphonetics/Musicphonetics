import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
}

interface ButtonAsLink extends BaseProps {
  href: string;
  external?: boolean;
  onClick?: never;
  type?: never;
}

interface ButtonAsButton extends BaseProps {
  href?: never;
  external?: never;
  onClick?: () => void;
  type?: "button" | "submit";
}

type ButtonProps = ButtonAsLink | ButtonAsButton;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transition-none motion-reduce:active:scale-100";

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-[#0f131c] shadow-card hover:shadow-card-hover hover:-translate-y-0.5",
  secondary:
    "bg-transparent text-ink border border-hairline hover:border-ink hover:-translate-y-0.5",
  ghost: "bg-transparent text-ink hover:text-deep-gold",
  light:
    "bg-gold text-ink hover:bg-deep-gold shadow-card hover:shadow-card-hover hover:-translate-y-0.5",
};

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    className,
    fullWidth,
  } = props;

  const classes = cn(
    base,
    sizes[size],
    variants[variant],
    fullWidth && "w-full",
    className
  );

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
