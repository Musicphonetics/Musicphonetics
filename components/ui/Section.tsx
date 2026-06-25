import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Background = "paper" | "white" | "mist" | "ink" | "green";

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  /** Inner container className override. */
  innerClassName?: string;
  background?: Background;
  /** Vertical padding scale. */
  spacing?: "sm" | "md" | "lg";
  as?: ElementType;
}

const backgrounds: Record<Background, string> = {
  paper: "bg-paper text-ink",
  white: "bg-white text-ink",
  mist: "bg-mist text-ink",
  ink: "bg-ink text-paper",
  green: "bg-feature-green text-paper",
};

const spacings = {
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-24",
  lg: "py-20 sm:py-32",
};

export function Section({
  children,
  id,
  className,
  innerClassName,
  background = "paper",
  spacing = "md",
  as: Tag = "section",
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(backgrounds[background], spacings[spacing], className)}
    >
      <div className={cn("container-mp", innerClassName)}>{children}</div>
    </Tag>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  invert?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  invert = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className={cn("eyebrow", invert && "text-gold")}>{eyebrow}</p>
      )}
      <h2
        className={cn(
          "mt-3 text-3xl font-semibold leading-tight sm:text-4xl",
          invert ? "text-paper" : "text-ink"
        )}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            invert ? "text-paper/80" : "text-ink/70"
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
