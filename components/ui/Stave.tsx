import { cn } from "@/lib/utils";

/** The Musicphonetics "stave" motif — five thin horizontal gold lines. */
export function Stave({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-[21px] w-[124px] opacity-85", className)}
      style={{
        background:
          "repeating-linear-gradient(to bottom, transparent 0 4px, #C9A227 4px 5px)",
      }}
    />
  );
}
