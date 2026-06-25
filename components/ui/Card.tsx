import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Enable a subtle hover lift. */
  hover?: boolean;
  /** Featured cards get a gold ring + slightly stronger shadow. */
  featured?: boolean;
}

export function Card({ children, className, hover, featured }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-hairline bg-white p-6 shadow-card sm:p-8",
        hover && "lift hover:shadow-card-hover",
        featured && "ring-2 ring-gold",
        className
      )}
    >
      {children}
    </div>
  );
}
